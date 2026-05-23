// Reusable themed shells (sidebar, top bar) that adapt to each theme.
// A page-mockup grabs the right shell and stuffs its content into it.

const SHELL_NAV = [
  {
    label: 'Operações',
    items: [
      { path: '/home',        label: 'Ponte de Comando',   icon: '⬡' },
      { path: '/ferramentas', label: 'Hub de Ferramentas', icon: '⚙' },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { path: '/editor',    label: 'Editor de Código', icon: '⌨' },
      { path: '/terminal',  label: 'Terminal',         icon: '▸' },
      { path: '/cripto',    label: 'Lab de Cripto',    icon: '⚿' },
      { path: '/logic-sim', label: 'Logic Sim',        icon: '⊻' },
    ],
  },
  {
    label: 'Conhecimento',
    items: [
      { path: '/biblioteca', label: 'Biblioteca', icon: '◫' },
      { path: '/academia',   label: 'Academia',   icon: '◬' },
    ],
  },
  {
    label: 'Tático',
    items: [
      { path: '/arsenal',  label: 'Arsenal',  icon: '⌖' },
      { path: '/elites',   label: 'Elites',   icon: '◆' },
      { path: '/ciberseg', label: 'CiberSeg', icon: '⚿' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { path: '/jarvis', label: 'J.A.R.V.I.S.',     icon: '◉' },
      { path: '/perfil', label: 'Perfil',           icon: '◔' },
      { path: '/sobre',  label: 'Sobre o Projeto',  icon: '◇' },
    ],
  },
];

/* ─────── Calm Material 3 shell ─────── */

function CalmShell({ activePath, children, tk }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex',
      background: tk.bg,
      color: tk.text,
      fontFamily: tk.fontUI,
      overflow: 'hidden',
    }}>
      <aside style={{
        width: 220, flex: '0 0 220px',
        background: tk.bgElev,
        borderRight: `1px solid ${tk.border}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          height: 56, padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: `1px solid ${tk.border}`,
        }}>
          <span style={{
            fontSize: 22,
            background: `linear-gradient(135deg, ${tk.cyan}, #7DD3FC)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>⬡</span>
          <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', color: tk.text }}>Baluarte</span>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {SHELL_NAV.map((group) => (
            <div key={group.label}>
              <div style={{
                fontFamily: tk.fontMono, fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '0.16em',
                color: tk.textMuted, padding: '14px 12px 6px',
              }}>{group.label}</div>
              {group.items.map((item) => {
                const active = item.path === activePath;
                return (
                  <div key={item.path} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '6px 12px', borderRadius: 6,
                    color: active ? tk.cyan : tk.textSub,
                    background: active ? tk.cyanSoft : 'transparent',
                    borderLeft: active ? `2px solid ${tk.cyan}` : '2px solid transparent',
                    marginBottom: 1, fontSize: 12, fontWeight: 500,
                  }}>
                    <span style={{ width: 18, fontSize: 14, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
        <div style={{
          padding: 12, borderTop: `1px solid ${tk.border}`,
          fontFamily: tk.fontMono, fontSize: 10, color: tk.textMuted,
          textAlign: 'center', letterSpacing: '0.1em',
        }}>v1.0.0 · Mark XIII</div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 56, padding: '0 24px',
          borderBottom: `1px solid ${tk.border}`,
          background: tk.bgElev,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            padding: '6px 10px', background: tk.bgSurface,
            border: `1px solid ${tk.border}`, borderRadius: 6,
            fontSize: 12, color: tk.textSub, minWidth: 240,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Buscar…
            <span style={{ marginLeft: 'auto', fontFamily: tk.fontMono, fontSize: 10, opacity: 0.6 }}>⌘K</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: tk.textSub }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tk.success }}/>
              Núcleo online
            </div>
            <div style={{ fontFamily: tk.fontMono }}>14:32:08</div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: tk.bgSurface2, border: `1px solid ${tk.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: tk.cyan,
            }}>L</div>
          </div>
        </header>
        <main style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>{children}</main>
      </div>
    </div>
  );
}

/* ─────── TRON shell ─────── */

function TronShell({ activePath, children, tk, extraTopBar }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex',
      background: tk.bg,
      color: tk.textHi,
      fontFamily: tk.fontUI,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {window.TRON_OVERLAY}

      <aside style={{
        width: 200, flex: '0 0 200px',
        background: 'rgba(0, 0, 0, 0.6)',
        borderRight: `1px solid ${tk.cyanFaint}`,
        display: 'flex', flexDirection: 'column',
        fontFamily: tk.fontMono,
        position: 'relative', zIndex: 2,
      }}>
        <div style={{
          height: 56, padding: '0 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: `1px solid ${tk.cyanFaint}`,
        }}>
          <span style={{ fontSize: 22, color: tk.cyan, textShadow: `0 0 12px ${tk.cyan}` }}>⬡</span>
          <div>
            <div style={{ fontSize: 11, color: tk.textHi, fontWeight: 700, letterSpacing: '0.2em' }}>BALUARTE</div>
            <div style={{ fontSize: 8, color: tk.textLow, letterSpacing: '0.3em', marginTop: 1 }}>MARK XIII / OS</div>
          </div>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {SHELL_NAV.map((g) => (
            <div key={g.label}>
              <div style={{
                fontSize: 9, letterSpacing: '0.28em', color: tk.cyan,
                padding: '14px 14px 4px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: tk.textLow }}>─</span>
                <span>{g.label.toUpperCase()}</span>
                <span style={{ flex: 1, height: 1, background: tk.cyanFaint, marginLeft: 4 }}/>
              </div>
              {g.items.map((item) => {
                const active = item.path === activePath;
                return (
                  <div key={item.path} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '4px 14px 4px 10px',
                    color: active ? tk.cyan : tk.textMid,
                    background: active ? tk.cyanFaint : 'transparent',
                    fontSize: 11, letterSpacing: '0.04em',
                    textShadow: active ? `0 0 8px ${tk.cyan}` : 'none',
                  }}>
                    <span style={{ fontSize: 10, color: active ? tk.cyan : tk.textLow, width: 12 }}>{active ? '▶' : ' '}</span>
                    <span style={{ width: 12, fontSize: 12 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: 32,
          borderBottom: `1px solid ${tk.cyanFaint}`,
          background: 'rgba(0, 240, 255, 0.03)',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 14,
          fontFamily: tk.fontMono, fontSize: 10, letterSpacing: '0.1em',
        }}>
          <span style={{ color: tk.green }}>● NÚCLEO OK</span>
          <span style={{ color: tk.textMid }}><span style={{ color: tk.textLow }}>CPU </span><span style={{ color: tk.green }}>12%</span></span>
          <span style={{ color: tk.textMid }}><span style={{ color: tk.textLow }}>MEM </span><span style={{ color: tk.green }}>34%</span></span>
          <span style={{ color: tk.textMid }}><span style={{ color: tk.textLow }}>NET </span><span style={{ color: tk.cyan }}>4.2 MB/s</span></span>
          <span style={{ color: tk.textMid }}><span style={{ color: tk.textLow }}>PING </span><span style={{ color: tk.green }}>23 ms</span></span>
          <div style={{ flex: 1 }}/>
          {extraTopBar}
          <span style={{ color: tk.cyan, letterSpacing: '0.16em' }}>14:32:08 · 19 MAY 2026</span>
          <span style={{
            padding: '2px 8px', border: `1px solid ${tk.cyanDim}`,
            color: tk.cyan, letterSpacing: '0.18em',
          }}>OP / LUCAS · CLR-Ω</span>
        </div>
        <main style={{ flex: 1, overflow: 'auto', padding: '20px 24px', position: 'relative' }}>{children}</main>
      </div>
    </div>
  );
}

/* ─────── Brutalist shell ─────── */

function BrShell({ activePath, children, tk, prompt = '~$' }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex',
      background: tk.bg, color: tk.text,
      fontFamily: tk.fontMono,
      overflow: 'hidden',
      textShadow: '0 0 1px currentColor',
    }}>
      <aside style={{
        width: 220, flex: '0 0 220px',
        background: tk.bg,
        borderRight: `1px solid ${tk.border}`,
        padding: 12, overflow: 'auto', fontSize: 12,
      }}>
        <pre style={{ margin: 0, fontSize: 8, color: tk.textHi, lineHeight: 1.1 }}>{`
 ▄▄▄▄·  ▄▄▄· ▄▄▌  ▄• ▄▌ ▄▄▄· ▄▄▄  ▄▄▄▄▄▄▄▄ .
 ▐█ ▀█▪▐█ ▀█ ██•  █▪██▌▐█ ▀█ ▀▄ █·•██  ▀▄.▀·
 ▐█▀▀█▄▄█▀▀█ ██▪  █▌▐█▌▄█▀▀█ ▐▀▀▄  ▐█.▪▐▀▀▪▄
 ██▄▪▐█▐█ ▪▐▌▐█▌▐▌▐█▄█▌▐█ ▪▐▌▐█•█▌ ▐█▌·▐█▄▄▌
 ·▀▀▀▀  ▀  ▀ .▀▀▀  ▀▀▀  ▀  ▀ .▀  ▀ ▀▀▀  ▀▀▀
`.trimEnd()}</pre>
        <div style={{ color: tk.textDim, marginTop: 6, fontSize: 11 }}>
          MARK XIII · v1.0.0<br/>
          <span style={{ color: tk.accent }}>● </span>SYS_OK
        </div>
        <div style={{ borderTop: `1px solid ${tk.border}`, paddingTop: 8, marginTop: 8 }}>
          {SHELL_NAV.map((g) => (
            <div key={g.label} style={{ marginBottom: 10 }}>
              <div style={{ color: tk.textDim, fontSize: 11, marginBottom: 4 }}>── {g.label.toLowerCase()} ─────────</div>
              {g.items.map((item) => {
                const active = item.path === activePath;
                return (
                  <div key={item.path} style={{
                    display: 'flex', gap: 4, padding: '1px 4px',
                    background: active ? tk.accent : 'transparent',
                    color: active ? tk.bg : tk.text,
                    fontSize: 11, fontWeight: active ? 700 : 400,
                  }}>
                    <span>{active ? '>' : ' '}</span>
                    <span>{window.padStr(item.label, 22)}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto', padding: '14px 18px', fontSize: 12 }}>
        <div style={{ marginBottom: 10, color: tk.textDim, fontSize: 11 }}>
          baluarte@mark-xiii:{prompt} <span style={{ color: tk.text }}>session active · clearance Ω</span>
        </div>
        {children}
      </main>
    </div>
  );
}

Object.assign(window, { SHELL_NAV, CalmShell, TronShell, BrShell });
