package com.baluarte.nucleo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Cliente do AGENTE Hermes pro Núcleo (Fase C do #316). Um comando de voz/texto
 * do app é enviado a um endpoint Hermes e a resposta volta pro Núcleo.
 *
 * O endpoint é CONFIGURÁVEL (`nucleo.hermes.url`, ex.: `https://projeto-baluarte
 * .vercel.app/api/hermes` — o proxy do site — ou um Ollama local). Sem URL, fica
 * desligado (o serviço só ecoa o comando, sem resposta de IA). Só usa a stdlib
 * (java.net.http) + Jackson.
 */
@Service
public class HermesClient {

    private static final Logger log = LoggerFactory.getLogger(HermesClient.class);

    private final String url;
    private final String model;
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8)).build();
    private final ObjectMapper mapper;

    public HermesClient(
            @Value("${nucleo.hermes.url:}") String url,
            @Value("${nucleo.hermes.model:}") String model,
            ObjectMapper mapper) {
        this.url = url == null ? "" : url.trim();
        this.model = model == null ? "" : model.trim();
        this.mapper = mapper;
    }

    /** Configurado? (há endpoint Hermes pra chamar) */
    public boolean enabled() {
        return !url.isEmpty();
    }

    /**
     * Pede uma resposta ao Hermes pro texto do comando. Devolve null se
     * desligado ou se falhar (o Núcleo segue funcionando, só sem resposta de IA).
     */
    public String reply(String commandText) {
        if (!enabled() || commandText == null || commandText.isBlank()) return null;
        try {
            var body = mapper.writeValueAsString(Map.of(
                    "system", "Você é o J.A.R.V.I.S., núcleo de IA do Projeto Baluarte. Responda em português, curto e tático.",
                    "model", model,
                    "messages", List.of(Map.of("role", "user", "content", commandText))
            ));
            var req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(55))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            var res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() / 100 != 2) {
                log.warn("Hermes HTTP {}", res.statusCode());
                return null;
            }
            JsonNode n = mapper.readTree(res.body());
            // formato do /api/hermes do site: { resposta }; OpenAI/OpenRouter: { choices:[{message:{content}}] }
            if (n.hasNonNull("resposta")) return n.get("resposta").asText();
            JsonNode choice = n.path("choices").path(0).path("message").path("content");
            return choice.isMissingNode() ? null : choice.asText();
        } catch (Exception e) {
            log.warn("Hermes falhou: {}", e.getMessage());
            return null;
        }
    }
}
