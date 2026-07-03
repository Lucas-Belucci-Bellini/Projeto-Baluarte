package com.baluarte.nucleo.controller;

import com.baluarte.nucleo.model.BiometricPayload;
import com.baluarte.nucleo.model.JarvisCommand;
import com.baluarte.nucleo.model.JarvisEvent;
import com.baluarte.nucleo.model.TelemetryPayload;
import com.baluarte.nucleo.service.JarvisService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API REST do Núcleo — é por aqui que o APP DE CELULAR envia payloads.
 *
 *   POST /api/nucleo/command    { text, source?, locale? }
 *   POST /api/nucleo/telemetry  { deviceId, metrics }
 *   POST /api/nucleo/biometric  { deviceId, heartRate?, spo2?, stress?, capturedAt? }
 *   GET  /api/nucleo/health     → { status, connections }
 *
 * Cada POST vira um JarvisEvent transmitido por WebSocket ao front do Núcleo.
 * O CORS liberado (WebConfig) deixa o site na Vercel chamar isto direto.
 */
@RestController
@RequestMapping("/api/nucleo")
public class JarvisController {

    private final JarvisService jarvis;

    public JarvisController(JarvisService jarvis) {
        this.jarvis = jarvis;
    }

    @PostMapping("/command")
    public JarvisEvent command(@Valid @RequestBody JarvisCommand cmd) {
        return jarvis.handleCommand(cmd);
    }

    @PostMapping("/telemetry")
    public JarvisEvent telemetry(@RequestBody TelemetryPayload payload) {
        return jarvis.handleTelemetry(payload);
    }

    @PostMapping("/biometric")
    public JarvisEvent biometric(@RequestBody BiometricPayload payload) {
        return jarvis.handleBiometric(payload);
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "online",
                "service", "nucleo-jarvis",
                "connections", jarvis.connections()
        );
    }
}
