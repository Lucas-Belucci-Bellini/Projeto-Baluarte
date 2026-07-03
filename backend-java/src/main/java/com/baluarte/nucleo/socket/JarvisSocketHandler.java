package com.baluarte.nucleo.socket;

import com.baluarte.nucleo.model.JarvisCommand;
import com.baluarte.nucleo.service.JarvisService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * Handler do canal WebSocket `/ws/nucleo`.
 *
 * DOIS papéis na mesma conexão:
 *  - o FRONT do Núcleo abre e fica OUVINDO os {@link com.baluarte.nucleo.model.JarvisEvent}
 *    transmitidos (broadcast do service);
 *  - o APP pode abrir e MANDAR mensagens (ex.: comando de voz) — que aqui são
 *    parseadas e roteadas pro service, virando evento pra todo mundo.
 *
 * Protocolo de entrada (do app), JSON: { "type": "command", "text": "..." }.
 */
public class JarvisSocketHandler extends TextWebSocketHandler {

    private final JarvisService jarvis;
    private final ObjectMapper mapper;

    public JarvisSocketHandler(JarvisService jarvis, ObjectMapper mapper) {
        this.jarvis = jarvis;
        this.mapper = mapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        jarvis.register(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        jarvis.unregister(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode node = mapper.readTree(message.getPayload());
        String type = node.path("type").asText("");
        if ("command".equals(type)) {
            String text = node.path("text").asText("");
            if (!text.isBlank()) {
                jarvis.handleCommand(new JarvisCommand(text, node.path("source").asText("ws"), node.path("locale").asText(null)));
            }
        }
        // outros tipos (telemetry/biometric por WS) podem ser roteados aqui.
    }
}
