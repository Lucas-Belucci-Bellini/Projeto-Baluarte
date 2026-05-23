// Variante 1 — "Calm Material 3"
// Hipótese: a estrutura do site é boa, o problema é o RUÍDO visual. Mantemos
// o conteúdo idêntico mas removemos:
//   · magenta (só cyan como accent)
//   · glow em hover de cards/sidebar (só uma linha de accent)
//   · ALL CAPS em buttons e títulos (só em badges e crumbs)
//   · gradient text em headers (só na marca ⬡)
//   · animações pulse em status dots
// Resultado: ainda dark + tático, mas confortável pra ler por horas.

const calmTokens = {
  bgPage:     '#0F1419',
  bgElev:     '#161B22',
  bgSurface:  '#1C232D',
  bgSurface2: '#212A35',
  border:     'rgba(255, 255, 255, 0.06)',
  borderHi:   'rgba(255, 255, 255, 0.12)',
  text:       '#E6EDF3',
  textSub:    '#9BA9BA',
  textMuted:  '#6E7C8E',
  cyan:       '#3FB8DC',          // slightly desaturated for less neon
  cyanSoft:   'rgba(63, 184, 220, 0.12)',
  cyanEdge:   'rgba(63, 184, 220, 0.4)',
  success:    '#3FB87E',
  warning:    '#D4A23C',
  danger:     '#D85A6C',
};

function CalmSidebar({ data, tk }) {
  return (
    <aside style={{
      width: 240,
      flex: '0 0 240px',
      background: tk.bgElev,
      borderRight: `1px solid ${tk.border}`,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        height: 56,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${tk.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 22,
            background: `linear-gradient(135deg, ${tk.cyan}, #7DD3FC)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>⬡</span>
          <span style={{
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: '0.04em',
            color: tk.text,
          }}>Baluarte</span>
        </div>
        <button style={{
          width: 28, height: 28,
          background: 'transparent',
          border: `1px solid ${tk.border}`,
          borderRadius: 6,
          color: tk.textSub,
          cursor: 'pointer',
          fontSize: 13,
        }}>‹</button>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {data.NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: tk.textMuted,
              padding: '16px 12px 6px',
            }}>{group.label}</div>
            {group.items.map((item) => {
              const active = item.path === '/home';
              return (
                <div key={item.path} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 12px',
                  borderRadius: 6,
                  color: active ? tk.cyan : tk.textSub,
                  background: active ? tk.cyanSoft : 'transparent',
                  borderLeft: active ? `2px solid ${tk.cyan}` : '2px solid transparent',
                  marginBottom: 1,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                  <span style={{
                    width: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                    opacity: active ? 1 : 0.7,
                  }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{
        padding: 12,
        borderTop: `1px solid ${tk.border}`,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        color: tk.textMuted,
        textAlign: 'center',
        letterSpacing: '0.1em',
      }}>v1.0.0 · Mark XIII</div>
    </aside>
  );
}

function CalmHeader({ tk }) {
  return (
    <header style={{
      height: 56,
      borderBottom: `1px solid ${tk.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: tk.bgElev,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          padding: '6px 10px',
          background: tk.bgSurface,
          border: `1px solid ${tk.border}`,
          borderRadius: 6,
          fontSize: 12,
          color: tk.textSub,
          minWidth: 240,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Buscar ferramentas, capítulos, equipes…
          <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: 0.6 }}>⌘K</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: tk.textSub }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tk.success }}/>
          Núcleo online
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace' }}>14:32:08</div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: tk.bgSurface2, border: `1px solid ${tk.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: tk.cyan,
        }}>L</div>
      </div>
    </header>
  );
}

function CalmMetricCard({ item, tk }) {
  return (
    <div style={{
      background: tk.bgElev,
      border: `1px solid ${item.highlight ? tk.cyanEdge : tk.border}`,
      borderRadius: 10,
      padding: 16,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        color: tk.textMuted,
        marginBottom: 6,
      }}>{item.label}</div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 28,
        fontWeight: 700,
        color: item.highlight ? tk.cyan : tk.text,
        letterSpacing: '-0.01em',
        marginBottom: 6,
      }}>{item.value}</div>
      <div style={{
        fontSize: 11,
        color: tk.textSub,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: tk.success }}/>
        {item.trend}
      </div>
    </div>
  );
}

function CalmQuickCard({ link, tk }) {
  return (
    <div style={{
      background: tk.bgElev,
      border: `1px solid ${tk.border}`,
      borderRadius: 10,
      padding: 14,
      cursor: 'pointer',
      transition: 'border-color .12s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 8,
          background: tk.cyanSoft,
          color: tk.cyan,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>{link.icon}</div>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          letterSpacing: '0.14em',
          color: tk.success,
          textTransform: 'uppercase',
          padding: '2px 6px',
          border: `1px solid ${tk.success}`,
          borderRadius: 4,
          opacity: 0.85,
        }}>Pronto</span>
      </div>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: tk.text,
        marginBottom: 3,
      }}>{link.label}</div>
      <div style={{
        fontSize: 11,
        color: tk.textSub,
        lineHeight: 1.45,
      }}>{link.desc}</div>
    </div>
  );
}

