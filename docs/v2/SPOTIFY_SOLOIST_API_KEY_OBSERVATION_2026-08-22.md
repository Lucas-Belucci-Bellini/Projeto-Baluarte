# Spotify Soloist API Key — observação oficial

**Data:** 2026-08-22
**Escopo:** interpretar a credencial exibida pelo usuário sem copiar ou publicar o valor
**Status:** documentação externa coletada; nenhuma chave foi armazenada no repositório, frontend, log ou chat

## Identificação

A credencial exibida como `Spotify Soloist API Key` com prefixo `spak_` corresponde ao produto **Spotify Soloist**, não ao Client ID de um aplicativo Spotify Web API. A chave é criada no Spotify for Developers e é pessoal para a conta que a gerou; a conta precisa ter Spotify Premium.

## Regra oficial de uso

A documentação oficial determina que a chave seja tratada como segredo. Ela não deve ser compartilhada com outros usuários, publicada, embutida em aplicações client-side ou incluída em scripts distribuídos. A chave é passada ao daemon local `soloist` na inicialização, preferencialmente por variável de ambiente privada ou secret manager. Ela não é um token OAuth de playback e não deve ser enviada pelo navegador para o JARVIS web.

O Spotify Soloist usa uma sessão Spotify Connect separada, criada quando o aplicativo Spotify seleciona o dispositivo Soloist. A chave é necessária na inicialização do daemon, inclusive quando a sessão já foi restaurada. A integração local pode observar playback pelo `soloist ctl now --json`, `soloist ctl trace` ou WebSocket local.

## Limite de segurança para o Projeto-Baluarte

O JARVIS público em Vercel não deve aceitar ou persistir essa chave. O uso correto, se desejado, é um processo local protegido — ou backend privado aprovado — que inicia o daemon com a chave fora do Git e fora do browser, e expõe ao JARVIS somente estado de playback redigido e read-only. O WebSocket do Soloist não fornece autenticação, autorização, TLS, validação de Origin, proteção CSRF ou política de exposição de rede; portanto, deve ficar preso a loopback e atrás de uma ponte local explicitamente autenticada antes de qualquer integração.

Não será implementado comando de reprodução, controle de volume, transmissão, sincronização de conteúdo ou compartilhamento de áudio nesta etapa. A reação visual do Mark XIII pode consumir somente metadados bounded (`playing`, `paused`, `unknown`, título/artista opcionais) produzidos por uma ponte local segura.

## Ações não executadas

A chave mostrada na imagem não foi copiada para arquivo, variável, processo, URL, issue, commit ou frontend. Nenhum daemon Soloist foi iniciado, nenhum arquivo binário foi baixado e nenhum WebSocket externo foi aberto. Nenhuma credencial do usuário foi solicitada no chat.

## Referências

1. [Spotify Soloist — Authentication](https://developer.spotify.com/documentation/soloist/concepts/authentication).
2. [Spotify Soloist — Getting Started](https://developer.spotify.com/documentation/soloist/tutorials/getting-started).
3. [Spotify Soloist — Basic Integration](https://developer.spotify.com/documentation/soloist/howtos/basic-integration).

## Contrato de observação confirmado

`soloist ctl now --json` imprime o JSON bruto de `playback_state`. O estado documentado contém `status` (`idle`, `playing`, `paused` ou `buffering`), item atual, posição (`position_ms`, `timestamp_ms`, `speed`), e metadados aninhados em `item.decorations.identity.name`, `item.creators[].entity.decorations.identity.name` e `item.decorations.playback.duration_ms`. Para o JARVIS, a ponte deve extrair somente título, primeiro artista, posição e duração, limitando e validando todos os valores.

O daemon pode expor WebSocket local somente quando iniciado com `--ws`; a documentação recomenda bind em loopback. A API local não possui autenticação própria e também oferece comandos de controle, por isso a ponte do Baluarte deve implementar uma allowlist que aceite apenas leitura de estado, nunca encaminhando `play`, `pause`, `seek`, volume, fila, ativação ou qualquer outro comando.

Os códigos do `soloist ctl` são `0` para sucesso, `1` para argumentos inválidos, `2` para falha de conexão e `3` para erro do servidor, como ausência de sessão ou resposta. O daemon pode terminar com `10` quando o build expira. Esses estados devem aparecer como `unknown`/`degraded`, nunca como música pausada por inferência.

## Referências adicionais

4. [Spotify Soloist — soloist ctl command line](https://developer.spotify.com/documentation/soloist/reference/soloist-ctl).
5. [Spotify Soloist — WebSocket API](https://developer.spotify.com/documentation/soloist/reference/websocket-api).

## Procedimento operacional seguro

A chave mostrada na imagem deve ser tratada como potencialmente exposta. O procedimento recomendado é revogá-la ou rotacioná-la manualmente no painel Spotify for Developers antes de usar o Soloist. Esta auditoria não executou essa ação e não copia o valor para nenhum lugar.

Para uma execução local, o operador deve inserir a chave diretamente no ambiente privado do daemon, sem colocá-la no repositório, no browser ou na linha de comando visível. Um exemplo seguro de shell é:

```sh
read -r -s SOLOIST_API_KEY
export SOLOIST_API_KEY
soloist --api-key "$SOLOIST_API_KEY" --ws 127.0.0.1:9090
```

Em outro processo local, a ponte pode ser iniciada com um token independente, gerado e mantido somente no ambiente local:

```sh
export BALUARTE_SOLOIST_BRIDGE_TOKEN="$(openssl rand -hex 24)"
export BALUARTE_ALLOWED_ORIGIN="http://127.0.0.1:5173"
npm run spotify:soloist:bridge
```

A ponte expõe somente `GET /v1/spotify/playback` em `127.0.0.1:18791`, exige `x-baluarte-bridge-token`, executa `soloist ctl now --json` e devolve apenas playback, título, artista, posição, duração e a marca `readOnly`. Ela não recebe nem repassa a API key. O monitor TypeScript rejeita endpoints externos e trata falhas como `unknown`/indisponível.

A página pública HTTPS da Vercel não deve chamar diretamente uma ponte HTTP local. Para desenvolvimento, use a aplicação local na origem HTTP loopback correspondente; para produção, seria necessário um backend privado aprovado, com revisão adicional de autenticação, custo e exposição. Nenhuma ponte de produção foi criada nesta etapa.
