// /ferramentas em 3 temas. Página é catálogo grid: header + busca +
// chips de categoria + cards.

const TOOL_SAMPLE = [
  { id: 'editor',          name: 'Editor de Código', cat: 'desenvolvimento', icon: '⌨',   tag: 'novo', desc: '26 linguagens · multi-tabs · runners JS/HTML/CSS/MD · persistência.' },
  { id: 'terminal',        name: 'Terminal Web',     cat: 'desenvolvimento', icon: '▸',   tag: 'novo', desc: '60+ comandos POSIX · FS virtual · pipes · history · autocomplete.' },
  { id: 'regex',           name: 'Lab de Regex',     cat: 'desenvolvimento', icon: '✱',                desc: 'Tester com matches, replace preview, cheatsheet.' },
  { id: 'json',            name: 'JSON Studio',      cat: 'desenvolvimento', icon: '{}',               desc: 'Formata, valida, árvore navegável, diff.' },
  { id: 'calc-cientifica', name: 'Científica',       cat: 'calculo',         icon: '∑',                desc: 'Trig, log, hiperbólicas, fatoriais, memória, histórico.' },
  { id: 'tabela-verdade',  name: 'Tabela Verdade',   cat: 'calculo',         icon: '⊨',                desc: 'Parser lógico, K-map, Quine-McCluskey.' },
  { id: 'cripto-aes',      name: 'AES-GCM',          cat: 'cripto',          icon: '⚿',                desc: 'AES-256 autenticado via Web Crypto, PBKDF2-SHA256.' },
  { id: 'graficos',        name: 'Gerador de Gráficos', cat: 'visualizacao', icon: '◢',                desc: '12 tipos em Canvas 2D puro, export PNG.' },
  { id: 'fft',             name: 'Visualizador FFT', cat: 'midia',           icon: '∿',                desc: '6 modos via Web Audio: mic, arquivo, oscilador.' },
];

const TOOL_CATS = [
  { id: 'all',            label: 'Todas',         count: 35 },
  { id: 'desenvolvimento',label: 'Desenvolvimento', count: 5 },
  { id: 'calculo',        label: 'Cálculo',       count: 9 },
  { id: 'cripto',         label: 'Criptografia',  count: 8 },
  { id: 'visualizacao',   label: 'Visualização',  count: 4 },
  { id: 'midia',          label: 'Mídia',         count: 7 },
  { id: 'referencia',     label: 'Referência',    count: 9 },
];

/* ─────── A · Calm Material 3 ─────── */

