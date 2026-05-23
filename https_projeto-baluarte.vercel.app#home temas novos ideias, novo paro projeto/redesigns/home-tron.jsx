// Variante 2 — "Full TRON commit"
// Hipótese: se a estética é cyberpunk, vai com TUDO. Em vez de Material 3
// com decoração neon, vira um console HUD diegético: scanlines CRT, corner
// brackets, telemetry bar, reticle, terminal cursor blink, ASCII rules.
// Magenta vira cor crítica (não decoração). Tudo monospace exceto títulos.

const tronTokens = {
  bg:        '#020608',
  bgPanel:   'rgba(0, 240, 255, 0.025)',
  cyan:      '#00F0FF',
  cyanDim:   'rgba(0, 240, 255, 0.4)',
  cyanFaint: 'rgba(0, 240, 255, 0.12)',
  magenta:   '#FF2A8A',           // pra crítico/warning, NUNCA decoração
  textHi:    '#D9F5FF',
  textMid:   'rgba(180, 220, 240, 0.7)',
  textLow:   'rgba(180, 220, 240, 0.4)',
  green:     '#00FF94',
  amber:     '#FFCB47',
};

// Corner-bracket frame — desenha 4 cantos em vez de bordas completas.
// Esse detalhe é o que faz um HUD parecer um HUD em vez de um card de site.
function CornerFrame({ children, color, accent, style }) {
  const c = color || tronTokens.cyanDim;
  const corner = (pos) => {
    const sz = 10;
    const t = 1.5;
    const map = {
      tl: { top: -1,    left: -1,    borderTop: `${t}px solid ${c}`, borderLeft: `${t}px solid ${c}` },
      tr: { top: -1,    right: -1,   borderTop: `${t}px solid ${c}`, borderRight: `${t}px solid ${c}` },
      bl: { bottom: -1, left: -1,    borderBottom: `${t}px solid ${c}`, borderLeft: `${t}px solid ${c}` },
      br: { bottom: -1, right: -1,   borderBottom: `${t}px solid ${c}`, borderRight: `${t}px solid ${c}` },
    };
    return <div style={{ position: 'absolute', width: sz, height: sz, pointerEvents: 'none', ...map[pos] }}/>;
  };
  return (
    <div style={{ position: 'relative', ...style }}>
      {corner('tl')}{corner('tr')}{corner('bl')}{corner('br')}
      {accent ? (
        <div style={{
          position: 'absolute',
          top: -1, left: 24, right: 24,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
          pointerEvents: 'none',
        }}/>
      ) : null}
      {children}
    </div>
  );
}

