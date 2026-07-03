package com.baluarte.nucleo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Auth por TOKEN nos endpoints REST do Núcleo (Fase C do #316). OPT-IN: só
 * exige token se `nucleo.token` (env `NUCLEO_TOKEN`) estiver definido. Sem token
 * configurado → aberto (dev). `/health` fica sempre livre (liveness).
 *
 * O app manda `X-Nucleo-Token: <token>` (ou `?token=`). WebSocket: ver
 * WebSocketConfig (o token vai no handshake).
 */
@Component
public class TokenAuthFilter extends OncePerRequestFilter {

    private final String token;

    public TokenAuthFilter(@Value("${nucleo.token:}") String token) {
        this.token = token == null ? "" : token.trim();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String p = req.getRequestURI();
        // só protege /api/nucleo/** (menos /health); o resto passa
        return token.isEmpty() || !p.startsWith("/api/nucleo") || p.endsWith("/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String sent = req.getHeader("X-Nucleo-Token");
        if (sent == null) sent = req.getParameter("token");
        if (!token.equals(sent)) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.setContentType("application/json; charset=utf-8");
            res.getWriter().write("{\"error\":\"token inválido\"}");
            return;
        }
        chain.doFilter(req, res);
    }
}