function CalmTools() {
  const tk = window.THEME_TOKENS.calm;
  return (
    <window.CalmShell activePath="/ferramentas" tk={tk}>
      <div style={{
        fontFamily: tk.fontMono, fontSize: 10, letterSpacing: '0.16em',
        color: tk.textMuted, textTransform: 'uppercase', marginBottom: 8,
      }}>Baluarte / Hub de Ferramentas</div>
      <h1 style={{
        fontSize: 30, fontWeight: 700, margin: 0,
        color: tk.text, letterSpacing: '-0.02em',
      }}>Hub de Ferramentas</h1>
      <p style={{
        fontSize: 13, color: tk.textSub, maxWidth: 640,
        lineHeight: 1.55, marginTop: 8,
      }}>Catálogo central de todas as ferramentas técnicas do Baluarte.
        <span style={{ color: tk.cyan, fontWeight: 600 }}> 35 ferramentas</span> em
        <span style={{ color: tk.cyan, fontWeight: 600 }}> 7 categorias</span>.</p>

      <div style={{
        marginTop: 18,
        padding: '8px 12px',
        background: tk.bgElev,
        border: `1px solid ${tk.border}`,
        borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 10,
        maxWidth: 520,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tk.textMuted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          placeholder="Buscar ferramenta por nome, descrição ou categoria…"
          style={{
            border: 0, outline: 0, background: 'transparent',
            color: tk.text, fontSize: 13, fontFamily: tk.fontUI, flex: 1,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
        {TOOL_CATS.map((c, i) => {
          const active = i === 0;
          return (
            <button key={c.id} style={{
              padding: '6px 12px',
              background: active ? tk.cyanSoft : tk.bgSurface,
              color: active ? tk.cyan : tk.textSub,
              border: `1px solid ${active ? tk.cyanEdge : tk.border}`,
              borderRadius: 999,
              fontSize: 12, fontFamily: tk.fontUI,
              cursor: 'pointer',
            }}>
              {c.label} <span style={{ opacity: 0.6, marginLeft: 4 }}>({c.count})</span>
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginTop: 24, paddingBottom: 10, borderBottom: `1px solid ${tk.border}`,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: tk.text }}>Catálogo</h2>
        <span style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.textMuted }}>9 de 35</span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, marginTop: 14,
      }}>
        {TOOL_SAMPLE.map((tool) => (
          <div key={tool.id} style={{
            background: tk.bgElev,
            border: `1px solid ${tk.border}`,
            borderRadius: 10,
            padding: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: tk.cyanSoft, color: tk.cyan,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>{tool.icon}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {tool.tag === 'novo' ? (
                  <span style={{
                    fontFamily: tk.fontMono, fontSize: 9,
                    color: tk.cyan, border: `1px solid ${tk.cyanEdge}`,
                    padding: '1px 6px', borderRadius: 3,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                  }}>Novo</span>
                ) : null}
                <span style={{
                  fontFamily: tk.fontMono, fontSize: 9,
                  color: tk.success, border: `1px solid ${tk.success}`,
                  padding: '1px 6px', borderRadius: 3,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>Pronto</span>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: tk.text, marginBottom: 4 }}>{tool.name}</div>
            <div style={{ fontSize: 11, color: tk.textSub, lineHeight: 1.45 }}>{tool.desc}</div>
            <div style={{
              fontFamily: tk.fontMono, fontSize: 9,
              letterSpacing: '0.18em', color: tk.textMuted,
              marginTop: 10, textTransform: 'uppercase',
            }}>{tool.cat}</div>
          </div>
        ))}
      </div>
    </window.CalmShell>
  );
}

/* ─────── B · Full TRON ─────── */

function TronTools() {
  const tk = window.THEME_TOKENS.tron;
  return (
    <window.TronShell activePath="/ferramentas" tk={tk}>
      <div style={{
        fontFamily: tk.fontMono, fontSize: 10,
        letterSpacing: '0.3em', color: tk.cyan,
        marginBottom: 6, textShadow: `0 0 6px ${tk.cyan}`,
      }}>// BALUARTE :: HUB_DE_FERRAMENTAS</div>
      <h1 style={{
        fontSize: 32, fontWeight: 700, margin: 0,
        color: tk.textHi, letterSpacing: '0.02em',
        fontFamily: tk.fontMono, textShadow: `0 0 12px rgba(0, 240, 255, 0.5)`,
      }}>HUB DE FERRAMENTAS</h1>
      <p style={{
        fontSize: 12, color: tk.textMid, maxWidth: 580,
        lineHeight: 1.6, marginTop: 8, fontFamily: tk.fontMono, letterSpacing: '0.04em',
      }}>↳ <span style={{ color: tk.cyan, textShadow: `0 0 4px ${tk.cyan}` }}>35</span> módulos online
        em <span style={{ color: tk.cyan, textShadow: `0 0 4px ${tk.cyan}` }}>7</span> categorias.
        Use a busca ou os chips abaixo pra filtrar.</p>

      <window.CornerFrame color={tk.cyanDim} style={{
        padding: '8px 12px',
        background: tk.bgPanel,
        marginTop: 18,
        marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10,
        maxWidth: 520,
      }}>
        <span style={{ color: tk.cyan, fontFamily: tk.fontMono, fontSize: 12 }}>{'>'}</span>
        <input
          placeholder="search --tool"
          style={{
            border: 0, outline: 0, background: 'transparent',
            color: tk.textHi, fontSize: 13, fontFamily: tk.fontMono, flex: 1,
            letterSpacing: '0.04em',
          }}
        />
        <span style={{ color: tk.cyan, fontFamily: tk.fontMono, fontSize: 11, animation: 'tronBlink 1s steps(1) infinite' }}>█</span>
      </window.CornerFrame>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 18 }}>
        {TOOL_CATS.map((c, i) => {
          const active = i === 0;
          return (
            <button key={c.id} style={{
              padding: '4px 10px',
              background: active ? tk.cyanFaint : 'transparent',
              color: active ? tk.cyan : tk.textMid,
              border: `1px solid ${active ? tk.cyan : tk.cyanFaint}`,
              fontFamily: tk.fontMono, fontSize: 10,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              cursor: 'pointer',
              textShadow: active ? `0 0 4px ${tk.cyan}` : 'none',
            }}>
              [{c.label}] <span style={{ color: tk.textLow, marginLeft: 4 }}>{c.count}</span>
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
        fontFamily: tk.fontMono,
      }}>
        <span style={{
          fontSize: 12, color: tk.cyan, letterSpacing: '0.22em',
          textShadow: `0 0 6px ${tk.cyan}`,
        }}>◢ CATÁLOGO</span>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${tk.cyan}, transparent)` }}/>
        <span style={{ fontSize: 10, color: tk.textLow, letterSpacing: '0.18em' }}>9 / 35</span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
      }}>
        {TOOL_SAMPLE.map((tool) => (
          <window.CornerFrame key={tool.id} color={tk.cyanDim}
            style={{ padding: 12, background: tk.bgPanel }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36,
                background: tk.cyanFaint, color: tk.cyan,
                border: `1px solid ${tk.cyanDim}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, textShadow: `0 0 8px ${tk.cyan}`,
              }}>{tool.icon}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                {tool.tag === 'novo' ? (
                  <span style={{
                    fontFamily: tk.fontMono, fontSize: 8,
                    color: tk.amber, letterSpacing: '0.22em', textTransform: 'uppercase',
                  }}>[ NOVO ]</span>
                ) : null}
                <span style={{
                  fontFamily: tk.fontMono, fontSize: 8,
                  color: tk.green, letterSpacing: '0.22em', textTransform: 'uppercase',
                }}>[ READY ]</span>
              </div>
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: tk.textHi,
              marginBottom: 4, fontFamily: tk.fontUI, letterSpacing: '-0.01em',
            }}>{tool.name}</div>
            <div style={{
              fontSize: 10, color: tk.textMid,
              fontFamily: tk.fontMono, lineHeight: 1.5,
            }}>{tool.desc}</div>
            <div style={{
              marginTop: 10, paddingTop: 6, borderTop: `1px solid ${tk.cyanFaint}`,
              display: 'flex', justifyContent: 'space-between',
              fontFamily: tk.fontMono, fontSize: 9,
              color: tk.textLow, letterSpacing: '0.14em',
            }}>
              <span>{tool.cat.toUpperCase()}</span>
              <span style={{ color: tk.cyan }}>EXEC ▶</span>
            </div>
          </window.CornerFrame>
        ))}
      </div>
    </window.TronShell>
  );
}

