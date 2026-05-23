// Shared tokens for the 4 themes. Tema "original" não tem tokens aqui
// porque é renderizado via iframe direto do deploy.

const THEME_TOKENS = {
  calm: {
    bg:        '#0F1419',
    bgElev:    '#161B22',
    bgSurface: '#1C232D',
    bgSurface2:'#212A35',
    border:    'rgba(255, 255, 255, 0.06)',
    borderHi:  'rgba(255, 255, 255, 0.12)',
    text:      '#E6EDF3',
    textSub:   '#9BA9BA',
    textMuted: '#6E7C8E',
    cyan:      '#3FB8DC',
    cyanSoft:  'rgba(63, 184, 220, 0.12)',
    cyanEdge:  'rgba(63, 184, 220, 0.4)',
    success:   '#3FB87E',
    warning:   '#D4A23C',
    danger:    '#D85A6C',
    fontUI:    '"Inter", system-ui, sans-serif',
    fontMono:  '"JetBrains Mono", monospace',
  },
  tron: {
    bg:        '#020608',
    bgPanel:   'rgba(0, 240, 255, 0.025)',
    cyan:      '#00F0FF',
    cyanDim:   'rgba(0, 240, 255, 0.4)',
    cyanFaint: 'rgba(0, 240, 255, 0.12)',
    magenta:   '#FF2A8A',
    textHi:    '#D9F5FF',
    textMid:   'rgba(180, 220, 240, 0.7)',
    textLow:   'rgba(180, 220, 240, 0.4)',
    green:     '#00FF94',
    amber:     '#FFCB47',
    fontUI:    '"Inter", system-ui, sans-serif',
    fontMono:  '"JetBrains Mono", monospace',
  },
  br: {
    bg:        '#0a0d0a',
    text:      '#9bff9b',
    textHi:    '#dfffdf',
    textDim:   '#5a8a5a',
    textMute:  '#3a5a3a',
    accent:    '#ffcc00',
    alert:     '#ff5555',
    border:    '#2a4a2a',
    fontMono:  '"JetBrains Mono", monospace',
  },
};

// Tron CRT overlay — usar em qualquer página que rode no tema Tron.
const TRON_OVERLAY = (
  <>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,240,255,0.025) 0, rgba(0,240,255,0.025) 1px, transparent 1px, transparent 3px)',
      pointerEvents: 'none', zIndex: 10,
    }}/>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
      pointerEvents: 'none', zIndex: 11,
    }}/>
  </>
);

// Tron corner-bracket frame — borda só nos 4 cantos.
function CornerFrame({ children, color = 'rgba(0,240,255,0.4)', accent, style }) {
  const t = 1.5, sz = 10;
  const c = color;
  const corner = (k, css) => (
    <div key={k} style={{ position: 'absolute', width: sz, height: sz, pointerEvents: 'none', ...css }}/>
  );
  return (
    <div style={{ position: 'relative', ...style }}>
      {corner('tl', { top: -1, left: -1, borderTop: `${t}px solid ${c}`, borderLeft: `${t}px solid ${c}` })}
      {corner('tr', { top: -1, right: -1, borderTop: `${t}px solid ${c}`, borderRight: `${t}px solid ${c}` })}
      {corner('bl', { bottom: -1, left: -1, borderBottom: `${t}px solid ${c}`, borderLeft: `${t}px solid ${c}` })}
      {corner('br', { bottom: -1, right: -1, borderBottom: `${t}px solid ${c}`, borderRight: `${t}px solid ${c}` })}
      {accent ? (
        <div style={{
          position: 'absolute', top: -1, left: 24, right: 24, height: 1,
          background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
          pointerEvents: 'none',
        }}/>
      ) : null}
      {children}
    </div>
  );
}

// Brutalist: ASCII box.
function AsciiBox({ title, status, children, alert, tk }) {
  const color = alert ? tk.alert : tk.text;
  const fill = (label) => '═'.repeat(Math.max(0, 105 - String(label).length - (status ? String(status).length + 6 : 0)));
  return (
    <div style={{ fontFamily: tk.fontMono, color: tk.text, fontSize: 12, marginBottom: 14 }}>
      <pre style={{ margin: 0, color, fontSize: 12, lineHeight: 1.1 }}>{`╔══[ `}
        <span style={{ color: alert ? tk.alert : tk.accent, fontWeight: 700 }}>{title}</span>
        {` ]${fill(title)}${status ? `[ ${status} ]══` : '══'}╗`}</pre>
      <div style={{
        borderLeft: `1px solid ${color}`,
        borderRight: `1px solid ${color}`,
        padding: '10px 14px',
        background: tk.bg,
      }}>{children}</div>
      <pre style={{ margin: 0, color, fontSize: 12, lineHeight: 1 }}>{`╚` + '═'.repeat(115) + `╝`}</pre>
    </div>
  );
}

const pad = (s, n) => { s = String(s); return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length); };

window.THEME_TOKENS = THEME_TOKENS;
window.TRON_OVERLAY = TRON_OVERLAY;
window.CornerFrame = CornerFrame;
window.AsciiBox = AsciiBox;
window.padStr = pad;
