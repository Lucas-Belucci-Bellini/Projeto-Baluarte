// Themable home — uma única estrutura, 10 personalidades via vars CSS.

function ThemableHome({ themeAttrs }) {
  const data = window.HOME_DATA;
  return (
    <div className="app" {...(themeAttrs || {})}>
      <div className="theme-overlay"/>

      {/* sidebar */}
      <aside className="side">
        <div className="side__brand">
          <span className="side__logo">⬡</span>
          <span className="side__name">Baluarte</span>
        </div>
        <nav className="side__nav">
          {data.NAV_GROUPS.map((g) => (
            <div key={g.label} className="side__group">
              <div className="side__group-label">{g.label}</div>
              {g.items.map((it) => {
                const active = it.path === '/home';
                return (
                  <div key={it.path} className={`side__item${active ? ' side__item--active' : ''}`}>
                    <span className="side__item-icon">{it.icon}</span>
                    <span>{it.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="side__foot">v1.0.0 · MARK XIII</div>
      </aside>

      {/* column */}
      <div className="col">
        <header className="top">
          <div className="search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            Buscar ferramentas, capítulos, equipes…
            <span className="search__kbd">⌘K</span>
          </div>
          <div className="top__right">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="dot"/> Núcleo online
            </div>
            <div className="clock">14:32:08</div>
            <div className="avatar">L</div>
          </div>
        </header>

        <main className="main">
          <div className="crumb">Baluarte / Ponte de Comando</div>
          <h1 className="h1">Ponte de Comando</h1>
          <p className="lede">
            Bem-vindo, operador <strong>Lucas</strong>. Status do Mark XIII em tempo real.
            Use o menu lateral ou os cards abaixo para navegar.
          </p>

          <div className="banner">
            <div>
              <div className="banner__title">v1.0.0 entregue em 21 fases</div>
              <div className="banner__sub">
                Primeira versão completa. O projeto segue em construção — próximas versões trazem mais conteúdo.
              </div>
            </div>
            <button className="btn">Conhecer a história →</button>
          </div>

          <div className="metrics">
            {data.METRICS.map((m, i) => (
              <div key={i} className={`card${m.highlight ? ' card--accent' : ''}`}>
                <div className="metric__label">{m.label}</div>
                <div className={`metric__value${m.highlight ? ' ' : ''}`}
                     style={m.highlight ? { color: 'var(--accent)', textShadow: 'var(--glow)' } : undefined}>
                  {m.value}
                </div>
                <div className="metric__trend"><span className="dot"/> {m.trend}</div>
              </div>
            ))}
          </div>

          <div className="sec">
            <h2 className="sec__title">Acesso rápido</h2>
            <span className="sec__meta">{data.QUICK_LINKS.length} módulos</span>
          </div>
          <div className="quick">
            {data.QUICK_LINKS.map((l, i) => (
              <div key={i} className="qcard">
                <div className="qcard__row">
                  <div className="qcard__icon">{l.icon}</div>
                  <span className="qcard__badge">Pronto</span>
                </div>
                <div className="qcard__title">{l.label}</div>
                <div className="qcard__desc">{l.desc}</div>
              </div>
            ))}
          </div>

          <div className="cols">
            <div className="panel">
              <div className="panel__head">
                <div className="panel__title">Log de eventos</div>
                <div className="live"><span className="dot"/> Ao vivo</div>
              </div>
              <div>
                {data.VIGILANCIA.map((ev, i) => (
                  <div key={i} className="event">
                    <span className="event__time">{ev.time}</span>
                    <span className={`event__tag${ev.kind === 'ok' ? ' event__tag--ok' : ''}`}>{ev.tag}</span>
                    <span className="event__msg">{ev.msg}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel__head">
                <div className="panel__title">Infraestrutura</div>
                <span className="chip">Mark XIII</span>
              </div>
              <div>
                {data.INFRA.map((it, i) => (
                  <div key={i} className="infra__row">
                    <div>
                      <div className="infra__label">{it.label}</div>
                      <div className="infra__value">{it.value}</div>
                    </div>
                    <span className={`infra__status${it.kind === 'info' ? ' infra__status--info' : ''}`}>
                      {it.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

window.ThemableHome = ThemableHome;
