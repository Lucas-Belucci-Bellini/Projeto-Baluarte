"""Task Manager — o worker que consome a fila do Postgres.

Fundação, não bot. Referências: docs/v2/V2_DECISION_LOG.md (Decisão 6),
v2/data/migrations/001_fundacao.sql.

── Por que o Task Manager vem antes dos bots ───────────────────────────────
A Decisão 6 diz que os bots formam um ecossistema, não uma fila, e que sem
gerente de tarefas eles "criam trabalho infinitamente e o sistema vira tempestade
de processos". Um bot escrito antes da fila vira script solto — e script solto é
exatamente o que se está tentando não ter em 2030 com centenas deles.

── As três coisas que este arquivo resolve, e que nenhum bot deveria reescrever ─

**Heartbeat.** O banco entrega a tarefa com um lease. Trabalho longo estoura o
lease e a tarefa volta para a fila enquanto ainda está sendo executada — dois
workers no mesmo trabalho, que é justamente o que o SKIP LOCKED evitou na
entrega. Por isso o lease é renovado em thread separada durante a execução.

**Desligamento gracioso.** SIGTERM no meio de uma tarefa não pode deixá-la
RUNNING órfã. O worker para de reivindicar, termina a que está na mão e sai. Sem
isso, todo deploy criaria lixo que só o reaper limparia minutos depois.

**Falha é registrada, não engolida.** Handler que levanta exceção devolve a
tarefa com o erro no banco (Regra 7: erro observável). Acima do teto de
tentativas, FAILED — o banco decide isso, não o worker.

── O que este arquivo NÃO faz ──────────────────────────────────────────────
Não sabe nada sobre coletar, classificar ou verificar. Handlers se registram; o
worker só orquestra. É a Regra 33 (limites claros): o dia em que este arquivo
souber o que é uma Wiki, ele virou o módulo que faz tudo.
"""

from __future__ import annotations

import logging
import os
import signal
import threading
import time
import uuid
from dataclasses import dataclass
from typing import Any, Callable

import psycopg
from psycopg.rows import dict_row, tuple_row

log = logging.getLogger("baluarte.tarefas")

# Renova o lease quando resta menos de metade dele. Cedo demais é conversa fiada
# com o banco; tarde demais é corrida com o reaper.
FRACAO_RENOVACAO = 0.5


@dataclass(frozen=True)
class Tarefa:
    id: int
    tipo: str
    carga: dict[str, Any]
    tentativas: int
    origem: str | None = None


# Handler recebe a tarefa e devolve o resultado (ou None).
Handler = Callable[[Tarefa], dict[str, Any] | None]


class ErroPermanente(Exception):
    """Falha que repetir não conserta — URL 404, payload malformado.

    Existe porque o padrão (repetir até o teto) é certo para rede instável e
    errado para dado inválido: três tentativas de parsear o mesmo JSON quebrado
    gastam três vezes e falham três vezes. Handler que sabe que não adianta
    levanta isto, e a tarefa vai direto para FAILED.
    """


