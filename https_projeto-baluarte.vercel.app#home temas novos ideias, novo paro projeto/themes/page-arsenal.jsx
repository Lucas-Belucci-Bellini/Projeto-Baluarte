// /arsenal em 3 temas. Layout: tabs + filtros + lista + painel de detalhes.

const ARSENAL_SAMPLE = [
  { id: 'gl1', name: 'Glock 19',         origin: 'Áustria',    cal: '9×19mm',      year: 1988, tier: 'A', equipe: 'ALFA',   cat: 'pistolas',   icon: '⌖' },
  { id: 'm4',  name: 'M4 Carbine',       origin: 'EUA',        cal: '5.56×45mm',   year: 1994, tier: 'S', equipe: 'BRAVO',  cat: 'fuzis',      icon: '▭' },
  { id: 'ak',  name: 'AK-12',            origin: 'Rússia',     cal: '5.45×39mm',   year: 2018, tier: 'A', equipe: 'CHARLIE',cat: 'fuzis',      icon: '▭' },
  { id: 'sc',  name: 'Scorpion EVO 3',   origin: 'República Tcheca', cal: '9×19mm', year: 2009, tier: 'B', equipe: 'DELTA', cat: 'subfuzis',   icon: '▰' },
  { id: 'b50', name: 'Barrett M82A1',    origin: 'EUA',        cal: '.50 BMG',     year: 1982, tier: 'S', equipe: 'ECHO',   cat: 'snipers',    icon: '⌗' },
  { id: 'm24', name: 'Remington M24',    origin: 'EUA',        cal: '7.62×51mm',   year: 1988, tier: 'A', equipe: 'FOX',    cat: 'snipers',    icon: '⌗' },
  { id: 'sg',  name: 'Mossberg 590A1',   origin: 'EUA',        cal: '12 gauge',    year: 1987, tier: 'B', equipe: 'GOLF',   cat: 'shotguns',   icon: '▤' },
  { id: 'rpg', name: 'RPG-7',            origin: 'União Soviética', cal: '40mm',   year: 1961, tier: 'A', equipe: 'HOTEL',  cat: 'lança-foguetes', icon: '◣' },
];

const ARS_CATS = [
  { id: 'all',      label: 'Tudo',         count: 251, icon: '⬡' },
  { id: 'pistolas', label: 'Pistolas',     count: 28,  icon: '⌖' },
  { id: 'fuzis',    label: 'Fuzis',        count: 36,  icon: '▭' },
  { id: 'subfuzis', label: 'Subfuzis',     count: 14,  icon: '▰' },
  { id: 'snipers',  label: 'Snipers',      count: 19,  icon: '⌗' },
  { id: 'shotguns', label: 'Shotguns',     count: 11,  icon: '▤' },
  { id: 'aer',      label: 'Aeronaves',    count: 22,  icon: '✈' },
  { id: 'nav',      label: 'Frota Naval',  count: 18,  icon: '⚓' },
  { id: 'drn',      label: 'Drones',       count: 12,  icon: '◈' },
];

const SELECTED = ARSENAL_SAMPLE[1]; // M4 Carbine — feature do detalhe

/* ─────── A · Calm Material 3 ─────── */

