// /jarvis em 3 temas. Layout: sessions sidebar + chat window + mode selector.

const JV_MODES = [
  { id: 'local',  label: 'Local',  icon: '◆', desc: 'Regras · offline · sem custo' },
  { id: 'claude', label: 'Claude', icon: '◉', desc: 'API Anthropic · conversa livre', active: true },
  { id: 'ollama', label: 'Ollama', icon: '⬢', desc: 'Modelo local · 100% privado' },
  { id: 'agente', label: 'Agente', icon: '⚛', desc: 'Claude + ferramentas reais' },
];

const JV_SESSIONS = [
  { id: 's1', title: 'Doutrina Overwatch', mode: 'claude', date: '19 mai',  icon: '◉', active: true },
  { id: 's2', title: 'Calibres da BRAVO',  mode: 'claude', date: '17 mai',  icon: '◉' },
  { id: 's3', title: 'rota /editor diff',  mode: 'agente', date: '15 mai',  icon: '⚛' },
  { id: 's4', title: 'Resumo Cap. 47',     mode: 'local',  date: '12 mai',  icon: '◆' },
  { id: 's5', title: 'Brainstorm v2.0.0',  mode: 'claude', date: '10 mai',  icon: '◉' },
];

const JV_MESSAGES = [
  { role: 'user',   text: 'Resuma a doutrina Overwatch em 3 bullets' },
  { role: 'jarvis', text: 'Overwatch — manual tático do Baluarte. Três bullets:\n\n• Posicionamento elevado: pelo menos um operador em ponto alto cobrindo a frente de avanço da equipe principal.\n• Comunicação contínua: contato visual e rádio com a frente, callouts no formato direção/distância/tipo.\n• Saída garantida: nenhuma posição de overwatch sem rota de exfil ensaiada antes do contato.' },
  { role: 'user',   text: 'Qual equipe usa Overwatch como doutrina principal?' },
  { role: 'jarvis', text: 'FOXTROT. É a doutrina-mãe da Foxtrot — toda a estrutura de fireteam deles é construída em torno de pares Spotter/Sniper. CHARLIE e ECHO usam Overwatch como sub-doutrina em ops específicas.' },
];

/* ─────── A · Calm Material 3 ─────── */