class Worker:
    """Consome a fila. Um processo pode rodar vários; o banco coordena."""

    def __init__(
        self,
        dsn: str,
        *,
        nome: str | None = None,
        tipos: list[str] | None = None,
        lease_seg: int = 300,
        ocioso_seg: float = 2.0,
        backoff_base_seg: int = 5,
    ) -> None:
        self.dsn = dsn
        # O nome identifica a linha no banco. Sem o sufixo aleatório, duas
        # réplicas do mesmo deploy seriam indistinguíveis no diagnóstico.
        self.nome = nome or f"{os.uname().nodename}/{uuid.uuid4().hex[:8]}"
        self.tipos = tipos
        self.lease_seg = lease_seg
        self.ocioso_seg = ocioso_seg
        # base do backoff exponencial: 2^tentativas * base, com teto de 300s
        self.backoff_base_seg = backoff_base_seg
        self._handlers: dict[str, Handler] = {}
        self._parar = threading.Event()

    # ── registro ────────────────────────────────────────────────────────
    def registrar(self, tipo: str, handler: Handler) -> None:
        if tipo in self._handlers:
            raise ValueError(f"já existe handler para {tipo!r}")
        self._handlers[tipo] = handler

    def handler_de(self, tipo: str) -> Handler | None:
        return self._handlers.get(tipo)

    # ── ciclo ───────────────────────────────────────────────────────────
    def parar(self, *_: Any) -> None:
        """Idempotente: SIGTERM seguido de SIGINT não deve explodir."""
        self._parar.set()

    def instalar_sinais(self) -> None:
        for sig in (signal.SIGTERM, signal.SIGINT):
            signal.signal(sig, self.parar)

    def rodar(self, *, max_tarefas: int | None = None, ate_esvaziar: bool = False) -> int:
        """Laço principal.

        `ate_esvaziar=True` retorna quando não houver mais o que reivindicar, em
        vez de esperar por trabalho novo. É o modo de **lote**: job por cron,
        drenagem antes de um scale-down, execução em CI.

        ⚠️ "Vazia" aqui significa *nada reivindicável agora* — não *nada a
        fazer*. Com vários workers, o que este não pegou pode estar em execução
        noutro, e uma tarefa que falhe volta para a fila depois deste ter saído.
        Para serviço contínuo use o padrão (`False`), que espera.

        `max_tarefas` limita quantas processar; útil em teste e em lote com teto.
        """
        feitas = 0
        with psycopg.connect(self.dsn, row_factory=dict_row) as con:
            con.autocommit = True
            while not self._parar.is_set():
                if max_tarefas is not None and feitas >= max_tarefas:
                    break
                tarefa = self._reivindicar(con)
                if tarefa is None:
                    if ate_esvaziar:
                        break
                    # Espera interrompível: `wait` acorda no sinal, `sleep` não —
                    # e um worker que ignora SIGTERM por 2s por ciclo transforma
                    # deploy em espera.
                    self._parar.wait(self.ocioso_seg)
                    continue
                self._executar(con, tarefa)
                feitas += 1
        return feitas

    # ── passos ──────────────────────────────────────────────────────────
    def _reivindicar(self, con: psycopg.Connection) -> Tarefa | None:
        cur = con.execute(
            "SELECT * FROM baluarte.reivindicar_tarefa(%s, %s, %s)",
            (self.nome, self.lease_seg, self.tipos),
        )
        linha = cur.fetchone()
        if not linha:
            return None
        return Tarefa(
            id=linha["id"],
            tipo=linha["tipo"],
            carga=linha["carga"] or {},
            tentativas=linha["tentativas"],
            origem=linha.get("origem"),
        )

    def _executar(self, con: psycopg.Connection, tarefa: Tarefa) -> None:
        handler = self._handlers.get(tarefa.tipo)
        if handler is None:
            # Devolver à fila seria um laço infinito: nenhum worker sem o handler
            # vai conseguir, e a tarefa giraria até o teto. Falhar na hora diz a
            # verdade e para.
            self._falhar(con, tarefa, f"sem handler para tipo {tarefa.tipo!r}", permanente=True)
            return

        pulsando = _Heartbeat(self.dsn, tarefa.id, self.lease_seg)
        pulsando.start()
        try:
            resultado = handler(tarefa)
            self._concluir(con, tarefa, resultado)
        except ErroPermanente as err:
            log.warning("tarefa %s falhou de vez: %s", tarefa.id, err)
            self._falhar(con, tarefa, str(err), permanente=True)
        except Exception as err:  # noqa: BLE001 — a fronteira engole tudo de propósito
            # Handler não pode derrubar o worker: é o §6 do plano (módulo quebrado
            # não derruba o Core) aplicado ao lado Python.
            log.exception("tarefa %s levantou", tarefa.id)
            self._falhar(con, tarefa, f"{type(err).__name__}: {err}", permanente=False)
        finally:
            pulsando.parar()

    def _concluir(self, con, tarefa: Tarefa, resultado) -> None:
        con.execute(
            """UPDATE baluarte.tarefa
                  SET estado='COMPLETED', concluida_em=now(), lease_ate=NULL,
                      resultado=%s, erro=NULL
                WHERE id=%s""",
            (psycopg.types.json.Jsonb(resultado) if resultado is not None else None, tarefa.id),
        )

    def _falhar(self, con, tarefa: Tarefa, erro: str, *, permanente: bool) -> None:
        # QUEM decide entre repetir e desistir é o BANCO, comparando tentativas
        # com max_tentativas. Se o worker decidisse, dois workers com configuração
        # diferente dariam veredictos diferentes para a mesma tarefa.
        con.execute(
            """UPDATE baluarte.tarefa
                  SET estado = CASE
                        WHEN %s THEN 'FAILED'
                        WHEN tentativas >= max_tentativas THEN 'FAILED'
                        ELSE 'QUEUED' END,
                      erro = %s, worker = NULL, lease_ate = NULL,
                      -- Backoff exponencial com teto de 5 min. Sem ele a tarefa
                      -- volta à fila e é reivindicada no mesmo instante: laço
                      -- quente que queima as tentativas em milissegundos e mata
                      -- de fome as outras tarefas. Foi um teste que mostrou —
                      -- a tarefa boa nunca chegava a rodar.
                      disponivel_em = now() + make_interval(
                        secs => least(300, power(2, tentativas)::int * %s))
                WHERE id = %s""",
            (permanente, erro, self.backoff_base_seg, tarefa.id),
        )


