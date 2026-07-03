package com.baluarte.nucleo.model;

import java.util.Map;

/**
 * Telemetria do dispositivo (bateria, rede, GPS, sensores…). Campos livres em
 * `metrics` pra o app mandar o que tiver, sem travar o contrato.
 * @param deviceId  identificador do aparelho
 * @param metrics   pares nome→valor (ex.: {"battery":0.82,"lat":-23.5,"lon":-46.6})
 */
public record TelemetryPayload(
        String deviceId,
        Map<String, Object> metrics
) {}
