package com.baluarte.nucleo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testa a API REST do Núcleo (Fase C do #316). Sem `nucleo.token`/`nucleo.hermes.url`
 * (default vazio no teste), o filtro fica aberto e o Hermes desligado — então um
 * comando vira um `JarvisEvent` type=command sem chamada externa.
 */
@SpringBootTest
@AutoConfigureMockMvc
class JarvisControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void health_ok() throws Exception {
        mvc.perform(get("/api/nucleo/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("online"));
    }

    @Test
    void command_viraEvento() throws Exception {
        mvc.perform(post("/api/nucleo/command")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"abrir arsenal\",\"source\":\"test\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("command"))
                .andExpect(jsonPath("$.source").value("test"));
    }

    @Test
    void command_vazio_rejeitado() throws Exception {
        mvc.perform(post("/api/nucleo/command")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"\"}"))
                .andExpect(status().isBadRequest());
    }
}
