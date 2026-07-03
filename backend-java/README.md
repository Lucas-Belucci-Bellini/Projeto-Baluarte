# 🧠 Núcleo J.A.R.V.I.S. — backend Java (Spring Boot)

Serviço **aparte** do site (que é Vanilla JS + Vite, estático no Vercel). É a
ponte entre o **app de celular** (comandos de voz, telemetria, biometria) e o
**Núcleo de IA** do Baluarte: recebe payloads por **REST** e retransmite eventos
ao vivo por **WebSocket** para o front do Núcleo escutar e reagir (bloom/glitch/HUD).

> Fase 2 do roadmap **#316**. Este é o **scaffold** — roda e transmite eventos.
> O plug do agente (Hermes/JARVIS), persistência e auth entram nas tarefas do roadmap.

## Rodar (Java 21 + Maven)

```bash
cd backend-java
mvn spring-boot:run          # sobe em http://localhost:8080
```

## Endpoints

| Método | Rota | Corpo | O quê |
|---|---|---|---|
| POST | `/api/nucleo/command`   | `{ "text": "abrir arsenal", "source": "voice" }` | comando de voz/texto |
| POST | `/api/nucleo/telemetry` | `{ "deviceId": "s24", "metrics": { "battery": 0.82 } }` | telemetria do device |
| POST | `/api/nucleo/biometric` | `{ "deviceId": "watch", "heartRate": 72 }` | biometria |
| GET  | `/api/nucleo/health`    | — | `{ status, connections }` |
| WS   | `/ws/nucleo`            | — | canal de eventos ao vivo |

Cada POST vira um **`JarvisEvent`** `{ type, source, payload, ts }` transmitido a
todos os ouvintes do WebSocket.

## Como o FRONT do Núcleo escuta (Vanilla, sem lib)

```js
// src/utils/nucleo-socket.js (a plugar na Fase 2/plumbing do roadmap)
export function connectNucleo(onEvent, base = 'ws://localhost:8080') {
  const ws = new WebSocket(base + '/ws/nucleo');
  ws.onmessage = (e) => { try { onEvent(JSON.parse(e.data)); } catch {} };
  ws.onclose = () => setTimeout(() => connectNucleo(onEvent, base), 2000); // reconecta
  return ws;
}
// uso: connectNucleo(ev => bus.emit('nucleo:event', ev))  → a cena 3D reage
```

O app (Android/iOS) faz o mesmo: abre o WS pra ouvir, e/ou dá `POST` nos endpoints.

## Estrutura

```
src/main/java/com/baluarte/nucleo/
  NucleoApplication.java         # main
  controller/JarvisController    # REST (entradas do app)
  socket/JarvisSocketHandler     # WebSocket (ouvir + receber do app)
  service/JarvisService          # broadcast + ponto de extensão (agente/persistência)
  config/WebSocketConfig         # registra /ws/nucleo
  config/WebConfig               # CORS pro site
  model/                         # JarvisCommand, TelemetryPayload, BiometricPayload, JarvisEvent
```

## Configuração (Fase C — tudo opt-in via env)

| Env | O quê | Default |
|---|---|---|
| `NUCLEO_HERMES_URL` | Endpoint do **agente Hermes** que responde aos comandos (ex.: `https://projeto-baluarte.vercel.app/api/hermes` ou um Ollama). Vazio = só ecoa o comando. | vazio |
| `NUCLEO_HERMES_MODEL` | Modelo (opcional, passado ao endpoint). | vazio |
| `NUCLEO_TOKEN` | Token do operador. Se definido, **REST exige `X-Nucleo-Token`** e **WS exige `?token=`**. Vazio = aberto (dev). | vazio |

Com `NUCLEO_HERMES_URL` setado, um `POST /api/nucleo/command` dispara o Hermes e
o Núcleo **transmite a resposta** como `JarvisEvent` `type=response` (o front/app
recebem a fala do Núcleo). Sem a URL, o comando só vira evento `type=command`.

## Testes

```bash
cd backend-java && mvn test   # JarvisControllerTest: health + command → evento
```

## Deploy

Precisa de host que aguente processo longo + WebSocket (a Vercel serverless não
serve): **Railway / Render / Fly.io / VPS**. Passos:
1. `mvn -q clean package` → `target/nucleo-0.1.0.jar`.
2. Subir o jar (ou um container `eclipse-temurin:21-jre` rodando `java -jar`).
3. Definir as envs acima (`NUCLEO_TOKEN` em produção!).
4. Apontar o front: no app/console → `localStorage['baluarte:nucleo:wsUrl'] =
   'wss://<host>'` (o cliente adiciona `/ws/nucleo`). A barra "Núcleo ao vivo"
   fica verde e a cena passa a pulsar com eventos reais.

Não vai pro deploy do site (está no `.vercelignore`).