function CalmArsenal() {
  const tk = window.THEME_TOKENS.calm;
  return (
    <window.CalmShell activePath="/arsenal" tk={tk}>
      <div style={{
        fontFamily: tk.fontMono, fontSize: 10, letterSpacing: '0.16em',
        color: tk.textMuted, textTransform: 'uppercase', marginBottom: 8,
      }}>Baluarte / Arsenal</div>
      <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, color: tk.text, letterSpacing: '-0.02em' }}>Arsenal</h1>
      <p style={{ fontSize: 13, color: tk.textSub, maxWidth: 720, lineHeight: 1.55, marginTop: 8 }}>
        <span style={{ color: tk.cyan, fontWeight: 600 }}>251 entradas</span> num catálogo militar completo —
        armas leves, artilharia, aeronaves, frota naval e drones em
        <span style={{ color: tk.cyan, fontWeight: 600 }}> 15 categorias</span>, mais
        <span style={{ color: tk.cyan, fontWeight: 600 }}> 6 doutrinas</span> táticas.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginTop: 18, borderBottom: `1px solid ${tk.border}` }}>
        <div style={{
          padding: '8px 14px', fontSize: 13, fontWeight: 600,
          color: tk.cyan, borderBottom: `2px solid ${tk.cyan}`,
          cursor: 'pointer',
        }}>Catálogo</div>
        <div style={{ padding: '8px 14px', fontSize: 13, color: tk.textSub, cursor: 'pointer' }}>Doutrinas</div>
      </div>

      {/* Search */}
      <div style={{
        marginTop: 14, padding: '8px 12px',
        background: tk.bgElev, border: `1px solid ${tk.border}`,
        borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
        maxWidth: 520,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tk.textMuted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input placeholder="Buscar por nome, origem, calibre, equipe…" style={{
          border: 0, outline: 0, background: 'transparent',
          color: tk.text, fontSize: 13, fontFamily: tk.fontUI, flex: 1,
        }}/>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
        {ARS_CATS.map((c, i) => {
          const active = i === 0;
          return (
            <button key={c.id} style={{
              padding: '5px 10px', borderRadius: 999,
              background: active ? tk.cyanSoft : tk.bgSurface,
              color: active ? tk.cyan : tk.textSub,
              border: `1px solid ${active ? tk.cyanEdge : tk.border}`,
              fontSize: 11, fontFamily: tk.fontUI,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span>{c.icon}</span><span>{c.label}</span>
              <span style={{ opacity: 0.6, fontFamily: tk.fontMono, fontSize: 10 }}>{c.count}</span>
            </button>
          );
        })}
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <select style={{
          padding: '6px 10px', background: tk.bgSurface,
          border: `1px solid ${tk.border}`, borderRadius: 6,
          color: tk.text, fontSize: 12, fontFamily: tk.fontUI,
        }}><option>Todas equipes</option></select>
        <select style={{
          padding: '6px 10px', background: tk.bgSurface,
          border: `1px solid ${tk.border}`, borderRadius: 6,
          color: tk.text, fontSize: 12, fontFamily: tk.fontUI,
        }}><option>Todos tiers</option></select>
        <div style={{ marginLeft: 'auto', fontFamily: tk.fontMono, fontSize: 11, color: tk.textMuted }}>
          8 de 251
        </div>
      </div>

      {/* List + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 14, marginTop: 14 }}>
        {/* List */}
        <div style={{
          background: tk.bgElev, border: `1px solid ${tk.border}`,
          borderRadius: 10, overflow: 'hidden',
        }}>
          {ARSENAL_SAMPLE.map((w, i) => {
            const active = w.id === SELECTED.id;
            return (
              <div key={w.id} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr auto',
                gap: 10, padding: '10px 12px',
                borderBottom: i < ARSENAL_SAMPLE.length - 1 ? `1px solid ${tk.border}` : 'none',
                background: active ? tk.cyanSoft : 'transparent',
                borderLeft: active ? `2px solid ${tk.cyan}` : '2px solid transparent',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 28, height: 28, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: active ? tk.cyan : tk.textSub,
                  fontSize: 14,
                }}>{w.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: tk.textMuted, fontFamily: tk.fontMono, marginTop: 1 }}>
                    {w.origin} · {w.cal} · {w.year}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <span style={{
                    fontFamily: tk.fontMono, fontSize: 10,
                    padding: '1px 6px', borderRadius: 3,
                    color: w.tier === 'S' ? tk.warning : w.tier === 'A' ? tk.cyan : tk.success,
                    border: `1px solid ${w.tier === 'S' ? tk.warning : w.tier === 'A' ? tk.cyanEdge : tk.success}`,
                  }}>{w.tier}</span>
                  <span style={{ fontFamily: tk.fontMono, fontSize: 9, color: tk.textMuted, letterSpacing: '0.1em' }}>{w.equipe}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail */}
        <div style={{
          background: tk.bgElev, border: `1px solid ${tk.border}`,
          borderRadius: 10, padding: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              border: `1px solid ${tk.cyanEdge}`,
              color: tk.cyan, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 22, background: tk.cyanSoft,
            }}>{SELECTED.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: tk.text }}>{SELECTED.name}</div>
              <div style={{ fontSize: 11, color: tk.textMuted, fontFamily: tk.fontMono, marginTop: 2 }}>
                Fuzis · Carabina de assalto
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{
                fontFamily: tk.fontMono, fontSize: 10,
                color: tk.warning, border: `1px solid ${tk.warning}`,
                padding: '2px 8px', borderRadius: 3,
                letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>Tier S</span>
              <span style={{
                fontFamily: tk.fontMono, fontSize: 10,
                color: tk.cyan, border: `1px solid ${tk.cyanEdge}`,
                padding: '2px 8px', borderRadius: 3,
                letterSpacing: '0.14em',
              }}>{SELECTED.equipe}</span>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 8, marginBottom: 14,
          }}>
            {[
              ['Origem', SELECTED.origin],
              ['Ano',    SELECTED.year],
              ['Calibre', SELECTED.cal],
              ['Alcance efetivo', '500 m'],
              ['Peso', '3.4 kg'],
              ['Cadência', '700–950 rpm'],
            ].map(([k, v]) => (
              <div key={k} style={{
                padding: '8px 10px', background: tk.bgSurface,
                borderRadius: 6, border: `1px solid ${tk.border}`,
              }}>
                <div style={{ fontSize: 10, color: tk.textMuted, fontFamily: tk.fontMono, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: 13, color: tk.text, marginTop: 2, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '10px 12px', background: tk.bgSurface,
            borderRadius: 6, border: `1px solid ${tk.border}`,
          }}>
            <div style={{ fontSize: 11, color: tk.textMuted, fontFamily: tk.fontMono, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Notas operacionais</div>
            <p style={{ fontSize: 12, color: tk.textSub, lineHeight: 1.55, margin: 0 }}>
              Carabina de assalto padrão das forças regulares da BRAVO. Versão short-barrel do M16,
              compacta o suficiente pra operações em ambiente urbano sem perder alcance efetivo até 500m.
            </p>
          </div>

          <button style={{
            marginTop: 14, padding: '8px 14px',
            background: 'transparent', color: tk.textSub,
            border: `1px solid ${tk.border}`, borderRadius: 6,
            fontSize: 12, cursor: 'pointer',
          }}>⎘ Exportar ficha JSON</button>
        </div>
      </div>
    </window.CalmShell>
  );
}

/* ─────── B · Full TRON ─────── */

function TronArsenal() {
  const tk = window.THEME_TOKENS.tron;
  return (
    <window.TronShell activePath="/arsenal" tk={tk}>
      <div style={{
        fontFamily: tk.fontMono, fontSize: 10,
        letterSpacing: '0.3em', color: tk.cyan,
        marginBottom: 6, textShadow: `0 0 6px ${tk.cyan}`,
      }}>// BALUARTE :: ARSENAL_CATALOG</div>
      <h1 style={{
        fontSize: 30, fontWeight: 700, margin: 0,
        color: tk.textHi, letterSpacing: '0.02em',
        fontFamily: tk.fontMono, textShadow: `0 0 12px rgba(0, 240, 255, 0.5)`,
      }}>⌖ ARSENAL</h1>
      <p style={{
        fontSize: 12, color: tk.textMid, maxWidth: 720,
        lineHeight: 1.6, marginTop: 8, fontFamily: tk.fontMono, letterSpacing: '0.04em',
      }}>↳ <span style={{ color: tk.cyan, textShadow: `0 0 4px ${tk.cyan}` }}>251</span> entradas
        em <span style={{ color: tk.cyan, textShadow: `0 0 4px ${tk.cyan}` }}>15</span> categorias.
        Equipes ALFA → SIERRA. Tier S/A/B/C.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 14, marginTop: 16, marginBottom: 14, fontFamily: tk.fontMono }}>
        <div style={{
          fontSize: 11, color: tk.cyan, letterSpacing: '0.22em',
          textShadow: `0 0 6px ${tk.cyan}`,
          paddingBottom: 4, borderBottom: `2px solid ${tk.cyan}`,
        }}>[ ⌖ CATÁLOGO ]</div>
        <div style={{ fontSize: 11, color: tk.textLow, letterSpacing: '0.22em' }}>[ ☷ DOUTRINAS ]</div>
        <div style={{ flex: 1, alignSelf: 'center', height: 1, background: `linear-gradient(90deg, ${tk.cyan}, transparent)` }}/>
      </div>

      {/* Search */}
      <window.CornerFrame color={tk.cyanDim} style={{
        padding: '6px 12px', background: tk.bgPanel,
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10,
        maxWidth: 520,
      }}>
        <span style={{ color: tk.cyan, fontFamily: tk.fontMono, fontSize: 12 }}>{'>'}</span>
        <input placeholder="grep --weapon" style={{
          border: 0, outline: 0, background: 'transparent',
          color: tk.textHi, fontSize: 12, fontFamily: tk.fontMono, flex: 1, letterSpacing: '0.04em',
        }}/>
        <span style={{ color: tk.cyan, fontFamily: tk.fontMono, fontSize: 11, animation: 'tronBlink 1s steps(1) infinite' }}>█</span>
      </window.CornerFrame>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
        {ARS_CATS.map((c, i) => {
          const active = i === 0;
          return (
            <button key={c.id} style={{
              padding: '3px 8px',
              background: active ? tk.cyanFaint : 'transparent',
              color: active ? tk.cyan : tk.textMid,
              border: `1px solid ${active ? tk.cyan : tk.cyanFaint}`,
              fontFamily: tk.fontMono, fontSize: 10, letterSpacing: '0.14em',
              textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 4,
              textShadow: active ? `0 0 4px ${tk.cyan}` : 'none',
            }}>
              <span>{c.icon}</span><span>{c.label}</span>
              <span style={{ color: tk.textLow }}>·{c.count}</span>
            </button>
          );
        })}
      </div>

      {/* List + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 14 }}>
        {/* List */}
        <window.CornerFrame color={tk.cyanDim} style={{ background: tk.bgPanel }}>
          {ARSENAL_SAMPLE.map((w, i) => {
            const active = w.id === SELECTED.id;
            return (
              <div key={w.id} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr auto',
                gap: 10, padding: '8px 12px',
                borderBottom: i < ARSENAL_SAMPLE.length - 1 ? `1px dashed ${tk.cyanFaint}` : 'none',
                background: active ? tk.cyanFaint : 'transparent',
                fontFamily: tk.fontMono,
              }}>
                <div style={{
                  width: 32, height: 32,
                  border: `1px solid ${active ? tk.cyan : tk.cyanFaint}`,
                  color: active ? tk.cyan : tk.textMid,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                  textShadow: active ? `0 0 6px ${tk.cyan}` : 'none',
                }}>{w.icon}</div>
                <div>
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: active ? tk.cyan : tk.textHi,
                    fontFamily: tk.fontUI, letterSpacing: '-0.01em',
                    textShadow: active ? `0 0 4px ${tk.cyan}` : 'none',
                  }}>{w.name}</div>
                  <div style={{
                    fontSize: 10, color: tk.textMid, marginTop: 2,
                    letterSpacing: '0.04em',
                  }}>{w.origin} · {w.cal} · {w.year}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: w.tier === 'S' ? tk.amber : w.tier === 'A' ? tk.cyan : tk.green,
                    textShadow: `0 0 6px ${w.tier === 'S' ? tk.amber : w.tier === 'A' ? tk.cyan : tk.green}`,
                    letterSpacing: '0.16em',
                  }}>[{w.tier}]</span>
                  <span style={{ fontSize: 9, color: tk.textLow, letterSpacing: '0.18em' }}>{w.equipe}</span>
                </div>
              </div>
            );
          })}
        </window.CornerFrame>

        {/* Detail */}
        <window.CornerFrame color={tk.cyan} accent style={{ padding: 16, background: tk.bgPanel }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52,
              border: `1px solid ${tk.cyan}`,
              color: tk.cyan, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 24, background: tk.cyanFaint,
              textShadow: `0 0 12px ${tk.cyan}`,
            }}>{SELECTED.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 19, fontWeight: 700, color: tk.textHi,
                fontFamily: tk.fontMono, letterSpacing: '0.04em',
                textShadow: `0 0 8px rgba(0, 240, 255, 0.5)`,
              }}>{SELECTED.name.toUpperCase()}</div>
              <div style={{
                fontSize: 10, color: tk.textMid,
                fontFamily: tk.fontMono, marginTop: 2,
                letterSpacing: '0.16em',
              }}>FUZIS / CARABINA</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{
                fontFamily: tk.fontMono, fontSize: 10,
                color: tk.amber, border: `1px solid ${tk.amber}`,
                padding: '3px 8px', letterSpacing: '0.18em',
                textShadow: `0 0 4px ${tk.amber}`,
              }}>[ TIER S ]</span>
              <span style={{
                fontFamily: tk.fontMono, fontSize: 10,
                color: tk.magenta, border: `1px solid ${tk.magenta}`,
                padding: '3px 8px', letterSpacing: '0.18em',
                textShadow: `0 0 4px ${tk.magenta}`,
              }}>{SELECTED.equipe}</span>
            </div>
          </div>

          <div style={{
            fontFamily: tk.fontMono, fontSize: 10,
            letterSpacing: '0.22em', color: tk.cyan,
            marginBottom: 8,
          }}>▶ TELEMETRY</div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8, marginBottom: 14, fontFamily: tk.fontMono,
          }}>
            {[
              ['ORIGIN',   SELECTED.origin],
              ['YEAR',     SELECTED.year],
              ['CALIBER',  SELECTED.cal],
              ['RANGE',    '500 m'],
              ['WEIGHT',   '3.4 kg'],
              ['RATE',     '700-950 rpm'],
            ].map(([k, v]) => (
              <div key={k} style={{
                padding: '6px 10px',
                border: `1px solid ${tk.cyanFaint}`,
                background: 'rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize: 8, color: tk.textLow, letterSpacing: '0.22em' }}>{k}</div>
                <div style={{ fontSize: 13, color: tk.cyan, marginTop: 2, textShadow: `0 0 6px ${tk.cyan}` }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '10px 12px',
            border: `1px solid ${tk.cyanFaint}`,
            background: 'rgba(0,0,0,0.3)',
            fontFamily: tk.fontMono,
          }}>
            <div style={{
              fontSize: 10, color: tk.cyan,
              letterSpacing: '0.22em', marginBottom: 6,
            }}>▶ NOTAS_OP</div>
            <p style={{ fontSize: 11, color: tk.textMid, lineHeight: 1.6, margin: 0, letterSpacing: '0.04em' }}>
              Carabina de assalto padrão BRAVO. Versão short-barrel do M16, compacta pra
              operações em ambiente urbano sem perder alcance efetivo até 500m.
            </p>
          </div>

          <button style={{
            marginTop: 14, padding: '6px 12px',
            background: 'transparent', color: tk.cyan,
            border: `1px solid ${tk.cyan}`,
            fontFamily: tk.fontMono, fontSize: 10,
            letterSpacing: '0.2em', cursor: 'pointer',
            textShadow: `0 0 4px ${tk.cyan}`,
          }}>[ EXPORT JSON ▶ ]</button>
        </window.CornerFrame>
      </div>
    </window.TronShell>
  );
}

/* ─────── C · Brutalist Terminal ─────── */

function BrArsenal() {
  const tk = window.THEME_TOKENS.br;
  const pad = window.padStr;

  return (
    <window.BrShell activePath="/arsenal" tk={tk} prompt="/arsenal$">
      <pre style={{ margin: '0 0 12px', color: tk.textHi, fontSize: 12, lineHeight: 1.15 }}>{` ┌─────────────────────────────────────────────────────────────────────────────┐
 │  A R S E N A L                                                              │
 │  ─────────                                                                  │
 │  251 entries · 15 categories · 6 doctrines · ALFA → SIERRA                  │
 └─────────────────────────────────────────────────────────────────────────────┘`}</pre>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12, color: tk.text }}>
        <span style={{ background: tk.accent, color: tk.bg, padding: '0 6px', fontWeight: 700 }}>[catalog]</span>
        <span style={{ color: tk.textDim }}>[doctrines]</span>
        <span style={{ color: tk.textDim, marginLeft: 'auto' }}>match: 8 of 251</span>
      </div>

      <window.AsciiBox title="FILTERS" tk={tk}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: tk.text }}>
          <span>cat: <span style={{ color: tk.accent }}>all</span></span>
          <span>·</span>
          <span>team: <span style={{ color: tk.accent }}>all</span></span>
          <span>·</span>
          <span>tier: <span style={{ color: tk.accent }}>all</span></span>
          <span>·</span>
          <span>grep: <span style={{ color: tk.accent }}>(none)</span><span style={{ animation: 'tronBlink 1s steps(1) infinite' }}>█</span></span>
        </div>
      </window.AsciiBox>

      <window.AsciiBox title="LIST" status="ordered by tier" tk={tk}>
        <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: tk.text }}>{`id    name                    origin              caliber           year   tier  team
─────────────────────────────────────────────────────────────────────────────────────────
`}{ARSENAL_SAMPLE.map((w) => {
  const active = w.id === SELECTED.id;
  return (
    <span key={w.id} style={{
      display: 'block',
      background: active ? tk.accent : 'transparent',
      color: active ? tk.bg : tk.text,
      fontWeight: active ? 700 : 400,
    }}>
      <span>{pad(w.id, 6)}</span>
      <span>{pad(w.name, 24)}</span>
      <span>{pad(w.origin, 20)}</span>
      <span>{pad(w.cal, 18)}</span>
      <span>{pad(w.year, 7)}</span>
      <span style={{ color: active ? tk.bg : tk.accent, fontWeight: 700 }}>{pad('[' + w.tier + ']', 6)}</span>
      <span>{w.equipe}</span>
    </span>
  );
})}</pre>
      </window.AsciiBox>

      <window.AsciiBox title="DETAIL · M4 Carbine" status="tier S · BRAVO" tk={tk}>
        <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: tk.text }}>{`field             value
──────────────────────────────────────────────────
`}<span><span style={{ color: tk.textDim }}>{pad('origin', 18)}</span><span style={{ color: tk.textHi }}>EUA</span></span>{'\n'}
<span><span style={{ color: tk.textDim }}>{pad('year', 18)}</span><span style={{ color: tk.textHi }}>1994</span></span>{'\n'}
<span><span style={{ color: tk.textDim }}>{pad('caliber', 18)}</span><span style={{ color: tk.textHi }}>5.56×45mm</span></span>{'\n'}
<span><span style={{ color: tk.textDim }}>{pad('range', 18)}</span><span style={{ color: tk.textHi }}>500 m</span></span>{'\n'}
<span><span style={{ color: tk.textDim }}>{pad('weight', 18)}</span><span style={{ color: tk.textHi }}>3.4 kg</span></span>{'\n'}
<span><span style={{ color: tk.textDim }}>{pad('rate', 18)}</span><span style={{ color: tk.textHi }}>700–950 rpm</span></span>{'\n'}
<span><span style={{ color: tk.textDim }}>{pad('tier', 18)}</span><span style={{ color: tk.accent, fontWeight: 700 }}>S · ELITE</span></span></pre>

        <div style={{
          marginTop: 10, paddingTop: 8,
          borderTop: `1px dashed ${tk.border}`,
          color: tk.text, fontSize: 12,
          lineHeight: 1.6,
        }}>
          <div style={{ color: tk.accent, marginBottom: 4 }}>// notas</div>
          carabina de assalto padrão BRAVO. versão short-barrel do M16, compacta pra
          operações em ambiente urbano sem perder alcance efetivo até 500m.
        </div>
        <div style={{ marginTop: 8, color: tk.accent }}>[ export-json ]  [ copy-stats ]</div>
      </window.AsciiBox>
    </window.BrShell>
  );
}

Object.assign(window, { CalmArsenal, TronArsenal, BrArsenal });
