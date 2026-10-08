# Integração do radar

Esta branch integra no Baluarte a camada web derivada do PLFM_RADAR.

## O que foi portado

- construção de comandos de 4 bytes;
- parsing de pacotes de dados de 11 bytes;
- frame de 64 bins de alcance por 32 bins Doppler;
- magnitude I/Q;
- MTI simples;
- DC notch;
- detector CFAR configurável;
- fonte mock para desenvolvimento sem hardware.

## O que não é executado

Firmware FPGA, drivers FT2232H, Tkinter, NumPy e acesso USB não são executados no navegador. O modo live deverá usar uma bridge local explícita, com validação de origem, porta e permissões.

## Rota

Acesse `#/radar` e clique em `Iniciar mock`. A tela produz um alvo sintético, processa o frame e desenha o heatmap. Isso permite testar a UI e a cadeia matemática sem equipamento físico.

## Origem

Repositório: `CoderTom314/NawfalMotii79-PLFM_RADAR`  
Commit de referência: `8cd5464`  
Método: adaptação da lógica para JavaScript puro, mantendo a página offline e sem dependências novas.
