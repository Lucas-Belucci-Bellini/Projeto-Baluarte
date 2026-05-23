// Baluarte Mark XIII — All-routes design canvas
// Renders every registered route from the live deployed site inside the
// DesignCanvas, grouped by menu section. A Tweaks panel switches between
// Desktop / Tablet / Mobile viewport sizes globally.

const { useState, useEffect, useRef } = React;

// Viewport presets — each frame's outer width/height. The deployed site is
// purely CSS-responsive, so resizing the iframe's container is enough to
// re-trigger its media queries; no reload required.
const VIEWPORTS = {
  desktop: { w: 1440, h: 900,  label: 'Desktop 1440' },
  laptop:  { w: 1280, h: 800,  label: 'Laptop 1280'  },
  tablet:  { w: 820,  h: 1180, label: 'Tablet 820'   },
  mobile:  { w: 390,  h: 844,  label: 'Mobile 390'   },
};

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "viewport": "desktop",
  "showOverlay": true,
  "interactive": true
}/*EDITMODE-END*/;

// One iframe per route. The wrapper handles the “click to interact” overlay,
// the “open in new tab” affordance, and a tiny status pill.
function RouteFrame({ base, path, label, desc, viewport, interactive, showOverlay }) {
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef(null);

  const vp = VIEWPORTS[viewport] || VIEWPORTS.desktop;
  const url = base + path;

  // The visible area inside the artboard is the viewport size, but the
  // iframe itself fills 100% of the wrapper, so the embedded site reflows
  // to that size.
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#0a0a0a',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      onMouseLeave={() => setActive(false)}
    >
      {/* The actual embedded route. lazy loading keeps off-screen frames cheap. */}
      <iframe
        ref={iframeRef}
        src={url}
        title={label}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 0,
          background: '#0a0a0a',
          pointerEvents: interactive && active ? 'auto' : 'none',
        }}
      />

      {/* Skeleton loader while the iframe is initialising. */}
      {!loaded ? (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: '#00f0ff',
            background: 'radial-gradient(ellipse at center, #0a0f14 0%, #050709 80%)',
            gap: 12,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            fontSize: 56, lineHeight: 1,
            background: 'linear-gradient(135deg, #00f0ff, #ff00aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 8px rgba(0,240,255,.4))',
            animation: 'baluartePulse 1.6s ease-in-out infinite',
          }}>⬡</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '.18em',
            color: '#93a4bf',
            textTransform: 'uppercase',
          }}>Carregando {path}</div>
        </div>
      ) : null}

      {/* Overlay: route metadata + “click to interact”. Hidden when active or
          when the user has turned overlays off via Tweaks. */}
      {showOverlay && !active ? (
        <div
          onClick={() => interactive && setActive(true)}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 16,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,.72) 100%)',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'opacity .12s',
          }}
          className="route-overlay"
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '.16em',
                color: '#00f0ff',
                textTransform: 'uppercase',
                opacity: .85,
              }}>{path}</div>
              <div style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#fff',
                marginTop: 2,
                letterSpacing: '-0.01em',
              }}>{label}</div>
              {desc ? (
                <div style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,.65)',
                  marginTop: 3,
                  lineHeight: 1.35,
                  maxWidth: 360,
                }}>{desc}</div>
              ) : null}
            </div>
            {interactive ? (
              <div style={{
                flex: '0 0 auto',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                letterSpacing: '.14em',
                color: 'rgba(0,240,255,.85)',
                textTransform: 'uppercase',
                border: '1px solid rgba(0,240,255,.4)',
                borderRadius: 4,
                padding: '5px 8px',
                background: 'rgba(0,240,255,.06)',
                whiteSpace: 'nowrap',
              }}>Clicar para interagir</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Top-right status pill — open-in-new-tab + viewport indicator. Always
          visible so the user knows which breakpoint they're seeing. */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        display: 'flex', gap: 6, alignItems: 'center',
        pointerEvents: 'auto',
        zIndex: 5,
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          letterSpacing: '.12em',
          color: 'rgba(0,240,255,.75)',
          background: 'rgba(0,0,0,.55)',
          border: '1px solid rgba(0,240,255,.25)',
          padding: '3px 6px',
          borderRadius: 3,
          textTransform: 'uppercase',
          backdropFilter: 'blur(6px)',
        }}>{vp.w}×{vp.h}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir em nova aba"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24,
            background: 'rgba(0,0,0,.55)',
            border: '1px solid rgba(0,240,255,.25)',
            borderRadius: 3,
            color: '#00f0ff',
            textDecoration: 'none',
            backdropFilter: 'blur(6px)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M3 1H1v10h10V9M7 1h4v4M11 1L5 7" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        </a>
      </div>

      {/* While interactive: an explicit "exit" pill so the user can scroll
          past the iframe again. */}
      {active ? (
        <button
          onClick={(e) => { e.stopPropagation(); setActive(false); }}
          style={{
            position: 'absolute', bottom: 8, left: 8,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            letterSpacing: '.14em',
            color: '#ff00aa',
            background: 'rgba(0,0,0,.65)',
            border: '1px solid rgba(255,0,170,.4)',
            padding: '5px 8px',
            borderRadius: 3,
            cursor: 'pointer',
            textTransform: 'uppercase',
            backdropFilter: 'blur(6px)',
            zIndex: 5,
          }}
        >× Liberar canvas</button>
      ) : null}
    </div>
  );
}

