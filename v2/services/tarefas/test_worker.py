"""Worker de tarefas, contra Postgres real.

Fila sem banco não é fila — mock aqui provaria só que o mock funciona. Por isso
todo teste roda contra o schema de verdade, incluindo os que dependem de tempo e
concorrência.

Rodar:  BALUARTE_TEST_DSN=... python3 -m pytest v2/services/tarefas/ -q
"""

from __future__ import annotations

import os
import threading
import time

import psycopg
import pytest
from psycopg.rows import dict_row

from worker import ErroPermanente, Tarefa, Worker, enfileirar

DSN = os.environ.get("BALUARTE_TEST_DSN")
pytestmark = pytest.mark.skipif(not DSN, reason="BALUARTE_TEST_DSN não definido")


@pytest.fixture()
def con():
    with psycopg.connect(DSN, row_factory=dict_row) as c:
        c.autocommit = True
        c.execute("DELETE FROM baluarte.tarefa")
        yield c


def estado(con, tid: int) -> dict:
    return con.execute("SELECT * FROM baluarte.tarefa WHERE id=%s", (tid,)).fetchone()


# ═══════════════ caminho feliz ═══════════════

def test_executa_e_marca_concluida(con):
    tid = enfileirar(con, "somar", {"a": 2, "b": 3})
    w = Worker(DSN, nome="w-teste")
    w.registrar("somar", lambda t: {"total": t.carga["a"] + t.carga["b"]})

    assert w.rodar(max_tarefas=1) == 1
    linha = estado(con, tid)
    assert linha["estado"] == "COMPLETED"
    assert linha["resultado"] == {"total": 5}
    assert linha["erro"] is None
    assert linha["lease_ate"] is None, "lease devia ser liberado ao concluir"


def test_a_carga_chega_ao_handler(con):
    enfileirar(con, "eco", {"texto": "coração"})
    vistos = []
    w = Worker(DSN)
    w.registrar("eco", lambda t: vistos.append(t.carga) or None)
    w.rodar(max_tarefas=1)
    assert vistos == [{"texto": "coração"}]


def test_filtra_por_tipo(con):
    enfileirar(con, "outro", {})
    meu = enfileirar(con, "meu", {})
    w = Worker(DSN, tipos=["meu"])
    w.registrar("meu", lambda t: None)
    w.rodar(max_tarefas=1)
    assert estado(con, meu)["estado"] == "COMPLETED"
    assert estado(con, meu)["estado"] != estado(con, meu)["erro"]


# ═══════════════ falha ═══════════════

def test_excecao_do_handler_nao_derruba_o_worker(con):
    """§6 do plano no lado Python: módulo quebrado não derruba o Core."""
    ruim = enfileirar(con, "explode", {})
    bom = enfileirar(con, "ok", {})
    w = Worker(DSN, backoff_base_seg=0)
    w.registrar("explode", lambda t: (_ for _ in ()).throw(RuntimeError("boom")))
    w.registrar("ok", lambda t: {"ok": True})

    # Com backoff a tarefa ruim sai da frente e a boa roda. Sem backoff, o
    # worker giraria na ruim e `bom` nunca sairia da fila — foi assim que o
    # defeito apareceu.
    assert w.rodar(max_tarefas=2, ate_esvaziar=True) == 2, "o worker parou na primeira falha"
    assert estado(con, ruim)["estado"] == "QUEUED", "devia voltar pra fila"
    assert "boom" in estado(con, ruim)["erro"]
    assert estado(con, bom)["estado"] == "COMPLETED"


def test_erro_permanente_nao_repete(con):
    tid = enfileirar(con, "invalido", {}, max_tentativas=5)
    w = Worker(DSN)
    w.registrar("invalido", lambda t: (_ for _ in ()).throw(ErroPermanente("JSON quebrado")))
    w.rodar(max_tarefas=1)
    linha = estado(con, tid)
    assert linha["estado"] == "FAILED", "repetir não conserta dado inválido"
    assert linha["tentativas"] == 1, "não devia gastar as 5 tentativas"


def test_teto_de_tentativas_vira_FAILED(con):
    tid = enfileirar(con, "sempre-falha", {}, max_tentativas=2)
    # backoff zerado: este teste é sobre o TETO, não sobre a espera entre
    # tentativas — que tem teste próprio abaixo.
    w = Worker(DSN, backoff_base_seg=0)
    w.registrar("sempre-falha", lambda t: (_ for _ in ()).throw(RuntimeError("x")))
    w.rodar(max_tarefas=1)
    assert estado(con, tid)["estado"] == "QUEUED"   # 1ª
    w.rodar(max_tarefas=1)
    assert estado(con, tid)["estado"] == "FAILED"   # 2ª = teto


def test_tipo_sem_handler_falha_na_hora(con):
    """Devolver à fila seria laço infinito: ninguém tem o handler."""
    tid = enfileirar(con, "desconhecido", {}, max_tentativas=9)
    w = Worker(DSN)
    w.rodar(max_tarefas=1)
    linha = estado(con, tid)
    assert linha["estado"] == "FAILED"
    assert "sem handler" in linha["erro"]


# ═══════════════ lease e heartbeat ═══════════════

