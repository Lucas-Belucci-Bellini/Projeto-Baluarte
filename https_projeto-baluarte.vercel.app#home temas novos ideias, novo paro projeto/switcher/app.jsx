// Switcher button + picker. THEMES vêm de switcher/themes-list.jsx.

const THEMES = window.THEMES;
const THEMES_BY_ID = window.THEMES_BY_ID;
const STORAGE_KEY = 'baluarte:theme';

function App() {
  const [themeId, setThemeId] = React.useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'original';
  });
  const [picker, setPicker] = React.useState(false);

  const theme = THEMES_BY_ID[themeId] || THEMES[0];

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    const ALL_FLAGS = ['data-scanlines','data-vignette','data-grid-bg','data-h1-gradient','data-logo-flat','data-radius'];
    ALL_FLAGS.forEach((k) => root.removeAttribute(k));
    Object.entries(theme.attrs || {}).forEach(([k, v]) => root.setAttribute(k, v));
    localStorage.setItem(STORAGE_KEY, theme.id);
  }, [theme]);

  const idx = THEMES.findIndex((t) => t.id === theme.id);
  const next = () => setThemeId(THEMES[(idx + 1) % THEMES.length].id);
  const prev = () => setThemeId(THEMES[(idx - 1 + THEMES.length) % THEMES.length].id);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 't' || e.key === 'T') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <>
      <window.ThemableHome />
      <ThemeSwitcher
        theme={theme}
        idx={idx}
        total={THEMES.length}
        onPrev={prev}
        onNext={next}
        open={picker}
        onToggle={() => setPicker((v) => !v)}
        onPick={(id) => { setThemeId(id); setPicker(false); }}
      />
    </>
  );
}

function ThemeSwitcher({ theme, idx, total, onPrev, onNext, open, onToggle, onPick }) {
  // Agrupa temas por .group preservando ordem.
  const groups = React.useMemo(() => {
    const g = {};
    THEMES.forEach((t) => { (g[t.group] = g[t.group] || []).push(t); });
    return g;
  }, []);

  return (
    <>
      <div className="switcher">
        <button className="switcher__arrow" onClick={onPrev} title="Anterior (Shift+T)">‹</button>
        <button className="switcher__main" onClick={onToggle} title="Trocar tema (T)">
          <span className="switcher__swatches" aria-hidden="true">
            {theme.swatches.map((c, i) => (
              <span key={i} style={{ background: c }}/>
            ))}
          </span>
          <span className="switcher__labels">
            <span className="switcher__name">{theme.name}</span>
            <span className="switcher__meta">tema {String(idx + 1).padStart(2,'0')}/{String(total).padStart(2,'0')} · T pra ciclar</span>
          </span>
          <span className="switcher__chev">{open ? '▾' : '▴'}</span>
        </button>
        <button className="switcher__arrow" onClick={onNext} title="Próximo (T)">›</button>
      </div>

      {open && (
        <div className="picker">
          <div className="picker__head">
            <div>
              <div className="picker__title">{total} temas pro Baluarte</div>
              <div className="picker__sub">A estrutura é a mesma — muda só a estética. Clica num pra ver.</div>
            </div>
            <button className="picker__close" onClick={onToggle}>×</button>
          </div>
          <div className="picker__scroll">
            {Object.entries(groups).map(([groupName, list]) => (
              <div key={groupName} className="picker__group">
                <div className="picker__grouplabel">{groupName}<span className="picker__groupcount"> · {list.length}</span></div>
                <div className="picker__grid">
                  {list.map((t) => {
                    const n = THEMES.findIndex((x) => x.id === t.id) + 1;
                    return (
                      <button
                        key={t.id}
                        className={`pcard${t.id === theme.id ? ' pcard--active' : ''}`}
                        onClick={() => onPick(t.id)}
                      >
                        <div className="pcard__swatches">
                          {t.swatches.map((c, k) => <span key={k} style={{ background: c }}/>)}
                        </div>
                        <div className="pcard__body">
                          <div className="pcard__num">{String(n).padStart(2, '0')}</div>
                          <div className="pcard__name">{t.name}</div>
                          <div className="pcard__sub">{t.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
