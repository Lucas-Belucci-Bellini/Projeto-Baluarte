# Operação do monitor de commits — capacidade de 5.000/semana

## Capacidade de referência

O requisito mínimo é de 5.000 commits por semana, aproximadamente 714 commits por dia ou 29,8 commits por hora em média. A média não substitui testes de pico: o monitor deve continuar correto quando vários commits chegam em uma janela curta.

O backend agrega até 20.000 commits em 14 dias, enquanto a interface renderiza 14 barras diárias e até 20 commits textuais. O número de commits visíveis não é a capacidade de ingestão.

## Métricas prioritárias

| Área | Métrica | O que indica | Alerta sugerido |
| --- | --- | --- | --- |
| Ingestão | Commits agregados por requisição | Carga efetiva do ciclo | Registrar p50/p95 e pico; investigar saturação próxima do teto. |
| Cobertura | `activityTruncated` | Se a série perdeu commits por limite | Qualquer `true` é alerta; aumentar janela/teto ou iniciar retenção por dia. |
| Cursor | Idade do último SHA visto | Atraso do monitor | Avisar quando exceder 2 ciclos; crítico após 4 ciclos. |
| Latência | p50/p95/p99 do endpoint de commits | Custo percebido e caudas lentas | Investigar p95 acima do intervalo entre polls. |
| Cache | Hit rate por SHA | Eficiência da série agregada | Avisar quando o hit rate cair sem aumento real de commits. |
| CPU | Uso do processo e load average | Saturação de CPU | Avisar em >70% sustentado por 5 min; crítico em >85%. |
| Memória | RSS/heap e pico por ciclo | Vazamento ou materialização excessiva | Avisar em >70% do limite; crítico em >85%; reinício/OOM é incidente. |
| I/O | Leitura de JSONL, tempo de `git`, page faults | Gargalo de disco ou Git | Comparar com p95; investigar crescimento sem aumento da carga. |
| Rede/API | Taxa 2xx, 4xx, 5xx, 429 e timeout | Saúde do GitHub/API | Alertar 5xx/timeout; tratar 429 com backoff e limite de taxa. |
| Resiliência | Falhas parciais por repositório | Alcance da degradação | Um erro deve ficar registrado sem apagar repositórios saudáveis. |
| Frontend | Idade do snapshot, ciclos sobrepostos e DOM criado | Frescor e estabilidade visual | Nenhum ciclo sobreposto; snapshot stale deve ser visível. |

## CPU e memória no servidor

Para CPU, registrar uso percentual do processo do backend, `load1/load5/load15`, tempo de CPU por agregação e eventuais throttles do container. O dado mais importante é o p95 da agregação fria; as leituras aquecidas pelo cache devem ser acompanhadas separadamente.

Para memória, registrar RSS do processo, heap da aplicação quando disponível, pico de RSS por ciclo, page faults e eventos de OOM. Não usar apenas a memória livre do host: um processo pode crescer até o limite do container mesmo quando o host ainda parece folgado.

## Resiliência e observabilidade

Cada requisição deve registrar um identificador de ciclo, SHA anterior, SHA novo, quantidade de commits recebidos, quantidade agregada, `activityTruncated`, duração, CPU, RSS e erro classificado. O log não deve conter tokens nem payloads sensíveis.

O monitor deve preservar o último snapshot válido. Falha do gráfico não deve impedir status/sessões/eventos; falha do monitor não deve apagar o último gráfico. A recuperação deve ser medida pelo tempo até o próximo ciclo bem-sucedido.

## Benchmark registrado

O benchmark `scripts/benchmark_commit_monitor.py` cria um Git temporário com 5.000 commits distribuídos em sete dias e executa a agregação real do backend. A execução validada apresentou 5.000 commits agregados, 14 dias, `activityTruncated=False`, aproximadamente 254 ms na primeira agregação, cerca de 73% de CPU do processo durante a agregação e pico de RSS do processo de aproximadamente 80,5 MiB. O cache apresentou p95 abaixo de 0,003 ms no ambiente de teste.

Esses números são baseline do sandbox, não promessa de produção. Em produção, medir a mesma série sob o runtime, CPU, disco e limites de memória reais.