function TronSidebar({ data, tk }) {
  return (
    <aside style={{
      width: 220,
      flex: '0 0 220px',
      background: 'rgba(0, 0, 0, 0.6)',
      borderRight: `1px solid ${tk.cyanFaint}`,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'JetBrains Mono, monospace',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* diagonal hash like military stencil */}
      <div style={{
        position: 'absolute',
        top: 0, right: -1, bottom: 0,
        width: 1,
        background: `linear-gradient(180deg, transparent, ${tk.cyan}, transparent)`,
        opacity: 0.6,
      }}/>

      <div style={{
        height: 56,
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: `1px solid ${tk.cyanFaint}`,
      }}>
        <span style={{
          fontSize: 22,
          color: tk.cyan,
          textShadow: `0 0 12px ${tk.cyan}`,
        }}>⬡</span>
        <div>
          <div style={{
            fontSize: 11,
            color: tk.textHi,
            fontWeight: 700,
            letterSpacing: '0.2em',
          }}>BALUARTE</div>
          <div style={{
            fontSize: 8,
            color: tk.textLow,
            letterSpacing: '0.3em',
            marginTop: 1,
          }}>MARK XIII / OS</div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {data.NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div style={{
              fontSize: 9,
              letterSpacing: '0.28em',
              color: tk.cyan,
              padding: '14px 14px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{ color: tk.textLow }}>─</span>
              <span>{group.label.toUpperCase()}</span>
              <span style={{
                flex: 1,
                height: 1,
                background: tk.cyanFaint,
                marginLeft: 4,
              }}/>
            </div>
            {group.items.map((item) => {
              const active = item.path === '/home';
              return (
                <div key={item.path} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px 5px 10px',
                  color: active ? tk.cyan : tk.textMid,
                  background: active ? tk.cyanFaint : 'transparent',
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  position: 'relative',
                  cursor: 'pointer',
                  textShadow: active ? `0 0 8px ${tk.cyan}` : 'none',
                }}>
                  <span style={{
                    fontSize: 10,
                    color: active ? tk.cyan : tk.textLow,
                    width: 14,
                  }}>{active ? '▶' : ' '}</span>
                  <span style={{ width: 14, fontSize: 12 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{
        padding: 10,
        borderTop: `1px solid ${tk.cyanFaint}`,
        fontSize: 9,
        color: tk.textLow,
        letterSpacing: '0.18em',
      }}>
        <div>┌─ SYS STATUS ─</div>
        <div style={{ color: tk.green, marginTop: 4, textShadow: `0 0 6px ${tk.green}` }}>● ONLINE · v1.0.0</div>
      </div>
    </aside>
  );
}

function TronTelemetryBar({ tk }) {
  const items = [
    { k: 'CPU',  v: '12%',     bar: 0.12, color: tk.green },
    { k: 'MEM',  v: '34%',     bar: 0.34, color: tk.green },
    { k: 'NET',  v: '4.2 MB/s',bar: 0.55, color: tk.cyan  },
    { k: 'PING', v: '23 ms',   bar: 0.10, color: tk.green },
    { k: 'CORE', v: 'MK-XIII', bar: 1.00, color: tk.cyan  },
  ];
  return (
    <div style={{
      height: 32,
      borderBottom: `1px solid ${tk.cyanFaint}`,
      background: 'rgba(0, 240, 255, 0.03)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 18,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      letterSpacing: '0.1em',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: tk.cyan }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: tk.green,
          boxShadow: `0 0 8px ${tk.green}`,
        }}/>
        <span style={{ color: tk.green }}>NÚCLEO OK</span>
      </div>
      {items.map((it) => (
        <div key={it.k} style={{ display: 'flex', alignItems: 'center', gap: 6, color: tk.textMid }}>
          <span style={{ color: tk.textLow }}>{it.k}</span>
          <span style={{ color: it.color }}>{it.v}</span>
          <span style={{
            width: 32, height: 3,
            background: tk.cyanFaint,
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', inset: 0,
              width: `${it.bar * 100}%`,
              background: it.color,
              boxShadow: `0 0 6px ${it.color}`,
            }}/>
          </span>
        </div>
      ))}
      <div style={{ flex: 1 }}/>
      <div style={{ color: tk.cyan, letterSpacing: '0.16em' }}>14:32:08 · 19 MAY 2026</div>
      <div style={{
        padding: '2px 8px',
        border: `1px solid ${tk.cyanDim}`,
        color: tk.cyan,
        letterSpacing: '0.18em',
      }}>OP / LUCAS · CLR-Ω</div>
    </div>
  );
}

function TronMetric({ item, tk }) {
  return (
    <CornerFrame color={item.highlight ? tk.cyan : tk.cyanDim} accent={item.highlight}
      style={{ padding: 14, background: tk.bgPanel }}>
      <div style={{
        fontSize: 9,
        letterSpacing: '0.26em',
        color: tk.textLow,
        marginBottom: 4,
        fontFamily: 'JetBrains Mono, monospace',
      }}>{`>> ${item.label.toUpperCase()}`}</div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 30,
        fontWeight: 700,
        color: item.highlight ? tk.cyan : tk.textHi,
        textShadow: item.highlight ? `0 0 16px ${tk.cyan}` : 'none',
        lineHeight: 1,
        marginBottom: 8,
      }}>{item.value}</div>
      <div style={{
        fontSize: 10,
        color: tk.textMid,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.08em',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ color: tk.green }}>▲</span>
        {item.trend}
      </div>
    </CornerFrame>
  );
}

function TronQuick({ link, tk }) {
  return (
    <CornerFrame color={tk.cyanDim}
      style={{ padding: 14, background: tk.bgPanel, cursor: 'pointer' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{
          width: 38, height: 38,
          background: tk.cyanFaint,
          color: tk.cyan,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
          textShadow: `0 0 8px ${tk.cyan}`,
          border: `1px solid ${tk.cyanDim}`,
        }}>{link.icon}</div>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8,
          color: tk.green,
          letterSpacing: '0.24em',
        }}>[ READY ]</span>
      </div>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: tk.textHi,
        marginBottom: 4,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '-0.01em',
      }}>{link.label}</div>
      <div style={{
        fontSize: 10,
        color: tk.textMid,
        fontFamily: 'JetBrains Mono, monospace',
        lineHeight: 1.5,
      }}>{link.desc}</div>
      <div style={{
        marginTop: 12,
        paddingTop: 8,
        borderTop: `1px solid ${tk.cyanFaint}`,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9,
        color: tk.textLow,
        letterSpacing: '0.14em',
      }}>
        <span>{link.path}</span>
        <span style={{ color: tk.cyan }}>EXEC ▶</span>
      </div>
    </CornerFrame>
  );
}

function TronVigilancia({ data, tk }) {
  return (
    <CornerFrame color={tk.cyanDim} accent
      style={{ padding: 16, background: tk.bgPanel }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style={{
          fontSize: 12,
          color: tk.cyan,
          letterSpacing: '0.18em',
          textShadow: `0 0 8px ${tk.cyan}`,
        }}>⌖ VIGILÂNCIA / EVENT_LOG</div>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.22em',
          color: tk.magenta,
          padding: '2px 8px',
          border: `1px solid ${tk.magenta}`,
          textShadow: `0 0 6px ${tk.magenta}`,
        }}>● LIVE</div>
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        color: tk.textLow,
        letterSpacing: '0.1em',
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: `1px dashed ${tk.cyanFaint}`,
      }}>TS       │ CHANNEL  │ MESSAGE</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.VIGILANCIA.map((ev, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '60px 80px 1fr',
            gap: 8,
            alignItems: 'baseline',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            padding: '3px 0',
          }}>
            <span style={{ color: tk.textLow }}>{ev.time}</span>
            <span style={{
              color: ev.kind === 'info' ? tk.cyan : tk.green,
              textShadow: `0 0 4px ${ev.kind === 'info' ? tk.cyan : tk.green}`,
            }}>[{ev.tag}]</span>
            <span style={{ color: tk.textMid }}>{ev.msg}</span>
          </div>
        ))}
      </div>
      {/* cursor blink */}
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        color: tk.cyan,
        marginTop: 8,
        letterSpacing: '0.08em',
      }}>&gt; <span style={{ animation: 'tronBlink 1s steps(1) infinite' }}>█</span></div>
    </CornerFrame>
  );
}

