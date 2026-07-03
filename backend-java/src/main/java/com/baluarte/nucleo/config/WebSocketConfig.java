package com.baluarte.nucleo.config;

import com.baluarte.nucleo.service.JarvisService;
import com.baluarte.nucleo.socket.JarvisSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Registra o canal WebSocket do Núcleo em `/ws/nucleo`.
 * `setAllowedOriginPatterns("*")` deixa o site (Vercel) e o app conectarem;
 * aperte pra os domínios reais em produção. Se `nucleo.token` estiver definido,
 * o handshake exige `?token=` na URL (opt-in, igual ao REST).
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final JarvisService jarvis;
    private final ObjectMapper mapper;
    private final String token;

    public WebSocketConfig(JarvisService jarvis, ObjectMapper mapper, @Value("${nucleo.token:}") String token) {
        this.jarvis = jarvis;
        this.mapper = mapper;
        this.token = token == null ? "" : token.trim();
    }

    @Bean
    public WebSocketHandler jarvisSocketHandler() {
        return new JarvisSocketHandler(jarvis, mapper);
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(jarvisSocketHandler(), "/ws/nucleo")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest req, ServerHttpResponse res,
                                                   WebSocketHandler h, Map<String, Object> attrs) {
                        if (token.isEmpty()) return true;   // aberto (dev)
                        String q = req.getURI().getQuery();
                        boolean ok = q != null && q.matches("(^|.*&)token=" + java.util.regex.Pattern.quote(token) + "(&.*|$)");
                        if (!ok) res.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                        return ok;
                    }
                    @Override
                    public void afterHandshake(ServerHttpRequest req, ServerHttpResponse res, WebSocketHandler h, Exception ex) { }
                });
    }
}
