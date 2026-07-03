package com.baluarte.nucleo.model;

/**
 * Amostra biométrica do operador vinda do app/wearable.
 * @param deviceId   aparelho de origem
 * @param heartRate  batimentos por minuto (bpm), ou null se não medido
 * @param spo2       saturação de oxigênio (%), ou null
 * @param stress     índice de estresse 0..1 (derivado), ou null
 * @param capturedAt epoch millis da captura no dispositivo
 */
public record BiometricPayload(
        String deviceId,
        Integer heartRate,
        Integer spo2,
        Double stress,
        Long capturedAt
) {}
