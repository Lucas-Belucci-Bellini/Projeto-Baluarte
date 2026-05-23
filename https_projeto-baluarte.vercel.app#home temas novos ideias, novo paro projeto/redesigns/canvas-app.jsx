// Canvas wrapper — coloca a Home original (iframe da prod) ao lado das 3
// direções de redesign, todas em 1440×900 pra comparação justa.

const Original = () => (
  <iframe
    src="https://projeto-baluarte.vercel.app/#/home"
    title="Home original (deploy ao vivo)"
    loading="lazy"
    style={{
      width: '100%', height: '100%',
      border: 0,
      background: '#0a0a0a',
    }}
  />
);

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="redesigns-home"
        title="3 direções de redesign · /home"
        subtitle="Mesmo conteúdo, mesmo grid, três compromissos visuais diferentes — pra você decidir pra onde levar"
      >
        <DCArtboard
          id="original"
          label="ORIGINAL · v1.0.0 ao vivo"
          width={1440}
          height={900}
        >
          <Original />
        </DCArtboard>

        <DCArtboard
          id="calm"
          label="A · Calm Material 3"
          width={1440}
          height={900}
        >
          <window.CalmHome />
        </DCArtboard>

        <DCArtboard
          id="tron"
          label="B · Full TRON commit"
          width={1440}
          height={900}
        >
          <window.TronHome />
        </DCArtboard>

        <DCArtboard
          id="brutalist"
          label="C · Brutalist Terminal"
          width={1440}
          height={900}
        >
          <window.BrHome />
        </DCArtboard>
      </DCSection>

      <DCPostIt id="notes" x={60} y={920} width={520}>
        <strong>Como ler:</strong> os 3 redesigns estão à direita do original. Mesmo conteúdo, mesma hierarquia.
        <br/><br/>
        <strong>A · Calm M3</strong> — tira magenta, glow, ALL CAPS e gradient text. Estética calma, ainda dark/tático.<br/>
        <strong>B · Full TRON</strong> — vai com tudo no cyberpunk: scanlines, corner brackets, reticle, telemetry bar, terminal cursor. Diegético.<br/>
        <strong>C · Brutalist</strong> — só monospace, só ASCII, só phosphor green. BBS de 1992.
      </DCPostIt>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
