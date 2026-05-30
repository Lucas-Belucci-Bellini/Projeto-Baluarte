# Sentinel — Configuração (PRIVADO)

Sistema oculto de registro de acessos. Não commitar este arquivo com dados reais.

---

## Passo 1 — Criar a planilha

1. Abra https://sheets.google.com
2. Crie uma planilha chamada **"sentinel-baluarte"** (nome qualquer, só você vai ver)
3. Na aba "Plan1", renomeie para **"acessos"**
4. Na primeira linha, coloque os cabeçalhos:
   ```
   Timestamp | Data | Hora | IP | Cidade | Região | País | Lat | Lon | Fingerprint | Tela | Idioma | Fuso | User-Agent | Referência | Rota
   ```

---

## Passo 2 — Criar o Apps Script

1. Na planilha, vá em **Extensões → Apps Script**
2. Apague todo o código existente e cole este:

```javascript
const SHEET_NAME = 'acessos';
const ALLOWED_SALT = 'COLOQUE_AQUI_UMA_STRING_SECRETA_QUALQUER'; // ex: "mk13-alpha-7x"

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.s !== ALLOWED_SALT) {
      return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    sheet.appendRow([
      data.ts,
      data.data,
      data.hora,
      data.ip,
      data.cidade,
      data.regiao,
      data.pais,
      data.lat,
      data.lon,
      data.fp,
      data.tela,
      data.lang,
      data.tz,
      data.ua,
      data.ref,
      data.rota
    ]);

    return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}
```

3. Salve (Ctrl+S)

---

## Passo 3 — Publicar como Web App

1. Clique em **Implantar → Nova implantação**
2. Tipo: **App da Web**
3. Executar como: **Eu** (sua conta Google)
4. Quem tem acesso: **Qualquer pessoa**
5. Clique em **Implantar**
6. Copie a URL gerada — parece com:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXXXX/exec
   ```

---

## Passo 4 — Configurar no site

Abra o arquivo `src/utils/hx-beacon.js` e substitua:

```js
ep: '__HX_ENDPOINT__',   // → cole a URL do Apps Script aqui
salt: '__HX_SALT__'       // → coloque a mesma string do ALLOWED_SALT aqui
```

Depois commit + push para o main.

---

## Segurança

- A planilha é privada (só sua conta vê)
- O salt impede que qualquer pessoa que descubra o endpoint injete dados falsos
- O módulo no site tem nome neutro (`hx-beacon`) e não aparece em nenhuma documentação
- `sendBeacon` não bloqueia o carregamento da página e não gera erro visível
- Dados são registrados 1x por sessão (deduplicação por fingerprint+dia via sessionStorage)