function CalmVigilancia({ data, tk }) {
  return (
    <div style={{
      background: tk.bgElev,
      border: `1px solid ${tk.border}`,
      borderRadius: 10,
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: tk.text }}>Log de eventos</div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          letterSpacing: '0.14em',
          color: tk.textSub,
          textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: tk.success }}/>
          Ao vivo
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.VIGILANCIA.map((ev, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: 12,
            alignItems: 'baseline',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
          }}>
            <span style={{ color: tk.textMuted, minWidth: 46 }}>{ev.time}</span>
            <span style={{
              fontSize: 9,
              letterSpacing: '0.12em',
              padding: '1px 5px',
              borderRadius: 3,
              color: ev.kind === 'info' ? tk.cyan : tk.success,
              border: `1px solid ${ev.kind === 'info' ? tk.cyanEdge : tk.success}`,
              minWidth: 56,
              textAlign: 'center',
            }}>{ev.tag}</span>
            <span style={{ color: tk.textSub, fontFamily: 'Inter, sans-serif' }}>{ev.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalmInfra({ data, tk }) {
  return (
    <div style={{
      background: tk.bgElev,
      border: `1px solid ${tk.border}`,
      borderRadius: 10,
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: tk.text }}>Infraestrutura</div>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: tk.cyan,
          padding: '2px 6px',
          border: `1px solid ${tk.cyanEdge}`,
          borderRadius: 3,
        }}>Mark XIII</span>
      </div>
      <div>
        {data.INFRA.map((item, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            padding: '10px 0',
            borderBottom: i < data.INFRA.length - 1 ? `1px solid ${tk.border}` : 'none',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 13, color: tk.text }}>{item.label}</div>
              <div style={{
                fontSize: 11,
                color: tk.textMuted,
                fontFamily: 'JetBrains Mono, monospace',
                marginTop: 2,
              }}>{item.value}</div>
            </div>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: item.kind === 'info' ? tk.cyan : tk.success,
              padding: '2px 6px',
              border: `1px solid ${item.kind === 'info' ? tk.cyanEdge : tk.success}`,
              borderRadius: 3,
            }}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalmHome() {
  const data = window.HOME_DATA;
  const tk = calmTokens;
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex',
      background: tk.bgPage,
      color: tk.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      <CalmSidebar data={data} tk={tk} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CalmHeader tk={tk} />
        <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
          {/* Page header */}
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.16em',
            color: tk.textMuted,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>Baluarte / Ponte de Comando</div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            color: tk.text,                  // solid color, no gradient
            letterSpacing: '-0.02em',
            margin: 0,
          }}>Ponte de Comando</h1>
          <p style={{
            fontSize: 14,
            color: tk.textSub,
            maxWidth: 680,
            lineHeight: 1.6,
            marginTop: 8,
          }}>Bem-vindo, operador <strong style={{ color: tk.cyan, fontWeight: 600 }}>Lucas</strong>.
            Status do Mark XIII em tempo real. Use o menu lateral ou os cards abaixo para navegar.</p>

          {/* Build banner — sutil, sem magenta */}
          <div style={{
            marginTop: 20,
            padding: '14px 16px',
            background: tk.bgElev,
            border: `1px solid ${tk.borderHi}`,
            borderLeft: `3px solid ${tk.cyan}`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: tk.text, marginBottom: 2 }}>
                v1.0.0 entregue em 21 fases
              </div>
              <div style={{ fontSize: 12, color: tk.textSub }}>
                Primeira versão completa. O projeto segue em construção — próximas versões trazem mais conteúdo.
              </div>
            </div>
            <button style={{
              padding: '8px 14px',
              background: tk.cyan,
              color: '#001016',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>Conhecer a história →</button>
          </div>

          {/* Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginTop: 20,
          }}>
            {data.METRICS.map((m, i) => <CalmMetricCard key={i} item={m} tk={tk} />)}
          </div>

          {/* Quick access */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginTop: 32,
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: `1px solid ${tk.border}`,
          }}>
            <h2 style={{
              fontSize: 18,
              fontWeight: 600,
              color: tk.text,
              margin: 0,
              letterSpacing: '-0.01em',
            }}>Acesso rápido</h2>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: tk.textMuted,
              letterSpacing: '0.1em',
            }}>{data.QUICK_LINKS.length} módulos</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}>
            {data.QUICK_LINKS.map((l, i) => <CalmQuickCard key={i} link={l} tk={tk} />)}
          </div>

          {/* Two-column panels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: 12,
            marginTop: 24,
          }}>
            <CalmVigilancia data={data} tk={tk} />
            <CalmInfra data={data} tk={tk} />
          </div>
        </main>
      </div>
    </div>
  );
}

window.CalmHome = CalmHome;
