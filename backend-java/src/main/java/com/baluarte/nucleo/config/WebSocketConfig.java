package com.baluarte.nucleo.config;

import com.baluarte.nucleo.service.JarvisService;
import com.baluarte.nucleo.socket.JarvisSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Registra o canal WebSocket do Núcleo em `/ws/nucleo`.
 * `setAllowedOriginPatterns("*")` deixa o site (Vercel) e o app conectarem;
 * aperte pra os domínios reais em produção.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final JarvisService jarvis;
    private final ObjectMapper mapper;

    public WebSocketConfig(JarvisService jarvis, ObjectMapper mapper) {
        this.jarvis = jarvis;
        this.mapper = mapper;
    }

    @Bean
    public WebSocketHandler jarvisSocketHandler() {
        return new JarvisSocketHandler(jarvis, mapper);
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(jarvisSocketHandler(), "/ws/nucleo")
                .setAllowedOriginPatterns("*");
    }
}