function TronInfra({ data, tk }) {
  return (
    <CornerFrame color={tk.cyanDim} accent
      style={{ padding: 16, background: tk.bgPanel }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style={{
          fontSize: 12,
          color: tk.cyan,
          letterSpacing: '0.18em',
          textShadow: `0 0 8px ${tk.cyan}`,
        }}>◈ SYS_INFRA</div>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.22em',
          color: tk.cyan,
          padding: '2px 8px',
          border: `1px solid ${tk.cyanDim}`,
        }}>MARK XIII</div>
      </div>
      <div>
        {data.INFRA.map((item, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            padding: '10px 0',
            borderBottom: i < data.INFRA.length - 1 ? `1px dashed ${tk.cyanFaint}` : 'none',
            alignItems: 'center',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            <div>
              <div style={{
                fontSize: 11,
                color: tk.textHi,
                letterSpacing: '0.08em',
              }}>{`░ ${item.label}`}</div>
              <div style={{
                fontSize: 10,
                color: tk.textMid,
                marginTop: 2,
                letterSpacing: '0.06em',
              }}>↳ {item.value}</div>
            </div>
            <span style={{
              fontSize: 9,
              letterSpacing: '0.2em',
              color: item.kind === 'info' ? tk.cyan : tk.green,
              padding: '3px 8px',
              border: `1px solid ${item.kind === 'info' ? tk.cyan : tk.green}`,
              textShadow: `0 0 4px ${item.kind === 'info' ? tk.cyan : tk.green}`,
            }}>[ {item.status} ]</span>
          </div>
        ))}
      </div>
    </CornerFrame>
  );
}

