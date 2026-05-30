# Jarvis Python — Módulos Locais

Módulos Python do Jarvis que rodam na máquina local, complementando a interface web do Baluarte.

## Estrutura

```
jarvis-python/
└── nivel1/          ← câmera, rosto, voz
    ├── jarvis.py              # entrada principal — roda tudo integrado
    ├── camera_motion.py       # detecção de movimento
    ├── face_recognition_module.py  # reconhecimento facial
    ├── voice_command.py       # comandos por voz (wake word: "jarvis")
    └── requirements.txt
```

## Instalação

```bash
cd jarvis-python/nivel1
pip install -r requirements.txt
```

> No Linux pode ser necessário: `sudo apt install portaudio19-dev python3-pyaudio cmake`

## Uso

```bash
python jarvis.py
```

Na primeira execução, o Jarvis pede seu nome e captura seu rosto pela câmera.  
Depois, basta falar **"Jarvis"** + comando.

## Comandos disponíveis

| Falar | Ação |
|---|---|
| `Jarvis, horas` | Fala a hora atual |
| `Jarvis, câmera` | Abre reconhecimento facial |
| `Jarvis, quem sou` | Fala o usuário identificado |
| `Jarvis, desligar` | Encerra o sistema |

## Níveis futuros

- **Nível 2** — LLM integrado + memória de contexto
- **Nível 3** — Git como banco de dados + pipeline automático
- **Nível 4** — Site auto-alimentado
