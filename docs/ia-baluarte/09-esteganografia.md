# 09 — Esteganografia (ferramenta separada)

Ideia independente da IA, mas que o Lucas explorou e quer guardar: um
**gerador/editor de esteganografia** — esconder texto **dentro de uma foto**.

> O Baluarte já cita esteganografia na CiberSeg; isto aqui é a especificação
> de uma ferramenta dedicada que esconde/revela mensagens de verdade.

## Como funciona — técnica LSB (Least Significant Bit)

- Cada pixel tem 3 cores (R, G, B); cada cor é um byte (`10101101`).
- Troca-se **só o último bit** (o menos significativo) de cada byte pelos bits
  da mensagem secreta.
- A cor muda de forma **microscópica** — invisível ao olho, legível por
  software.

## Restrições importantes

- Use formatos **sem perda**: **PNG** ou **BMP**. **JPEG não serve** (a
  compressão descarta dados e destrói a mensagem).
- **Redes sociais** (WhatsApp/Instagram/Facebook) recomprimem a imagem e
  **apagam** a mensagem oculta.

## Referência em Python (Pillow)

```bash
pip install Pillow
```

```python
from PIL import Image

FIM = '1111111111111110'  # delimitador de fim da mensagem

def texto_para_bin(texto):
    return ''.join(format(ord(c), '08b') for c in texto) + FIM

def esconder(img_path, msg, out_path):
    img = Image.open(img_path).convert('RGB')
    pixels = img.load()
    bits = texto_para_bin(msg)
    i = 0
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = pixels[x, y]
            if i < len(bits): r = (r & ~1) | int(bits[i]); i += 1
            if i < len(bits): g = (g & ~1) | int(bits[i]); i += 1
            if i < len(bits): b = (b & ~1) | int(bits[i]); i += 1
            pixels[x, y] = (r, g, b)
            if i >= len(bits):
                img.save(out_path, "PNG"); return
    raise ValueError("Imagem pequena demais para a mensagem.")

def revelar(img_path):
    img = Image.open(img_path).convert('RGB')
    pixels = img.load()
    bits = ""
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = pixels[x, y]
            bits += str(r & 1) + str(g & 1) + str(b & 1)
            if FIM in bits:
                bits = bits.split(FIM)[0]
                chars = [bits[j:j+8] for j in range(0, len(bits), 8)]
                return ''.join(chr(int(c, 2)) for c in chars if len(c) == 8)
    return "Nenhuma mensagem encontrada."
```

> Há também a lib pronta `stegano` (`from stegano import lsb`), e ferramentas
> de GUI/CLI: **Steghide**, **OpenStego**. Em Python puro dá para fazer uma
> versão CLI e uma com interface **Tkinter**.

## Como fazer no Baluarte (JS puro, no navegador)

O site é JS — então o ideal é fazer **direto no navegador com Canvas**, sem
Python. O algoritmo LSB é o mesmo, sobre os dados do `<canvas>`:

```js
// esconder: lê os pixels do canvas, grava 1 bit da mensagem por canal
function esconder(canvas, mensagem) {
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bits = [...mensagem].flatMap(c =>
    c.charCodeAt(0).toString(2).padStart(8, '0').split('').map(Number)
  ).concat('1111111111111110'.split('').map(Number));
  let i = 0;
  for (let p = 0; p < img.data.length && i < bits.length; p += 4) {
    for (let canal = 0; canal < 3 && i < bits.length; canal++) {
      img.data[p + canal] = (img.data[p + canal] & ~1) | bits[i++];
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png'); // exporta PNG (sem perda)
}
```

Vantagens da versão JS/Canvas: roda 100% no navegador, sem instalar nada,
combina com a stack do Baluarte e pode virar mais uma ferramenta do Hub
(categoria Criptografia/CiberSeg).

## Extensão possível
- **Senha:** cifrar a mensagem (AES, que o site já tem em `/cripto`) **antes**
  de escondê-la — só quem tem a chave lê o texto revelado.
