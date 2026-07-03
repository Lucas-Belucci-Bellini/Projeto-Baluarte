package com.baluarte.nucleo.service;

import com.baluarte.nucleo.model.BiometricPayload;
import com.baluarte.nucleo.model.JarvisCommand;
import com.baluarte.nucleo.model.JarvisEvent;
import com.baluarte.nucleo.model.TelemetryPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cérebro do Núcleo (server-side). Guarda as sessões WebSocket abertas (front do
 * Núcleo + apps) e RETRANSMITE cada payload recebido como um {@link JarvisEvent}.
 *
 * Aqui é o ponto de extensão: hoje só faz eco/broadcast; amanhã pluga o agente
 * Hermes (chamar o /api/hermes ou um runtime local), persistência, regras, etc.
 */
@Service
public class JarvisService {

    private static final Logger log = LoggerFactory.getLogger(JarvisService.class);

    /** Sessões vivas (thread-safe). */
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final ObjectMapper mapper;
    private final HermesClient hermes;
    /* Pool pequeno pra não bloquear o request/WS enquanto o Hermes pensa. */
    private final java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newFixedThreadPool(2);

    public JarvisService(ObjectMapper mapper, HermesClient hermes) {
        this.mapper = mapper;
        this.hermes = hermes;
    }

    /* ---- ciclo de vida das conexões (chamado pelo handler WS) ---- */
    public void register(WebSocketSession session) {
        sessions.add(session);
        log.info("Núcleo: sessão conectada {} (total={})", session.getId(), sessions.size());
        send(session, JarvisEvent.of("system", "nucleo", "conectado ao Núcleo J.A.R.V.I.S."));
    }

    public void unregister(WebSocketSession session) {
        sessions.remove(session);
        log.info("Núcleo: sessão saiu {} (total={})", session.getId(), sessions.size());
    }

    public int connections() {
        return sessions.size();
    }

    /* ---- entradas (REST ou WS) → viram eventos transmitidos ---- */
    public JarvisEvent handleCommand(JarvisCommand cmd) {
        String src = cmd.source() != null ? cmd.source() : "mobile";
        log.info("Núcleo: comando de {} → \"{}\"", src, cmd.text());
        JarvisEvent ev = JarvisEvent.of("command", src, cmd);
        broadcast(ev);
        /* AGENTE Hermes (Fase C): responde ao comando (assíncrono) e transmite a
         * resposta como evento — o app/front recebem a fala do Núcleo. */
        if (hermes.enabled()) {
            pool.submit(() -> {
                String answer = hermes.reply(cmd.text());
                if (answer != null && !answer.isBlank()) {
                    broadcast(JarvisEvent.of("response", "nucleo", Map.of("text", answer, "to", src)));
                }
            });
        }
        return ev;
    }

    public JarvisEvent handleTelemetry(TelemetryPayload t) {
        JarvisEvent ev = JarvisEvent.of("telemetry", t.deviceId(), t);
        broadcast(ev);
        return ev;
    }

    public JarvisEvent handleBiometric(BiometricPayload b) {
        JarvisEvent ev = JarvisEvent.of("biometric", b.deviceId(), b);
        broadcast(ev);
        return ev;
    }

    /** Envia um evento a TODOS os ouvintes conectados. */
    public void broadcast(JarvisEvent event) {
        final String json;
        try {
            json = mapper.writeValueAsString(event);
        } catch (IOException e) {
            log.error("Núcleo: falha ao serializar evento", e);
            return;
        }
        TextMessage msg = new TextMessage(json);
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                try {
                    synchronized (s) { s.sendMessage(msg); }
                } catch (IOException e) {
                    log.warn("Núcleo: falha ao enviar para {} — removendo", s.getId());
                    sessions.remove(s);
                }
            }
        }
    }

    private void send(WebSocketSession session, JarvisEvent event) {
        try {
            synchronized (session) { session.sendMessage(new TextMessage(mapper.writeValueAsString(event))); }
        } catch (IOException e) {
            log.warn("Núcleo: falha no envio inicial para {}", session.getId());
        }
    }
}
