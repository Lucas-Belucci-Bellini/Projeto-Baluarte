package com.baluarte.nucleo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Núcleo J.A.R.V.I.S. — ponto de entrada do serviço.
 *
 * Serviço APARTE do site (que é Vanilla/Vercel): recebe payloads do app de
 * celular (comandos de voz, telemetria, biometria) por REST e retransmite
 * eventos ao vivo, por WebSocket, para o front do Núcleo escutar.
 *
 * Rodar: `mvn spring-boot:run` (Java 21). Porta padrão 8080 (application.yml).
 */
@SpringBootApplication
public class NucleoApplication {
    public static void main(String[] args) {
        SpringApplication.run(NucleoApplication.class, args);
    }
}
