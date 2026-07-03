package com.baluarte.nucleo.model;

import jakarta.validation.constraints.NotBlank;

/**
 * Comando enviado pelo app (voz transcrita ou texto) ao Núcleo.
 * @param text     o comando em linguagem natural (ex.: "abrir arsenal")
 * @param source   origem (ex.: "mobile", "voice", "watch")
 * @param locale   idioma do comando (ex.: "pt-BR") — opcional
 */
public record JarvisCommand(
        @NotBlank String text,
        String source,
        String locale
) {}