/* ─────── C · Brutalist Terminal ─────── */

function BrTools() {
  const tk = window.THEME_TOKENS.br;
  const pad = window.padStr;

  return (
    <window.BrShell activePath="/ferramentas" tk={tk} prompt="/ferramentas$">
      <pre style={{
        margin: '0 0 14px', color: tk.textHi, fontSize: 12, lineHeight: 1.15,
      }}>{` ┌─────────────────────────────────────────────────────────────────────────────┐
 │  H U B   D E   F E R R A M E N T A S                                        │
 │  ───────────────────────────────                                              │
 │  35 tools online · 7 categories · type / to filter                            │
 └─────────────────────────────────────────────────────────────────────────────┘`}</pre>

      <window.AsciiBox title="SEARCH" status="/" tk={tk}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, color: tk.text }}>
          <span style={{ color: tk.accent }}>{'>'}</span>
          <input
            placeholder="filter by name, desc or category…"
            style={{
              border: 0, outline: 0, background: 'transparent',
              color: tk.textHi, fontSize: 12, fontFamily: tk.fontMono, flex: 1,
            }}
          />
          <span style={{ color: tk.accent, animation: 'tronBlink 1s steps(1) infinite' }}>█</span>
        </div>
      </window.AsciiBox>

      <window.AsciiBox title="CATEGORIES" status="active: all" tk={tk}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, fontSize: 12 }}>
          {TOOL_CATS.map((c, i) => {
            const active = i === 0;
            return (
              <span key={c.id} style={{
                padding: '2px 10px',
                background: active ? tk.accent : 'transparent',
                color: active ? tk.bg : tk.text,
                fontWeight: active ? 700 : 400,
                marginRight: 2, marginBottom: 2,
              }}>[{c.label.toLowerCase()} {c.count}]</span>
            );
          })}
        </div>
      </window.AsciiBox>

      <window.AsciiBox title="CATALOG" status="9 of 35" tk={tk}>
        <pre style={{
          margin: 0, fontSize: 12, lineHeight: 1.6, color: tk.text,
        }}>{`id                  name                        category          tags
─────────────────────────────────────────────────────────────────────────────────────────────────
`}{TOOL_SAMPLE.map((t) => (
  <span key={t.id} style={{ display: 'block' }}>
    <span style={{ color: tk.textDim }}>{pad(t.id, 20)}</span>
    <span style={{ color: tk.textHi, fontWeight: 700 }}>{pad(t.name, 28)}</span>
    <span style={{ color: tk.text }}>{pad(t.cat, 18)}</span>
    <span style={{ color: tk.accent }}>{t.tag ? '[novo]' : '[ok]'}</span>
    <span style={{ display: 'block', color: tk.textDim, fontSize: 11, paddingLeft: 22, marginBottom: 4 }}>↳ {t.desc}</span>
  </span>
))}</pre>
      </window.AsciiBox>

      <div style={{ color: tk.textDim, fontSize: 11, marginTop: 10 }}>
        baluarte@mark-xiii:/ferramentas$ <span style={{ animation: 'tronBlink 1s steps(1) infinite', color: tk.accent }}>█</span>
      </div>
    </window.BrShell>
  );
}

Object.assign(window, { CalmTools, TronTools, BrTools });
