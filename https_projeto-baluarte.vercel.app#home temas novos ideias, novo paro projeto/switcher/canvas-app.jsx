// Canvas com 30 artboards = 30 cópias da home, cada uma escopada num tema.
// Agrupados por categoria pra facilitar comparação.

const W = 1440, H = 900;

const GROUP_ORDER = [
  'Originais',
  'CRT vintage',
  'Editor de código',
  'Retrofuturismo & neon',
  'Tático & industrial',
  'Brand & mínimo',
  'Papel & arte',
];

const GROUP_SUBTITLES = {
  'Originais':              'Os 4 do round 1 — mantidos como referência.',
  'CRT vintage':            'Tela fosfórica · scanlines · monospace · sem radius.',
  'Editor de código':       'Paletas favoritas de quem vive em VS Code / Neovim.',
  'Retrofuturismo & neon':  'Cores saturadas, ALL CAPS, vibe sci-fi anos 80/90/00.',
  'Tático & industrial':    'Visual de operação militar, EPI, blueprint.',
  'Brand & mínimo':         'Identidades reais — emprestar credibilidade.',
  'Papel & arte':           'LIGHT mode · referências de design gráfico.',
};

function CanvasApp() {
  const themes = window.THEMES;
  const byGroup = {};
  themes.forEach((t) => {
    (byGroup[t.group] = byGroup[t.group] || []).push(t);
  });

  return (
    <DesignCanvas>
      <DCPostIt id="legend" x={60} y={60} width={560}>
        <strong>30 temas, 1 estrutura.</strong> Cada artboard é a mesma home — só muda
        a paleta + fontes + efeitos via CSS vars.
        <br/><br/>
        Lê em linha pra comparar opções dentro de uma família, lê em coluna pra
        comparar famílias. Passa o mouse num artboard pra interagir, clica no ⤢
        pra ver em tela cheia.
      </DCPostIt>

      {GROUP_ORDER.map((group) => {
        const list = byGroup[group] || [];
        if (!list.length) return null;
        return (
          <DCSection
            key={group}
            id={group.toLowerCase().replace(/\W+/g, '-')}
            title={group}
            subtitle={GROUP_SUBTITLES[group] || ''}
          >
            {list.map((t, i) => {
              const n = themes.findIndex((x) => x.id === t.id) + 1;
              const label = `${String(n).padStart(2, '0')} · ${t.name} — ${t.subtitle}`;
              return (
                <DCArtboard
                  key={t.id}
                  id={`theme-${t.id}`}
                  label={label}
                  width={W}
                  height={H}
                >
                  <div data-theme={t.id} {...(t.attrs || {})} style={{
                    width: '100%', height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <window.ThemableHome themeAttrs={{ 'data-theme': t.id, ...(t.attrs || {}) }} />
                  </div>
                </DCArtboard>
              );
            })}
          </DCSection>
        );
      })}
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CanvasApp />);