function CanvasApp() {
  const [t, setTweak] = useTweaks(TWEAKS_DEFAULTS);
  const vp = VIEWPORTS[t.viewport] || VIEWPORTS.desktop;

  return (
    <>
      <DesignCanvas>
        {window.BALUARTE_GROUPS.map((group) => (
          <DCSection
            key={group.id}
            id={group.id}
            title={group.title}
            subtitle={group.subtitle}
          >
            {group.routes.map((route) => (
              <DCArtboard
                key={route.path}
                id={route.path}
                label={`${route.path} · ${route.label}`}
                width={vp.w}
                height={vp.h}
              >
                <RouteFrame
                  base={window.BALUARTE_BASE}
                  path={route.path}
                  label={route.label}
                  desc={route.desc}
                  viewport={t.viewport}
                  interactive={t.interactive}
                  showOverlay={t.showOverlay}
                />
              </DCArtboard>
            ))}
          </DCSection>
        ))}
      </DesignCanvas>

      <TweaksPanel title="Tweaks · Baluarte">
        <TweakSection label="Viewport">
          <TweakRadio
            label="Tamanho"
            value={t.viewport}
            options={[
              { value: 'desktop', label: 'Desktop' },
              { value: 'laptop',  label: 'Laptop'  },
              { value: 'tablet',  label: 'Tablet'  },
              { value: 'mobile',  label: 'Mobile'  },
            ]}
            onChange={(v) => setTweak('viewport', v)}
          />
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '.12em',
            color: 'rgba(255,255,255,.55)',
            textTransform: 'uppercase',
            marginTop: 4,
          }}>{vp.label} · {vp.w}×{vp.h}px</div>
        </TweakSection>

        <TweakSection label="Comportamento">
          <TweakToggle
            label="Mostrar overlays com metadados"
            value={t.showOverlay}
            onChange={(v) => setTweak('showOverlay', v)}
          />
          <TweakToggle
            label="Permitir interação (click)"
            value={t.interactive}
            onChange={(v) => setTweak('interactive', v)}
          />
        </TweakSection>

        <TweakSection label="Atalhos">
          <div style={{
            fontSize: 11,
            color: 'rgba(255,255,255,.7)',
            lineHeight: 1.55,
          }}>
            <div>• Pan: arraste o fundo</div>
            <div>• Zoom: scroll do mouse</div>
            <div>• Focar tela: ícone <strong style={{ color: '#fff' }}>⤢</strong> no card</div>
            <div>• Reordenar: arraste o <strong style={{ color: '#fff' }}>⋮⋮</strong></div>
          </div>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(<CanvasApp />);