class _Heartbeat(threading.Thread):
    """Renova `lease_ate` enquanto a tarefa roda.

    Conexão própria de propósito: a do worker está ocupada com o handler, e
    compartilhar conexão entre threads em psycopg é corrida garantida.
    """

    def __init__(self, dsn: str, tarefa_id: int, lease_seg: int) -> None:
        super().__init__(daemon=True, name=f"heartbeat-{tarefa_id}")
        self.dsn, self.tarefa_id, self.lease_seg = dsn, tarefa_id, lease_seg
        self._parar = threading.Event()

    def run(self) -> None:
        intervalo = max(1.0, self.lease_seg * FRACAO_RENOVACAO)
        while not self._parar.wait(intervalo):
            try:
                with psycopg.connect(self.dsn) as con:
                    con.autocommit = True
                    con.execute(
                        """UPDATE baluarte.tarefa
                              SET lease_ate = now() + make_interval(secs => %s)
                            WHERE id = %s AND estado = 'RUNNING'""",
                        (self.lease_seg, self.tarefa_id),
                    )
            except Exception:  # noqa: BLE001
                # Falhar aqui não pode matar a tarefa: o pior caso é o lease
                # vencer e outro worker reprocessar — recuperável. Derrubar o
                # trabalho em curso por causa de um blip de rede não é.
                log.warning("heartbeat falhou para tarefa %s", self.tarefa_id, exc_info=True)

    def parar(self) -> None:
        self._parar.set()


def enfileirar(
    con: psycopg.Connection,
    tipo: str,
    carga: dict[str, Any] | None = None,
    *,
    prioridade: int = 100,
    origem: str | None = None,
    depende_de: int | None = None,
    max_tentativas: int = 3,
) -> int:
    """Cria uma tarefa. É a única porta de entrada da fila.

    O cursor fixa `tuple_row` em vez de herdar o da conexão: quem chama pode ter
    configurado `dict_row` (é o normal em código de aplicação), e aí um
    `fetchone()[0]` estoura com `KeyError: 0`. Uma função de biblioteca não pode
    depender da configuração de quem a chama.
    """
    with con.cursor(row_factory=tuple_row) as cur:
        cur.execute(
            """INSERT INTO baluarte.tarefa (tipo, carga, prioridade, origem, depende_de, max_tentativas)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
            (tipo, psycopg.types.json.Jsonb(carga or {}), prioridade, origem, depende_de, max_tentativas),
        )
        return cur.fetchone()[0]