function TronHome() {
  const data = window.HOME_DATA;
  const tk = tronTokens;
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex',
      background: tk.bg,
      color: tk.textHi,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* CRT scanlines — sutil mas presente */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,240,255,0.025) 0, rgba(0,240,255,0.025) 1px, transparent 1px, transparent 3px)',
        pointerEvents: 'none',
        zIndex: 10,
      }}/>
      {/* CRT vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none',
        zIndex: 11,
      }}/>

      <TronSidebar data={data} tk={tk} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <TronTelemetryBar tk={tk} />
        <main style={{ flex: 1, overflow: 'auto', padding: '24px 28px', position: 'relative' }}>
          {/* hero with reticle */}
          <div style={{ position: 'relative', marginBottom: 18 }}>
            {/* targeting reticle */}
            <div style={{
              position: 'absolute',
              right: 0, top: -8,
              width: 96, height: 96,
              opacity: 0.5,
              pointerEvents: 'none',
            }}>
              <svg viewBox="0 0 100 100" width="96" height="96" fill="none" stroke={tk.cyan} strokeWidth="1">
                <circle cx="50" cy="50" r="46"/>
                <circle cx="50" cy="50" r="30"/>
                <line x1="50" y1="0"  x2="50" y2="20"/>
                <line x1="50" y1="80" x2="50" y2="100"/>
                <line x1="0"  y1="50" x2="20" y2="50"/>
                <line x1="80" y1="50" x2="100" y2="50"/>
                <circle cx="50" cy="50" r="3" fill={tk.cyan}/>
              </svg>
            </div>

            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.3em',
              color: tk.cyan,
              marginBottom: 6,
              textShadow: `0 0 6px ${tk.cyan}`,
            }}>// BALUARTE :: PONTE_DE_COMANDO</div>
            <h1 style={{
              fontSize: 38,
              fontWeight: 700,
              color: tk.textHi,
              letterSpacing: '0.02em',
              margin: 0,
              fontFamily: 'JetBrains Mono, monospace',
              textShadow: `0 0 12px rgba(0, 240, 255, 0.5)`,
            }}>PONTE DE COMANDO<span style={{
              animation: 'tronBlink 1s steps(1) infinite',
              color: tk.cyan,
              marginLeft: 6,
            }}>_</span></h1>
            <p style={{
              fontSize: 12,
              color: tk.textMid,
              maxWidth: 580,
              lineHeight: 1.6,
              marginTop: 10,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.04em',
            }}>↳ AUTENTICANDO… OK. OPERADOR <span style={{ color: tk.cyan, textShadow: `0 0 4px ${tk.cyan}` }}>[ LUCAS ]</span> · CLEARANCE Ω<br/>
              Status do núcleo em tempo real. Selecione um módulo abaixo ou use o menu lateral pra navegar.</p>
          </div>

          {/* Build banner CRÍTICO em magenta */}
          <CornerFrame color={tk.magenta} accent style={{
            padding: '14px 16px',
            background: 'rgba(255, 42, 138, 0.06)',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.28em',
                  color: tk.magenta,
                  marginBottom: 4,
                  textShadow: `0 0 6px ${tk.magenta}`,
                }}>⚠ BUILD :: v1.0.0 / EM CONSTRUÇÃO</div>
                <div style={{ fontSize: 12, color: tk.textMid, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.5, letterSpacing: '0.04em' }}>
                  Primeira versão completa, entregue em 21 fases. Próximas versões trazem novas ferramentas e conteúdo.
                </div>
              </div>
              <button style={{
                padding: '8px 14px',
                background: 'transparent',
                color: tk.magenta,
                border: `1px solid ${tk.magenta}`,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.2em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textShadow: `0 0 4px ${tk.magenta}`,
              }}>[ HISTÓRIA ▶ ]</button>
            </div>
          </CornerFrame>

          {/* Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 28,
          }}>
            {data.METRICS.map((m, i) => <TronMetric key={i} item={m} tk={tk} />)}
          </div>

          {/* Section header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            <span style={{
              fontSize: 13,
              color: tk.cyan,
              letterSpacing: '0.22em',
              textShadow: `0 0 6px ${tk.cyan}`,
            }}>◢ ACESSO_RÁPIDO</span>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${tk.cyan}, transparent)` }}/>
            <span style={{
              fontSize: 10,
              color: tk.textLow,
              letterSpacing: '0.18em',
            }}>{data.QUICK_LINKS.length} MOD</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            marginBottom: 28,
          }}>
            {data.QUICK_LINKS.map((l, i) => <TronQuick key={i} link={l} tk={tk} />)}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: 14,
          }}>
            <TronVigilancia data={data} tk={tk} />
            <TronInfra data={data} tk={tk} />
          </div>
        </main>
      </div>
    </div>
  );
}

window.TronHome = TronHome;