function CalmJarvis() {
  const tk = window.THEME_TOKENS.calm;
  return (
    <window.CalmShell activePath="/jarvis" tk={tk}>
      <div style={{
        fontFamily: tk.fontMono, fontSize: 10, letterSpacing: '0.16em',
        color: tk.textMuted, textTransform: 'uppercase', marginBottom: 8,
      }}>Baluarte / J.A.R.V.I.S.</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, color: tk.text, letterSpacing: '-0.02em' }}>J.A.R.V.I.S.</h1>
        <span style={{
          fontFamily: tk.fontMono, fontSize: 10,
          color: tk.cyan, border: `1px solid ${tk.cyanEdge}`,
          padding: '3px 8px', borderRadius: 4, letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>◉ Claude</span>
      </div>
      <p style={{ fontSize: 13, color: tk.textSub, lineHeight: 1.55, marginTop: 8 }}>
        Assistente de IA do Baluarte —
        <span style={{ color: tk.cyan, fontWeight: 600 }}> 4 modos</span>: Local, Claude API, Ollama e Agente. Sessões persistentes em IndexedDB.
      </p>

      {/* Mode selector */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8, marginTop: 16,
      }}>
        {JV_MODES.map((m) => (
          <div key={m.id} style={{
            padding: 12,
            background: m.active ? tk.cyanSoft : tk.bgElev,
            border: `1px solid ${m.active ? tk.cyanEdge : tk.border}`,
            borderRadius: 8, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16, color: m.active ? tk.cyan : tk.textSub }}>{m.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: m.active ? tk.cyan : tk.text }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 11, color: tk.textSub, lineHeight: 1.45 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Sessions + Chat */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, marginTop: 18, height: 480 }}>
        {/* Sessions */}
        <div style={{
          background: tk.bgElev, border: `1px solid ${tk.border}`,
          borderRadius: 10, padding: 8, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <button style={{
            padding: '8px 12px', background: tk.cyan, color: '#001016',
            border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', marginBottom: 8,
          }}>+ Nova conversa</button>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {JV_SESSIONS.map((s) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 6,
                background: s.active ? tk.cyanSoft : 'transparent',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 14, color: s.active ? tk.cyan : tk.textSub }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 500,
                    color: s.active ? tk.cyan : tk.text,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: tk.textMuted, fontFamily: tk.fontMono, marginTop: 1 }}>{s.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div style={{
          background: tk.bgElev, border: `1px solid ${tk.border}`,
          borderRadius: 10, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flex: 1, padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {JV_MESSAGES.map((m, i) => {
              const isAi = m.role === 'jarvis';
              return (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: isAi ? 'row' : 'row-reverse',
                  gap: 10, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: isAi ? tk.cyanSoft : tk.bgSurface2,
                    border: `1px solid ${isAi ? tk.cyanEdge : tk.border}`,
                    color: isAi ? tk.cyan : tk.textSub,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flex: '0 0 auto',
                  }}>{isAi ? '◉' : '◔'}</div>
                  <div style={{
                    flex: 1, maxWidth: '78%',
                    padding: '10px 12px',
                    background: isAi ? tk.bgSurface : tk.cyanSoft,
                    border: `1px solid ${isAi ? tk.border : tk.cyanEdge}`,
                    borderRadius: 10,
                  }}>
                    <div style={{
                      fontFamily: tk.fontMono, fontSize: 9,
                      letterSpacing: '0.14em', color: tk.textMuted,
                      textTransform: 'uppercase', marginBottom: 4,
                    }}>{isAi ? 'J.A.R.V.I.S.' : 'Operador'}</div>
                    <div style={{ fontSize: 13, color: tk.text, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{
            padding: 12, borderTop: `1px solid ${tk.border}`,
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            <textarea
              rows={1}
              placeholder="Mensagem…  (Enter envia · Shift+Enter quebra linha)"
              style={{
                flex: 1, padding: '8px 12px',
                background: tk.bgSurface, border: `1px solid ${tk.border}`,
                borderRadius: 8, color: tk.text, fontSize: 13,
                fontFamily: tk.fontUI, resize: 'none', outline: 0,
              }}
            />
            <button style={{
              width: 38, height: 38, borderRadius: 8,
              background: tk.cyan, color: '#001016', border: 'none',
              fontSize: 16, cursor: 'pointer',
            }}>➤</button>
          </div>
        </div>
      </div>
    </window.CalmShell>
  );
}

/* ─────── B · Full TRON ─────── */

function TronJarvis() {
  const tk = window.THEME_TOKENS.tron;
  return (
    <window.TronShell activePath="/jarvis" tk={tk}>
      <div style={{
        fontFamily: tk.fontMono, fontSize: 10,
        letterSpacing: '0.3em', color: tk.cyan,
        marginBottom: 6, textShadow: `0 0 6px ${tk.cyan}`,
      }}>// BALUARTE :: J.A.R.V.I.S. / NEURAL_LINK</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{
          fontSize: 30, fontWeight: 700, margin: 0,
          color: tk.textHi, letterSpacing: '0.02em',
          fontFamily: tk.fontMono, textShadow: `0 0 12px rgba(0, 240, 255, 0.5)`,
        }}>◉ J.A.R.V.I.S.</h1>
        <span style={{
          fontFamily: tk.fontMono, fontSize: 10,
          color: tk.green, border: `1px solid ${tk.green}`,
          padding: '3px 10px', letterSpacing: '0.22em',
          textShadow: `0 0 6px ${tk.green}`,
        }}>● ACTIVE / CLAUDE</span>
      </div>
      <p style={{
        fontSize: 12, color: tk.textMid, lineHeight: 1.6, marginTop: 8,
        fontFamily: tk.fontMono, letterSpacing: '0.04em',
      }}>↳ <span style={{ color: tk.cyan, textShadow: `0 0 4px ${tk.cyan}` }}>4</span> modos operacionais.
        Sessions persistentes em IndexedDB. Selecione um modo abaixo pra reconfigurar o link.</p>

      {/* Mode grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10, marginTop: 16,
      }}>
        {JV_MODES.map((m) => (
          <window.CornerFrame key={m.id}
            color={m.active ? tk.cyan : tk.cyanDim}
            accent={m.active}
            style={{ padding: 12, background: m.active ? tk.cyanFaint : tk.bgPanel }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 16,
                color: m.active ? tk.cyan : tk.textMid,
                textShadow: m.active ? `0 0 8px ${tk.cyan}` : 'none',
              }}>{m.icon}</span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: m.active ? tk.cyan : tk.textHi,
                fontFamily: tk.fontMono, letterSpacing: '0.16em',
                textShadow: m.active ? `0 0 6px ${tk.cyan}` : 'none',
              }}>{m.label.toUpperCase()}</span>
              {m.active ? (
                <span style={{
                  marginLeft: 'auto', fontSize: 9, color: tk.green,
                  letterSpacing: '0.22em', textShadow: `0 0 4px ${tk.green}`,
                }}>● ON</span>
              ) : null}
            </div>
            <div style={{
              fontSize: 10, color: tk.textMid,
              fontFamily: tk.fontMono, lineHeight: 1.5, letterSpacing: '0.04em',
            }}>{m.desc}</div>
          </window.CornerFrame>
        ))}
      </div>

      {/* Sessions + Chat */}
      <div style={{
        display: 'grid', gridTemplateColumns: '200px 1fr',
        gap: 14, marginTop: 18, height: 480,
      }}>
        <window.CornerFrame color={tk.cyanDim} style={{
          background: tk.bgPanel, padding: 8,
          display: 'flex', flexDirection: 'column',
        }}>
          <button style={{
            padding: '6px 10px', background: 'transparent',
            color: tk.cyan, border: `1px solid ${tk.cyan}`,
            fontFamily: tk.fontMono, fontSize: 10,
            letterSpacing: '0.2em', cursor: 'pointer', marginBottom: 8,
            textShadow: `0 0 4px ${tk.cyan}`,
          }}>[ + NEW SESSION ]</button>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {JV_SESSIONS.map((s) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 8px',
                background: s.active ? tk.cyanFaint : 'transparent',
                borderBottom: `1px dashed ${tk.cyanFaint}`,
                fontFamily: tk.fontMono,
                color: s.active ? tk.cyan : tk.textMid,
                textShadow: s.active ? `0 0 4px ${tk.cyan}` : 'none',
              }}>
                <span style={{ fontSize: 12 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{s.title}</div>
                  <div style={{ fontSize: 9, color: tk.textLow, letterSpacing: '0.18em', marginTop: 1 }}>
                    {s.mode.toUpperCase()} · {s.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </window.CornerFrame>

        <window.CornerFrame color={tk.cyanDim} accent style={{
          background: tk.bgPanel,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flex: 1, padding: 14, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {JV_MESSAGES.map((m, i) => {
              const isAi = m.role === 'jarvis';
              return (
                <div key={i} style={{
                  display: 'flex', gap: 10,
                  flexDirection: isAi ? 'row' : 'row-reverse',
                }}>
                  <div style={{
                    width: 30, height: 30,
                    border: `1px solid ${isAi ? tk.cyan : tk.cyanDim}`,
                    color: isAi ? tk.cyan : tk.textMid,
                    background: isAi ? tk.cyanFaint : tk.bgPanel,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                    textShadow: isAi ? `0 0 8px ${tk.cyan}` : 'none',
                    flex: '0 0 auto',
                  }}>{isAi ? '◉' : '◔'}</div>
                  <div style={{ flex: 1, maxWidth: '78%' }}>
                    <div style={{
                      fontFamily: tk.fontMono, fontSize: 9,
                      letterSpacing: '0.22em', color: isAi ? tk.cyan : tk.textLow,
                      marginBottom: 4,
                      textShadow: isAi ? `0 0 4px ${tk.cyan}` : 'none',
                    }}>{isAi ? '◉ J.A.R.V.I.S.' : '◔ OP / LUCAS'}</div>
                    <div style={{
                      padding: '8px 12px',
                      border: `1px solid ${isAi ? tk.cyanFaint : tk.cyanFaint}`,
                      background: isAi ? 'rgba(0, 0, 0, 0.3)' : tk.cyanFaint,
                      color: tk.textHi, fontSize: 12,
                      lineHeight: 1.55, whiteSpace: 'pre-wrap',
                      fontFamily: tk.fontMono, letterSpacing: '0.02em',
                    }}>{m.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{
            padding: 12, borderTop: `1px solid ${tk.cyanFaint}`,
            display: 'flex', gap: 8, alignItems: 'flex-end',
            background: 'rgba(0, 0, 0, 0.4)',
          }}>
            <span style={{ color: tk.cyan, fontFamily: tk.fontMono, paddingBottom: 8 }}>{'>'}</span>
            <textarea
              rows={1}
              placeholder="msg --send  · Enter / Shift+Enter"
              style={{
                flex: 1, padding: '8px 12px',
                background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.cyanFaint}`,
                color: tk.textHi, fontSize: 12,
                fontFamily: tk.fontMono, resize: 'none', outline: 0,
                letterSpacing: '0.04em',
              }}
            />
            <button style={{
              padding: '8px 14px',
              background: 'transparent', color: tk.cyan,
              border: `1px solid ${tk.cyan}`,
              fontFamily: tk.fontMono, fontSize: 11, letterSpacing: '0.2em',
              cursor: 'pointer',
              textShadow: `0 0 4px ${tk.cyan}`,
            }}>SEND ▶</button>
          </div>
        </window.CornerFrame>
      </div>
    </window.TronShell>
  );
}

/* ─────── C · Brutalist Terminal ─────── */

function BrJarvis() {
  const tk = window.THEME_TOKENS.br;
  const pad = window.padStr;

  return (
    <window.BrShell activePath="/jarvis" tk={tk} prompt="/jarvis$">
      <pre style={{ margin: '0 0 12px', color: tk.textHi, fontSize: 12, lineHeight: 1.15 }}>{` ┌─────────────────────────────────────────────────────────────────────────────┐
 │  J . A . R . V . I . S .                                                    │
 │  ───────────────────────                                                    │
 │  mode: claude · 4 modes available · sessions persisted (indexeddb)          │
 └─────────────────────────────────────────────────────────────────────────────┘`}</pre>

      <window.AsciiBox title="MODES" status="active: claude" tk={tk}>
        <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>{`mode      icon  status     description
─────────────────────────────────────────────────────────────────────────
`}{JV_MODES.map((m) => (
  <span key={m.id} style={{
    display: 'block',
    background: m.active ? tk.accent : 'transparent',
    color: m.active ? tk.bg : tk.text,
    fontWeight: m.active ? 700 : 400,
  }}>
    <span>{pad(m.label.toLowerCase(), 10)}</span>
    <span>{pad(m.icon, 6)}</span>
    <span>{pad(m.active ? '[ON]' : '[off]', 11)}</span>
    <span>{m.desc}</span>
  </span>
))}</pre>
      </window.AsciiBox>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 18 }}>
        <window.AsciiBox title="SESSIONS" status="5" tk={tk}>
          <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.55 }}>{JV_SESSIONS.map((s) => (
  <span key={s.id} style={{
    display: 'block',
    background: s.active ? tk.accent : 'transparent',
    color: s.active ? tk.bg : tk.text,
    fontWeight: s.active ? 700 : 400,
  }}>{s.active ? '>' : ' '} {pad(s.title, 18)} {s.date}</span>
))}</pre>
          <div style={{ marginTop: 6, color: tk.accent }}>[ + new ]</div>
        </window.AsciiBox>

        <window.AsciiBox title="CHAT · doutrina overwatch" status="claude" tk={tk}>
          {JV_MESSAGES.map((m, i) => {
            const isAi = m.role === 'jarvis';
            return (
              <div key={i} style={{ marginBottom: 10, fontFamily: tk.fontMono, fontSize: 12, lineHeight: 1.55 }}>
                <div style={{ color: isAi ? tk.accent : tk.textHi, marginBottom: 2 }}>
                  {isAi ? '[14:32] jarvis ◉' : '[14:31] operator ◔'}
                </div>
                <div style={{
                  color: tk.text,
                  paddingLeft: 14,
                  borderLeft: `1px solid ${isAi ? tk.accent : tk.textDim}`,
                  whiteSpace: 'pre-wrap',
                }}>{m.text}</div>
              </div>
            );
          })}
          <div style={{
            marginTop: 12, paddingTop: 8,
            borderTop: `1px dashed ${tk.border}`,
            display: 'flex', alignItems: 'baseline', gap: 6,
            color: tk.text,
          }}>
            <span style={{ color: tk.accent }}>{'>'}</span>
            <input
              placeholder="type · enter sends · shift-enter newline"
              style={{
                flex: 1, border: 0, outline: 0, background: 'transparent',
                color: tk.textHi, fontSize: 12, fontFamily: tk.fontMono,
              }}
            />
            <span style={{ color: tk.accent, animation: 'tronBlink 1s steps(1) infinite' }}>█</span>
          </div>
        </window.AsciiBox>
      </div>
    </window.BrShell>
  );
}

Object.assign(window, { CalmJarvis, TronJarvis, BrJarvis });