def test_heartbeat_renova_o_lease_durante_tarefa_longa(con):
    """Sem isto, trabalho longo estoura o lease e a tarefa é reprocessada em
    paralelo — exatamente o que o SKIP LOCKED evitou na entrega."""
    tid = enfileirar(con, "demorada", {})
    leituras = []

    def devagar(t: Tarefa):
        for _ in range(4):
            time.sleep(0.4)
            leituras.append(estado(con, tid)["lease_ate"])
        return None

    w = Worker(DSN, lease_seg=2)          # renova a cada ~1s
    w.registrar("demorada", devagar)
    w.rodar(max_tarefas=1)

    assert max(leituras) > min(leituras), "o lease não foi renovado"
    assert estado(con, tid)["estado"] == "COMPLETED"


def test_parar_interrompe_a_espera_ociosa(con):
    """Worker que ignora SIGTERM por um ciclo transforma deploy em espera."""
    w = Worker(DSN, ocioso_seg=30)
    inicio = time.monotonic()
    threading.Timer(0.3, w.parar).start()
    w.rodar()
    assert time.monotonic() - inicio < 5, "a espera ociosa não foi interrompida"


# ═══════════════ concorrência ═══════════════

def test_workers_paralelos_nao_pegam_a_mesma_tarefa(con):
    for _ in range(60):
        enfileirar(con, "corrida", {})

    pegas: list[int] = []
    trava = threading.Lock()

    def anota(t: Tarefa):
        with trava:
            pegas.append(t.id)
        return None

    def roda(n: int):
        # `ate_esvaziar`: com 6 workers dividindo 60 tarefas, nenhum chega a um
        # teto de 60 — sem isto todos ficariam esperando trabalho para sempre,
        # que é o comportamento CERTO para serviço contínuo e errado para lote.
        w = Worker(DSN, nome=f"w{n}", ocioso_seg=0.05)
        w.registrar("corrida", anota)
        w.rodar(ate_esvaziar=True)

    threads = [threading.Thread(target=roda, args=(i,)) for i in range(6)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=60)

    assert len(pegas) == len(set(pegas)), "a mesma tarefa foi executada duas vezes"
    restantes = con.execute(
        "SELECT count(*) AS n FROM baluarte.tarefa WHERE estado <> 'COMPLETED'"
    ).fetchone()["n"]
    assert restantes == 0, f"{restantes} tarefas ficaram para trás"


def test_dependencia_bloqueia_ate_a_anterior_concluir(con):
    a = enfileirar(con, "primeiro", {})
    b = enfileirar(con, "segundo", {}, depende_de=a)

    # `tipos`: sem o filtro este worker reivindicaria "primeiro" também, não
    # acharia handler e o falharia — testando outra coisa.
    w = Worker(DSN, tipos=["segundo"])
    w.registrar("segundo", lambda t: None)
    # `ate_esvaziar`: nada reivindicável agora é justamente o que se quer
    # afirmar; sem isto o worker esperaria por trabalho, que é o certo em
    # serviço contínuo e trava a asserção.
    assert w.rodar(ate_esvaziar=True) == 0, "executou o dependente antes da dependência"

    w2 = Worker(DSN)
    w2.registrar("primeiro", lambda t: None)
    w2.rodar(max_tarefas=1)
    assert estado(con, a)["estado"] == "COMPLETED"

    assert w.rodar(ate_esvaziar=True) == 1, "não liberou depois da dependência"
    assert estado(con, b)["estado"] == "COMPLETED"


def test_modo_lote_retorna_com_a_fila_vazia(con):
    """Serviço contínuo espera; lote sai. Sem esta distinção, um job de cron
    nunca termina."""
    for _ in range(3):
        enfileirar(con, "lote", {})
    w = Worker(DSN, ocioso_seg=30)          # esperaria 30s por ciclo se travasse
    w.registrar("lote", lambda t: None)
    inicio = time.monotonic()
    assert w.rodar(ate_esvaziar=True) == 3
    assert time.monotonic() - inicio < 10, "não saiu ao esvaziar a fila"


# ═══════════════ backoff ═══════════════

def test_falha_agenda_a_proxima_tentativa_no_futuro(con):
    """O defeito que os testes revelaram: sem backoff, a tarefa que falha volta
    a QUEUED e é reivindicada no mesmo instante. O worker gira nela em laço
    quente, queima as tentativas em milissegundos e mata de fome a fila."""
    tid = enfileirar(con, "falha", {}, max_tentativas=5)
    w = Worker(DSN, backoff_base_seg=5)
    w.registrar("falha", lambda t: (_ for _ in ()).throw(RuntimeError("x")))
    w.rodar(max_tarefas=1)

    linha = estado(con, tid)
    assert linha["estado"] == "QUEUED"
    assert linha["disponivel_em"] > linha["criada_em"], "não agendou espera nenhuma"

    # e enquanto não chega a hora, ninguém reivindica
    assert w.rodar(ate_esvaziar=True) == 0, "reivindicou antes do backoff vencer"


def test_backoff_cresce_com_as_tentativas(con):
    tid = enfileirar(con, "falha", {}, max_tentativas=9)
    w = Worker(DSN, backoff_base_seg=1)
    w.registrar("falha", lambda t: (_ for _ in ()).throw(RuntimeError("x")))

    esperas = []
    for _ in range(3):
        con.execute("UPDATE baluarte.tarefa SET disponivel_em = now() WHERE id=%s", (tid,))
        antes = con.execute("SELECT now() AS t").fetchone()["t"]
        w.rodar(max_tarefas=1)
        linha = estado(con, tid)
        esperas.append((linha["disponivel_em"] - antes).total_seconds())

    assert esperas == sorted(esperas), f"não cresceu: {esperas}"
    assert esperas[-1] > esperas[0], f"1ª e última iguais: {esperas}"
