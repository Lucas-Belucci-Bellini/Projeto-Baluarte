package com.baluarte.nucleo.model;

import java.time.Instant;

/**
 * Evento que o Núcleo TRANSMITE aos ouvintes (front do Núcleo, outros apps)
 * por WebSocket. É o "pulso de dados" que a UI reage (glitch/bloom, HUD…).
 * @param type     tipo do evento: "command" | "telemetry" | "biometric" | "system"
 * @param source   origem (deviceId ou "nucleo")
 * @param payload  o objeto original (comando/telemetria/biometria) ou um resumo
 * @param ts       epoch millis do servidor
 */
public record JarvisEvent(
        String type,
        String source,
        Object payload,
        long ts
) {
    public static JarvisEvent of(String type, String source, Object payload) {
        return new JarvisEvent(type, source, payload, Instant.now().toEpochMilli());
    }
}
