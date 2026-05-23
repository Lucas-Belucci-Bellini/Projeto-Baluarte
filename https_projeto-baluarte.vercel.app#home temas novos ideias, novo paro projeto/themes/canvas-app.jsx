// Canvas final — 4 temas (linhas) × 4 páginas (colunas) = 16 artboards.

const PAGES = [
  { key: 'home',        label: '/home',        title: 'Ponte de Comando' },
  { key: 'ferramentas', label: '/ferramentas', title: 'Hub de Ferramentas' },
  { key: 'arsenal',     label: '/arsenal',     title: 'Arsenal' },
  { key: 'jarvis',      label: '/jarvis',      title: 'J.A.R.V.I.S.' },
];

const W = 1440, H = 900;

function IframePage({ path }) {
  return (
    <iframe
      src={`https://projeto-baluarte.vercel.app/#${path}`}
      title={path}
      loading="lazy"
      style={{ width: '100%', height: '100%', border: 0, background: '#0a0a0a' }}
    />
  );
}

const ORIGINAL_PAGES = {
  home:        <IframePage path="/home" />,
  ferramentas: <IframePage path="/ferramentas" />,
  arsenal:     <IframePage path="/arsenal" />,
  jarvis:      <IframePage path="/jarvis" />,
};

const CALM_PAGES = {
  home:        <window.CalmHome />,
  ferramentas: <window.CalmTools />,
  arsenal:     <window.CalmArsenal />,
  jarvis:      <window.CalmJarvis />,
};

const TRON_PAGES = {
  home:        <window.TronHome />,
  ferramentas: <window.TronTools />,
  arsenal:     <window.TronArsenal />,
  jarvis:      <window.TronJarvis />,
};

const BR_PAGES = {
  home:        <window.BrHome />,
  ferramentas: <window.BrTools />,
  arsenal:     <window.BrArsenal />,
  jarvis:      <window.BrJarvis />,
};

const THEMES = [
  { id: 'original',  title: 'Original · v1.0.0 ao vivo', subtitle: 'Como tá hoje no deploy — cyan + magenta + glow + ALL CAPS',                  pages: ORIGINAL_PAGES },
  { id: 'calm',      title: 'A · Calm Material 3',       subtitle: 'Sem magenta, sem glow, sem ALL CAPS, sem gradient. 1 accent cyan.',         pages: CALM_PAGES },
  { id: 'tron',      title: 'B · Full TRON commit',      subtitle: 'Scanlines CRT + corner brackets + telemetry HUD + magenta como crítico.',  pages: TRON_PAGES },
  { id: 'brutalist', title: 'C · Brutalist Terminal',    subtitle: 'BBS de 1992 · só monospace · só ASCII · phosphor green · zero gradient.',  pages: BR_PAGES },
];

function App() {
  return (
    <DesignCanvas>
      <DCPostIt id="legend" x={60} y={60} width={520}>
        <strong>Como ler:</strong> 4 linhas (temas) × 4 colunas (páginas).
        Lê <strong>verticalmente</strong> pra ver como um tema se comporta em todo o site.
        Lê <strong>horizontalmente</strong> pra ver como uma página muda entre temas.
        <br/><br/>
        Cada artboard é interativo — passa o mouse pra ver, clica pra focar (⤢) ou arrasta o ⋮⋮ pra reordenar.
      </DCPostIt>

      {THEMES.map((theme) => (
        <DCSection
          key={theme.id}
          id={theme.id}
          title={theme.title}
          subtitle={theme.subtitle}
        >
          {PAGES.map((page) => (
            <DCArtboard
              key={page.key}
              id={`${theme.id}-${page.key}`}
              label={`${page.label} · ${page.title}`}
              width={W}
              height={H}
            >
              {theme.pages[page.key]}
            </DCArtboard>
          ))}
        </DCSection>
      ))}
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
