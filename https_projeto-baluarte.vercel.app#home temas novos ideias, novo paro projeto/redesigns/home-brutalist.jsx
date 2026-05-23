// Variante 3 — "Brutalist Terminal"
// Hipótese: se a vibe é hacker, vai de verdade. Zero gradiente, zero glow,
// zero radius. Tudo monospace. ASCII pra desenhar containers. Lime green
// sobre preto. Parece um BBS de 1992. Não tenta ser "tech UI bonita"; tenta
// ser HONESTA com a constraint do meio.

const brTokens = {
  bg:       '#0a0d0a',
  text:     '#9bff9b',    // phosphor green
  textHi:   '#dfffdf',
  textDim:  '#5a8a5a',
  textMute: '#3a5a3a',
  accent:   '#ffcc00',    // amber, only for active/highlight
  alert:    '#ff5555',
  border:   '#2a4a2a',
};

// Tab-aligned line — fakes column-aligned text by padding strings.
// In a real terminal you'd just use \t but in HTML we just space-pad.
const pad = (s, n) => {
  s = String(s);
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length);
};

function BrSidebar({ data, tk }) {
  return (
    <aside style={{
      width: 240,
      flex: '0 0 240px',
      background: tk.bg,
      borderRight: `1px solid ${tk.border}`,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      color: tk.text,
      padding: 12,
      overflow: 'auto',
    }}>
      <div style={{ marginBottom: 10 }}>
        <pre style={{ margin: 0, fontSize: 9, color: tk.textHi, lineHeight: 1.1 }}>{`
 ▄▄▄▄·  ▄▄▄· ▄▄▌  ▄• ▄▌ ▄▄▄· ▄▄▄  ▄▄▄▄▄▄▄▄ .
 ▐█ ▀█▪▐█ ▀█ ██•  █▪██▌▐█ ▀█ ▀▄ █·•██  ▀▄.▀·
 ▐█▀▀█▄▄█▀▀█ ██▪  █▌▐█▌▄█▀▀█ ▐▀▀▄  ▐█.▪▐▀▀▪▄
 ██▄▪▐█▐█ ▪▐▌▐█▌▐▌▐█▄█▌▐█ ▪▐▌▐█•█▌ ▐█▌·▐█▄▄▌
 ·▀▀▀▀  ▀  ▀ .▀▀▀  ▀▀▀  ▀  ▀ .▀  ▀ ▀▀▀  ▀▀▀
`.trimEnd()}</pre>
        <div style={{ color: tk.textDim, marginTop: 6, fontSize: 11 }}>
          MARK XIII · v1.0.0<br/>
          <span style={{ color: tk.accent }}>● </span><span>SYS_OK</span>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${tk.border}`, paddingTop: 8 }}>
        {data.NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 10 }}>
            <div style={{
              color: tk.textDim,
              fontSize: 11,
              marginBottom: 4,
            }}>── {group.label.toLowerCase()} ─────────</div>
            {group.items.map((item) => {
              const active = item.path === '/home';
              return (
                <div key={item.path} style={{
                  display: 'flex',
                  gap: 4,
                  padding: '1px 4px',
                  background: active ? tk.accent : 'transparent',
                  color: active ? tk.bg : tk.text,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: active ? 700 : 400,
                }}>
                  <span>{active ? '>' : ' '}</span>
                  <span>{pad(item.label, 22)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}

// ASCII box that wraps content. The border uses block-drawing chars and
// the title sits inside the top edge like an old TUI dialog.
function BrBox({ title, status, children, tk, alert }) {
  const color = alert ? tk.alert : tk.text;
  return (
    <div style={{
      fontFamily: 'JetBrains Mono, monospace',
      color: tk.text,
      fontSize: 12,
      margin: '0 0 16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        color: color,
        whiteSpace: 'pre',
      }}>
        <span>╔══[ </span>
        <span style={{ color: alert ? tk.alert : tk.accent, fontWeight: 700 }}>{title}</span>
        <span> ]</span>
        <span style={{ flex: 1, overflow: 'hidden' }}>═══════════════════════════════════════════════════════════════════════════════════════</span>
        {status ? <span style={{ color: tk.textDim }}>[ {status} ]══</span> : <span>══</span>}
        <span>╗</span>
      </div>
      <div style={{
        display: 'flex',
        gap: 0,
      }}>
        <div style={{ color: color, whiteSpace: 'pre', userSelect: 'none' }}>║{'\n'.repeat(0)}</div>
        <div style={{ flex: 1, padding: '8px 12px' }}>{children}</div>
        <div style={{ color: color, whiteSpace: 'pre', userSelect: 'none' }}>║</div>
      </div>
      <div style={{
        color: color,
        whiteSpace: 'pre',
      }}>╚═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝</div>
    </div>
  );
}

// Vertical extension of the left/right wall for arbitrarily tall content
// blocks. We achieve this by stretching the inner div's wall to the natural
// height via display: flex on a wrapping container.
function BrBox2({ title, status, children, tk, alert, mono }) {
  const color = alert ? tk.alert : tk.text;
  const fillDashes = (label) => '═'.repeat(Math.max(0, 105 - String(label).length - (status ? String(status).length + 6 : 0)));
  return (
    <div style={{
      fontFamily: 'JetBrains Mono, monospace',
      color: tk.text,
      fontSize: 12,
    }}>
      <pre style={{ margin: 0, color: color, fontSize: 12, lineHeight: 1.2 }}>{`╔══[ `}<span style={{ color: alert ? tk.alert : tk.accent, fontWeight: 700 }}>{title}</span>{` ]${fillDashes(title)}${status ? `[ ${status} ]══` : '══'}╗`}</pre>
      <div style={{
        borderLeft: `1px solid ${color}`,
        borderRight: `1px solid ${color}`,
        padding: '10px 14px',
        background: tk.bg,
      }}>{children}</div>
      <pre style={{ margin: 0, color: color, fontSize: 12, lineHeight: 1 }}>{`╚` + '═'.repeat(115) + `╝`}</pre>
    </div>
  );
}

function BrHome() {
  const data = window.HOME_DATA;
  const tk = brTokens;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex',
      background: tk.bg,
      color: tk.text,
      fontFamily: 'JetBrains Mono, monospace',
      overflow: 'hidden',
      // CRT-ish glow on the whole thing (one place, intentional)
      textShadow: '0 0 1px currentColor',
    }}>
      <BrSidebar data={data} tk={tk} />

      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '14px 18px',
        fontSize: 12,
      }}>
        {/* command-prompt header */}
        <div style={{ marginBottom: 12, color: tk.textDim, fontSize: 11 }}>
          <div>baluarte@mark-xiii:~$ cd /home &amp;&amp; status --watch</div>
          <div style={{ color: tk.text, marginTop: 2 }}>
            Welcome, <span style={{ color: tk.accent }}>operator lucas</span>. Last login: mon 19 may 14:08:02 +0300<br/>
            41 routes registered · 35 tools online · SW active · clearance Ω
          </div>
        </div>

        {/* hero — pure ASCII art */}
        <pre style={{
          margin: '0 0 16px',
          color: tk.textHi,
          fontSize: 12,
          lineHeight: 1.15,
        }}>{`
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  P O N T E   D E   C O M A N D O                                            │
 │  ────────────────────────────                                                │
 │  baluarte.system.shell · mark XIII · session #00041                          │
 │  ${'>'} entrada autorizada. núcleo respondendo em todos os canais.${' '.repeat(8)}      │
 └─────────────────────────────────────────────────────────────────────────────┘`.trim()}<span style={{ color: tk.accent, animation: 'tronBlink 1s steps(1) infinite' }}>█</span></pre>

        {/* Build banner — ALERT box */}
        <BrBox2 title="BUILD/STATUS" status="v1.0.0 · EM CONSTRUÇÃO" tk={tk} alert>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ color: tk.text, lineHeight: 1.6 }}>
              v1.0.0 entregue em 21 fases. próximas versões trazem novas ferramentas e conteúdo.<br/>
              <span style={{ color: tk.textDim }}>fases são snapshots do caminho — não rollback.</span>
            </div>
            <div style={{ color: tk.accent, whiteSpace: 'nowrap' }}>[ ler história ]</div>
          </div>
        </BrBox2>

        {/* Metrics as a stat table */}
        <div style={{ height: 16 }}/>
        <BrBox2 title="METRICS" status="t=14:32:08" tk={tk}>
          <pre style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.5,
            color: tk.text,
          }}>{`metric             value         trend
──────────────────────────────────────────────────────────────────
`}{data.METRICS.map((m) => {
  const v = m.highlight
    ? <span key="v" style={{ color: tk.accent, fontWeight: 700 }}>{pad(m.value, 14)}</span>
    : <span key="v" style={{ color: tk.textHi }}>{pad(m.value, 14)}</span>;
  return (
    <span key={m.label} style={{ display: 'block' }}>
      <span style={{ color: tk.textDim }}>{pad(m.label.toLowerCase(), 19)}</span>
      {v}
      <span style={{ color: tk.text }}>▲ {m.trend}</span>
    </span>
  );
})}</pre>
        </BrBox2>

        {/* quick access — tabular grid in monospace */}
        <div style={{ height: 16 }}/>
        <BrBox2 title="QUICK_ACCESS" status={`${data.QUICK_LINKS.length} modules`} tk={tk}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
          }}>
            {data.QUICK_LINKS.map((link, i) => (
              <div key={link.path} style={{
                padding: '8px 10px',
                borderRight: (i % 3 !== 2) ? `1px dashed ${tk.border}` : 'none',
                borderBottom: i < data.QUICK_LINKS.length - 3 ? `1px dashed ${tk.border}` : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <div style={{ color: tk.textHi, fontWeight: 700 }}>{link.icon}  {link.label.toLowerCase()}</div>
                  <div style={{ color: tk.textDim, fontSize: 10 }}>[ ok ]</div>
                </div>
                <div style={{ color: tk.text, fontSize: 11, lineHeight: 1.5 }}>{link.desc}</div>
                <div style={{
                  color: tk.accent,
                  marginTop: 4,
                  fontSize: 11,
                }}>{`> open ${link.path}`}</div>
              </div>
            ))}
          </div>
        </BrBox2>

        <div style={{ height: 16 }}/>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }}>
          {/* Vigilancia */}
          <BrBox2 title="EVENT_LOG" status="live" tk={tk}>
            <pre style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.6,
              color: tk.text,
            }}>{`ts       channel    message
──────────────────────────────────────────────────────────────────
`}{data.VIGILANCIA.map((ev) => (
  <span key={ev.tag + ev.msg} style={{ display: 'block' }}>
    <span style={{ color: tk.textDim }}>{pad(ev.time, 9)}</span>
    <span style={{ color: ev.kind === 'info' ? tk.accent : tk.text }}>{pad('[' + ev.tag + ']', 11)}</span>
    <span style={{ color: tk.textHi }}>{ev.msg}</span>
  </span>
))}<span style={{ color: tk.accent }}>{'>'} <span style={{ animation: 'tronBlink 1s steps(1) infinite' }}>█</span></span></pre>
          </BrBox2>

          {/* Infra */}
          <BrBox2 title="INFRA" status="mark XIII" tk={tk}>
            <pre style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.6,
              color: tk.text,
            }}>{`service             status
──────────────────────────────────
`}{data.INFRA.map((item) => (
  <span key={item.label} style={{ display: 'block' }}>
    <span style={{ color: tk.textHi }}>{pad(item.label.toLowerCase(), 22)}</span>
    <span style={{ color: item.kind === 'info' ? tk.accent : tk.text, fontWeight: 700 }}>[{item.status}]</span>
    <span style={{ display: 'block', color: tk.textDim, fontSize: 11, paddingLeft: 2, marginBottom: 2 }}>↳ {item.value}</span>
  </span>
))}</pre>
          </BrBox2>
        </div>

        {/* footer prompt */}
        <div style={{ marginTop: 16, color: tk.textDim, fontSize: 11 }}>
          press <span style={{ color: tk.accent }}>?</span> for help · <span style={{ color: tk.accent }}>g</span> to jump · <span style={{ color: tk.accent }}>esc</span> to logout
        </div>
        <div style={{ color: tk.text, fontSize: 11 }}>
          baluarte@mark-xiii:/home$ <span style={{ animation: 'tronBlink 1s steps(1) infinite', color: tk.accent }}>█</span>
        </div>
      </main>
    </div>
  );
}

window.BrHome = BrHome;
