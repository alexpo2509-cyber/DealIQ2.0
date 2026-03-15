import { useState, useMemo, useCallback, createContext, useContext } from "react";

const TABS = ["Objekt", "Finanzierung", "Cashflow", "Steuer", "Portfolio", "Exit"];

const fmt = (v, d = 0) => {
  if (v === null || v === undefined || isNaN(v)) return "–";
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
};
const fmtE = (v, d = 0) => `${fmt(v, d)} €`;
const fmtP = (v, d = 1) => `${fmt(v * 100, d)} %`;

const themes = {
  dark: {
    bg: "#0c0c0c",
    surface: "rgba(20,20,20,0.88)",
    border: "rgba(255,255,255,0.05)",
    borderFocus: "rgba(172,147,110,0.45)",
    text: "#d8d4ce",
    textMuted: "rgba(255,255,255,0.35)",
    textDim: "rgba(255,255,255,0.18)",
    copper: "#ac936e",
    copperLight: "rgba(172,147,110,0.12)",
    copperGlow: "rgba(172,147,110,0.06)",
    green: "#5a9e68",
    greenBg: "rgba(90,158,104,0.08)",
    red: "#b85c5c",
    redBg: "rgba(184,92,92,0.08)",
    inputBg: "rgba(255,255,255,0.03)",
    toggleKnob: "#0c0c0c",
    toggleOff: "rgba(255,255,255,0.06)",
    toggleKnobOff: "rgba(255,255,255,0.2)",
    headerGlow: "rgba(172,147,110,0.03)",
    lineLeft: "transparent",
    lineRight: "transparent",
    cardShadow: "0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)",
    tabActive: "#ac936e",
    tabActiveText: "#0c0c0c",
    tabInactive: "rgba(255,255,255,0.03)",
    objActive: "rgba(172,147,110,0.12)",
    objActiveBorder: "rgba(172,147,110,0.2)",
    subCardBg: "rgba(255,255,255,0.015)",
  },
  light: {
    bg: "#f4f0ea",
    surface: "rgba(255,255,255,0.75)",
    border: "rgba(0,0,0,0.06)",
    borderFocus: "rgba(152,122,80,0.45)",
    text: "#1d1d1f",
    textMuted: "rgba(0,0,0,0.45)",
    textDim: "rgba(0,0,0,0.22)",
    copper: "#987a50",
    copperLight: "rgba(152,122,80,0.1)",
    copperGlow: "rgba(152,122,80,0.06)",
    green: "#2d8a42",
    greenBg: "rgba(45,138,66,0.07)",
    red: "#c43e3e",
    redBg: "rgba(196,62,62,0.06)",
    inputBg: "rgba(0,0,0,0.02)",
    toggleKnob: "#fff",
    toggleOff: "rgba(0,0,0,0.08)",
    toggleKnobOff: "rgba(0,0,0,0.15)",
    headerGlow: "rgba(152,122,80,0.04)",
    lineLeft: "transparent",
    lineRight: "transparent",
    cardShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.025)",
    tabActive: "#1d1d1f",
    tabActiveText: "#f4f0ea",
    tabInactive: "rgba(0,0,0,0.03)",
    objActive: "rgba(152,122,80,0.08)",
    objActiveBorder: "rgba(152,122,80,0.18)",
    subCardBg: "rgba(0,0,0,0.02)",
  },
};

const ThemeCtx = createContext(themes.dark);
const useTheme = () => useContext(ThemeCtx);

const defaultObj = (n) => ({
  name: n === 1 ? "ETW 1.DG + 2.DG" : `Objekt ${n}`,
  flaeche: n === 1 ? 81.2 : 0,
  kpEtw: n === 1 ? 410000 : 0,
  kpTg: n === 1 ? 30000 : 0,
  grest: n === 1 ? 0.05 : 0, notar: n === 1 ? 0.02 : 0, makler: 0, reno: 0,
  ek: n === 1 ? 50000 : 0,
  zins: n === 1 ? 0.0329 : 0,
  tilg: n === 1 ? 0.015 : 0,
  stAktiv: n === 1, stSatz: 0.05,
  gebAnt: n === 1 ? 0.8 : 0,
  mieteQm: n === 1 ? 17 : 0,
  stellplatz: n === 1 ? 80 : 0,
  ausfall: n === 1 ? 0.02 : 0,
  nulk: n === 1 ? 50 : 0,
  ruecklQm: n === 1 ? 1.5 : 0,
  inst: 0, verw: 0,
  afaSatz: n === 1 ? 0.05 : 0,
  afaDauer: n === 1 ? 6 : 0,
  afaLin: n === 1 ? 0.02 : 0,
});

function calc(o) {
  const kpGes = o.kpEtw + o.kpTg;
  const nk = kpGes * o.grest + kpGes * o.notar + kpGes * o.makler + o.reno;
  const invest = kpGes + nk;
  const fk = invest - o.ek;
  const ann = o.zins + o.tilg;
  const rateJ = fk * ann;
  const stBetrag = o.stAktiv ? fk * o.stSatz : 0;
  const gesBelast = rateJ + stBetrag;
  const gebWert = invest * o.gebAnt;
  const mieteM = o.mieteQm * o.flaeche + o.stellplatz;
  const mieteJ = mieteM * 12;
  const mieteNetto = mieteJ * (1 - o.ausfall);
  const ruecklJ = o.ruecklQm * o.flaeche * 12;
  const bkJ = (o.nulk + o.inst + o.verw) * 12 + ruecklJ;
  const afaSonderJ = gebWert * o.afaSatz;
  const afaLinJ = gebWert * o.afaLin;
  const zinsenJ = fk * o.zins;
  const tilgJ = fk * o.tilg;
  const wk = afaSonderJ + zinsenJ + bkJ;
  const vuv = mieteNetto - wk;
  const cfVor = mieteNetto - zinsenJ - tilgJ - stBetrag - bkJ;
  const brutto = invest > 0 ? mieteJ / invest : 0;
  const tp = [];
  let rest = fk;
  for (let yr = 1; yr <= 30; yr++) {
    const z = rest * o.zins;
    const t = Math.min(rateJ - z, rest);
    const st = o.stAktiv ? Math.min(stBetrag, Math.max(rest - t, 0)) : 0;
    const ende = Math.max(rest - t - st, 0);
    tp.push({ yr, anfang: rest, zins: z, tilg: t, sonder: st, ende });
    rest = ende;
  }
  return { kpGes, nk, invest, fk, ann, rateJ, stBetrag, gesBelast, gebWert, mieteM, mieteJ, mieteNetto, ruecklJ, bkJ, afaSonderJ, afaLinJ, zinsenJ, tilgJ, wk, vuv, cfVor, brutto, tp };
}

const Input = ({ label, value, onChange, suffix = "€", step, min, note }) => {
  const T = useTheme();
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <label style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, letterSpacing: 0.3 }}>{label}</label>
        {note && <span style={{ fontSize: 10, color: T.textDim }}>{note}</span>}
      </div>
      <div style={{ position: "relative" }}>
        <input type="number" value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step || (suffix === "%" ? 0.1 : suffix.includes("m") ? 0.5 : 1000)} min={min ?? 0}
          style={{
            width: "100%", padding: "11px 44px 11px 14px", borderRadius: 8,
            border: `1px solid ${T.border}`, fontSize: 16, fontWeight: 600,
            fontFamily: "inherit", background: T.inputBg, color: T.text,
            outline: "none", transition: "all 0.25s ease", boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = T.borderFocus; e.target.style.boxShadow = `0 0 0 3px ${T.copperGlow}`; }}
          onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
        />
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: T.textDim, fontWeight: 500, pointerEvents: "none" }}>{suffix}</span>
      </div>
    </div>
  );
};

const Toggle = ({ label, value, onChange }) => {
  const T = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <label style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{label}</label>
      <div onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 12, cursor: "pointer",
        background: value ? T.copper : T.toggleOff,
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)", position: "relative",
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: 9, background: value ? T.toggleKnob : T.toggleKnobOff,
          position: "absolute", top: 3, left: value ? 23 : 3,
          transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
};

const Metric = ({ label, value, sub, highlight, small }) => {
  const T = useTheme();
  return (
    <div style={{ padding: small ? "8px 0" : "12px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: small ? 11 : 12, color: T.textMuted, fontWeight: 500 }}>{label}</span>
        <span style={{
          fontSize: small ? 13 : 16, fontWeight: 600, fontFeatureSettings: "'tnum'", letterSpacing: -0.3,
          color: highlight === "green" ? T.green : highlight === "red" ? T.red : highlight === "copper" ? T.copper : T.text,
        }}>{value}</span>
      </div>
      {sub && <div style={{ fontSize: 10, color: T.textDim, marginTop: 2, textAlign: "right" }}>{sub}</div>}
    </div>
  );
};

const Card = ({ title, children, accent }) => {
  const T = useTheme();
  return (
    <div style={{
      background: T.surface, backdropFilter: "blur(40px) saturate(1.4)",
      borderRadius: 14, padding: "20px 20px", marginBottom: 12,
      border: `1px solid ${T.border}`, boxShadow: T.cardShadow,
    }}>
      {title && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: accent || T.copper, marginBottom: 14 }}>{title}</div>}
      {children}
    </div>
  );
};

const Divider = ({ color }) => {
  const T = useTheme();
  return <div style={{ height: 1, background: `linear-gradient(90deg, ${(color || T.copper)}40, transparent)`, margin: "4px 0" }} />;
};

const BigNumber = ({ label, value, color, sub }) => {
  const T = useTheme();
  const c = color || T.green;
  return (
    <div style={{
      background: c === T.green ? T.greenBg : T.copperLight,
      borderRadius: 12, padding: "18px 20px", marginTop: 12, textAlign: "center",
      border: `1px solid ${c === T.green ? `${T.green}18` : `${T.copper}14`}`,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: T.textMuted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: c, letterSpacing: -1, fontFeatureSettings: "'tnum'" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
};

const ObjPicker = ({ active, set, enabled, onToggle }) => {
  const T = useTheme();
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          flex: 1, borderRadius: 8, overflow: "hidden",
          border: `1px solid ${active === i && enabled[i] ? T.objActiveBorder : T.border}`,
          background: active === i && enabled[i] ? T.objActive : "transparent",
          opacity: enabled[i] ? 1 : 0.4,
          transition: "all 0.3s ease",
        }}>
          <button onClick={() => enabled[i] && set(i)} style={{
            width: "100%", padding: "8px 6px 2px", border: "none", cursor: enabled[i] ? "pointer" : "default",
            background: "transparent",
            color: active === i && enabled[i] ? T.copper : T.textDim,
            fontSize: 11, fontWeight: 700, fontFamily: "inherit", letterSpacing: 0.5,
          }}>Objekt {i + 1}</button>
          <div style={{ display: "flex", justifyContent: "center", padding: "2px 0 6px" }}>
            <div onClick={(e) => { e.stopPropagation(); onToggle(i); }} style={{
              width: 30, height: 16, borderRadius: 8, cursor: "pointer",
              background: enabled[i] ? T.copper : T.toggleOff,
              transition: "all 0.3s ease", position: "relative",
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: 6,
                background: enabled[i] ? T.toggleKnob : T.toggleKnobOff,
                position: "absolute", top: 2, left: enabled[i] ? 16 : 2,
                transition: "all 0.3s ease",
              }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Theme toggle icon ── */
const ThemeToggle = ({ isDark, onToggle }) => {
  const T = useTheme();
  return (
    <button onClick={onToggle} style={{
      position: "fixed", top: 16, right: 16, zIndex: 100,
      width: 40, height: 40, borderRadius: 20, border: `1px solid ${T.border}`,
      background: T.surface, backdropFilter: "blur(20px)",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: T.cardShadow, transition: "all 0.4s ease",
    }}
    aria-label="Theme wechseln"
    >
      <div style={{ fontSize: 18, lineHeight: 1, transition: "transform 0.4s ease", transform: isDark ? "rotate(0deg)" : "rotate(180deg)" }}>
        {isDark ? "☀" : "☾"}
      </div>
    </button>
  );
};

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const T = isDark ? themes.dark : themes.light;

  const [tab, setTab] = useState(0);
  const [activeObj, setActiveObj] = useState(0);
  const [objects, setObjects] = useState([defaultObj(1), defaultObj(2), defaultObj(3)]);
  const [enabled, setEnabled] = useState([true, false, false]);
  const [gehalt, setGehalt] = useState(50000);
  const [steuersatz, setSteuersatz] = useState(0.44);
  const [exitJahr, setExitJahr] = useState(10);
  const [exitWertst, setExitWertst] = useState(0.015);

  const toggleEnabled = useCallback((i) => {
    setEnabled(prev => {
      const n = [...prev];
      n[i] = !n[i];
      if (!n.some(Boolean)) return prev;
      return n;
    });
  }, []);

  // When toggling, auto-select first enabled if current is disabled
  const safeActiveObj = enabled[activeObj] ? activeObj : enabled.findIndex(Boolean);
  const setActiveObjSafe = useCallback((i) => { if (enabled[i]) setActiveObj(i); }, [enabled]);

  const upd = useCallback((key, val) => {
    setObjects(prev => { const n = [...prev]; n[safeActiveObj] = { ...n[safeActiveObj], [key]: val }; return n; });
  }, [safeActiveObj]);

  const calcs = useMemo(() => objects.map(calc), [objects]);
  const o = objects[safeActiveObj], c = calcs[safeActiveObj];

  const portfolio = useMemo(() => {
    const t = (k) => calcs.reduce((s, c, i) => enabled[i] ? s + c[k] : s, 0);
    const tO = (k) => objects.reduce((s, o, i) => enabled[i] ? s + o[k] : s, 0);
    return { invest: t("invest"), fk: t("fk"), ek: tO("ek"), mieteNetto: t("mieteNetto"), bkJ: t("bkJ"), zinsenJ: t("zinsenJ"), tilgJ: t("tilgJ"), stBetrag: t("stBetrag"), cfVor: t("cfVor"), vuv: t("vuv"), mieteJ: t("mieteJ"), kpGes: t("kpGes") };
  }, [calcs, objects, enabled]);

  const steuer = useMemo(() => {
    const zveOhne = gehalt - 1230, zveMit = zveOhne + portfolio.vuv;
    return { zveOhne, zveMit, stOhne: zveOhne * steuersatz, stMit: zveMit * steuersatz, ersparnis: (zveOhne - zveMit) * steuersatz };
  }, [gehalt, steuersatz, portfolio.vuv]);

  const exit = useMemo(() => {
    const vp = portfolio.kpGes * Math.pow(1 + exitWertst, exitJahr);
    let rs = 0; calcs.forEach((c, i) => { if (!enabled[i]) return; const r = c.tp[Math.min(exitJahr - 1, 29)]; rs += r ? r.ende : 0; });
    const vk = vp * 0.02, vf = rs * 0.01, netto = vp - vk - rs - vf;
    const kumCf = calcs.reduce((s, c, i) => { if (!enabled[i]) return s; let cf = 0; for (let j = 0; j < Math.min(exitJahr, 30); j++) cf += c.cfVor; return s + cf; }, 0) + steuer.ersparnis * exitJahr;
    const gew = netto + kumCf - portfolio.ek;
    return { verkPreis: vp, restschuld: rs, verkKosten: vk, vorfaellig: vf, netto, kumCf, gewinn: gew, rendite: portfolio.ek > 0 ? gew / portfolio.ek : 0, renditePA: portfolio.ek > 0 ? gew / portfolio.ek / exitJahr : 0, steuerfrei: exitJahr >= 10 };
  }, [calcs, portfolio, exitJahr, exitWertst, steuer.ersparnis, enabled]);

  return (
    <ThemeCtx.Provider value={T}>
      <div style={{
        minHeight: "100vh",
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
        background: T.bg, color: T.text,
        WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale",
        transition: "background 0.5s ease, color 0.4s ease",
      }}>

        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />

        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 300, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse 70% 40% at 50% -10%, ${T.headerGlow} 0%, transparent 100%)`, transition: "background 0.5s ease" }} />

        {/* Header */}
        <div style={{ position: "relative", zIndex: 1, padding: "36px 24px 0", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, transparent, ${T.copper}40)` }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: T.textDim }}>Immobilien</span>
            <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${T.copper}40, transparent)` }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.5, color: T.text, transition: "color 0.4s ease" }}>Investment Analyse</h1>
          <p style={{ fontSize: 11, color: T.textDim, margin: "8px 0 28px", letterSpacing: 1.5 }}>
            {enabled.filter(Boolean).length} {enabled.filter(Boolean).length === 1 ? "Objekt" : "Objekte"} · Finanzierung · Steuer
          </p>
        </div>

        {/* Tabs */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 3, padding: "0 16px", marginBottom: 20, overflowX: "auto", scrollbarWidth: "none" }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: "8px 16px", borderRadius: 18, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "inherit",
              background: tab === i ? T.tabActive : T.tabInactive,
              color: tab === i ? T.tabActiveText : T.textDim,
              transition: "all 0.3s ease", letterSpacing: 0.3,
            }}>{t}</button>
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 1, padding: "0 16px 40px", maxWidth: 500, margin: "0 auto" }}>

          {tab === 0 && <>
            <ObjPicker active={safeActiveObj} set={setActiveObjSafe} enabled={enabled} onToggle={toggleEnabled} />
            <Card title="Objektdaten">
              <Input label="Wohnfläche" value={o.flaeche} onChange={v => upd("flaeche", v)} suffix="m²" step={0.1} />
              <Input label="Kaufpreis Wohnung" value={o.kpEtw} onChange={v => upd("kpEtw", v)} />
              <Input label="Kaufpreis Stellplatz" value={o.kpTg} onChange={v => upd("kpTg", v)} />
              <Input label="Grunderwerbsteuer" value={o.grest * 100} onChange={v => upd("grest", v / 100)} suffix="%" step={0.5} />
              <Input label="Notarkosten" value={o.notar * 100} onChange={v => upd("notar", v / 100)} suffix="%" step={0.1} />
              <Input label="Maklergebühr" value={o.makler * 100} onChange={v => upd("makler", v / 100)} suffix="%" />
              <Metric label="Gesamtinvestition" value={fmtE(c.invest)} highlight="copper" />
            </Card>
            <Card title="Mieteinnahmen">
              <Input label="Kaltmiete" value={o.mieteQm} onChange={v => upd("mieteQm", v)} suffix="€/m²" step={0.5} />
              <Input label="Stellplatz-Miete" value={o.stellplatz} onChange={v => upd("stellplatz", v)} suffix="€/Mon" step={10} />
              <Input label="Mietausfallwagnis" value={o.ausfall * 100} onChange={v => upd("ausfall", v / 100)} suffix="%" step={0.5} />
              <Metric label="Mieteinnahmen monatlich" value={fmtE(c.mieteM, 2)} />
              <Metric label="Netto p.a." value={fmtE(c.mieteNetto)} highlight="green" />
              <Metric label="Bruttorendite" value={fmtP(c.brutto)} highlight="copper" />
            </Card>
            <Card title="Abschreibung · AfA">
              <Input label="Gebäudeanteil" value={o.gebAnt * 100} onChange={v => upd("gebAnt", v / 100)} suffix="%" step={1} />
              <Input label="AfA-Satz Sonder" value={o.afaSatz * 100} onChange={v => upd("afaSatz", v / 100)} suffix="%" step={0.5} note={o.afaSatz >= 0.05 ? "§7b" : "§7.4"} />
              <Input label="Sonder-AfA Dauer" value={o.afaDauer} onChange={v => upd("afaDauer", v)} suffix="J." step={1} />
              <Metric label="Gebäudewert" value={fmtE(c.gebWert)} />
              <Metric label="AfA Sonderperiode" value={fmtE(c.afaSonderJ)} highlight="copper" />
              <Metric label="AfA danach" value={fmtE(c.afaLinJ)} />
            </Card>
          </>}

          {tab === 1 && <>
            <ObjPicker active={safeActiveObj} set={setActiveObjSafe} enabled={enabled} onToggle={toggleEnabled} />
            <Card title="Finanzierung">
              <Input label="Eigenkapital" value={o.ek} onChange={v => upd("ek", v)} />
              <Input label="Zinssatz" value={o.zins * 100} onChange={v => upd("zins", v / 100)} suffix="%" step={0.01} />
              <Input label="Anfängliche Tilgung" value={o.tilg * 100} onChange={v => upd("tilg", v / 100)} suffix="%" step={0.1} />
              <Toggle label="Sondertilgung" value={o.stAktiv} onChange={v => upd("stAktiv", v)} />
              {o.stAktiv && <Input label="Sondertilgungssatz" value={o.stSatz * 100} onChange={v => upd("stSatz", v / 100)} suffix="%" step={1} />}
              <Divider />
              <Metric label="Fremdkapital" value={fmtE(c.fk)} />
              <Metric label="Rate monatlich" value={fmtE(c.rateJ / 12, 2)} />
              {o.stAktiv && <Metric label="Sondertilgung p.a." value={fmtE(c.stBetrag)} highlight="copper" />}
              <Metric label="Gesamtbelastung p.a." value={fmtE(c.gesBelast)} highlight="red" />
            </Card>
            <Card title="Tilgungsplan">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["J.", "Restschuld", "Zinsen", "Tilgung", o.stAktiv && "Sonder", "Rest"].filter(Boolean).map(h =>
                      <th key={h} style={{ padding: "7px 4px", textAlign: "right", color: T.textDim, fontWeight: 600, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>{h}</th>
                    )}
                  </tr></thead>
                  <tbody>{c.tp.filter((_, i) => i < 10 || i % 5 === 4).map(r =>
                    <tr key={r.yr} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "7px 4px", fontWeight: 700, color: T.copper, fontSize: 10 }}>{r.yr}</td>
                      <td style={{ padding: "7px 4px", textAlign: "right", fontFeatureSettings: "'tnum'" }}>{fmtE(r.anfang)}</td>
                      <td style={{ padding: "7px 4px", textAlign: "right", color: T.red, fontFeatureSettings: "'tnum'" }}>{fmtE(r.zins)}</td>
                      <td style={{ padding: "7px 4px", textAlign: "right", color: T.green, fontFeatureSettings: "'tnum'" }}>{fmtE(r.tilg)}</td>
                      {o.stAktiv && <td style={{ padding: "7px 4px", textAlign: "right", color: T.copper, fontFeatureSettings: "'tnum'" }}>{fmtE(r.sonder)}</td>}
                      <td style={{ padding: "7px 4px", textAlign: "right", fontWeight: 600, fontFeatureSettings: "'tnum'" }}>{fmtE(r.ende)}</td>
                    </tr>
                  )}</tbody>
                </table>
              </div>
            </Card>
          </>}

          {tab === 2 && <>
            <ObjPicker active={safeActiveObj} set={setActiveObjSafe} enabled={enabled} onToggle={toggleEnabled} />
            <Card title="Bewirtschaftungskosten">
              <Input label="Nicht umlagefähig" value={o.nulk} onChange={v => upd("nulk", v)} suffix="€/Mon" step={10} />
              <Input label="Rücklage" value={o.ruecklQm} onChange={v => upd("ruecklQm", v)} suffix="€/m²" step={0.1} />
              <Input label="Instandhaltung" value={o.inst} onChange={v => upd("inst", v)} suffix="€/Mon" step={10} />
              <Input label="Verwaltung" value={o.verw} onChange={v => upd("verw", v)} suffix="€/Mon" step={10} />
              <Metric label="BK jährlich" value={fmtE(c.bkJ)} />
            </Card>
            <Card title="Cashflow">
              <Metric label="(+) Miete netto" value={fmtE(c.mieteNetto)} highlight="green" />
              <Metric label="(-) Bewirtschaftung" value={fmtE(-c.bkJ)} />
              <Metric label="(-) Zinsen" value={fmtE(-c.zinsenJ)} highlight="red" />
              <Metric label="(-) Tilgung" value={fmtE(-c.tilgJ)} />
              {o.stAktiv && <Metric label="(-) Sondertilgung" value={fmtE(-c.stBetrag)} sub="nicht absetzbar" />}
              <Divider />
              <Metric label="CF vor Steuern" value={fmtE(c.cfVor)} highlight={c.cfVor >= 0 ? "green" : "red"} />
              <Metric label="(+) Steuerersparnis" value={c.vuv < 0 ? fmtE(-c.vuv * steuersatz) : "0 €"} highlight="green" sub={c.vuv < 0 ? "aus V+V Verlust" : ""} />
              <Divider color={T.green} />
              {(() => { const n = c.cfVor + (c.vuv < 0 ? -c.vuv * steuersatz : 0); return <>
                <Metric label="CF nach Steuern" value={fmtE(n)} highlight={n >= 0 ? "green" : "red"} />
                <Metric label="Pro Monat" value={fmtE(n / 12, 2)} highlight={n >= 0 ? "green" : "red"} sub="netto" />
              </>; })()}
            </Card>
          </>}

          {tab === 3 && <>
            <Card title="Steuerdaten">
              <Input label="Brutto-Jahresgehalt" value={gehalt} onChange={setGehalt} />
              <Input label="Grenzsteuersatz" value={steuersatz * 100} onChange={v => setSteuersatz(v / 100)} suffix="%" step={1} />
            </Card>
            <Card title="Einkünfte V+V">
              {calcs.map((c, i) => enabled[i] ? <Metric key={i} label={`Objekt ${i + 1}`} value={fmtE(c.vuv)} highlight={c.vuv < 0 ? "green" : "red"} sub={c.vuv < 0 ? "Verlust → Ersparnis" : "Gewinn → Nachzahlung"} /> : null)}
              <Divider />
              <Metric label="Summe V+V" value={fmtE(portfolio.vuv)} highlight={portfolio.vuv < 0 ? "green" : "red"} />
            </Card>
            <Card title="Steuerberechnung" accent={T.green}>
              <Metric label="ZvE ohne Immobilien" value={fmtE(steuer.zveOhne)} />
              <Metric label="ZvE mit Immobilien" value={fmtE(steuer.zveMit)} />
              <Divider color={T.green} />
              <Metric label="Steuerlast OHNE" value={fmtE(steuer.stOhne)} />
              <Metric label="Steuerlast MIT" value={fmtE(steuer.stMit)} />
              <BigNumber label="Steuerersparnis" value={fmtE(steuer.ersparnis)} color={T.green} sub={`${fmtE(steuer.ersparnis / 12, 2)} / Monat`} />
            </Card>
            <Card title="Aufschlüsselung">
              {calcs.map((c, i) => !enabled[i] ? null : (
                <div key={i} style={{ marginBottom: 12, padding: "12px 14px", background: T.subCardBg, borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.copper, marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" }}>Objekt {i + 1}</div>
                  <Metric label="AfA" value={fmtE(c.afaSonderJ)} small />
                  <Metric label="Schuldzinsen" value={fmtE(c.zinsenJ)} small />
                  <Metric label="Steuerersparnis" value={c.vuv < 0 ? fmtE(-c.vuv * steuersatz) : "0 €"} highlight="green" small />
                  {objects[i].stAktiv && <Metric label="Sondertilgung (nicht absetzbar)" value={fmtE(c.stBetrag)} highlight="red" small />}
                </div>
              ))}
            </Card>
          </>}

          {tab === 4 && <>
            <Card title="Portfolio Gesamt">
              <Metric label="Gesamtinvestition" value={fmtE(portfolio.invest)} highlight="copper" />
              <Metric label="Eigenkapital" value={fmtE(portfolio.ek)} />
              <Metric label="Fremdkapital" value={fmtE(portfolio.fk)} />
            </Card>
            <Card title="Jährlich">
              <Metric label="Miete netto" value={fmtE(portfolio.mieteNetto)} highlight="green" />
              <Metric label="Bewirtschaftung" value={fmtE(-portfolio.bkJ)} />
              <Metric label="Zinsen" value={fmtE(-portfolio.zinsenJ)} highlight="red" />
              <Metric label="Tilgung + Sondertilg." value={fmtE(-portfolio.tilgJ - portfolio.stBetrag)} />
              <Divider />
              <Metric label="Cashflow" value={fmtE(portfolio.cfVor)} highlight={portfolio.cfVor >= 0 ? "green" : "red"} />
              <Metric label="Steuerersparnis" value={fmtE(steuer.ersparnis)} highlight="green" />
              <Divider color={T.green} />
              <Metric label="Effektiver Cashflow" value={fmtE(portfolio.cfVor + steuer.ersparnis)} highlight={portfolio.cfVor + steuer.ersparnis >= 0 ? "green" : "red"} sub="inkl. Steuererstattung" />
            </Card>
            <Card title="Vergleich">
              {calcs.map((c, i) => { if (!enabled[i]) return null; const n = c.cfVor + (c.vuv < 0 ? -c.vuv * steuersatz : 0); return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div><div style={{ fontSize: 13, fontWeight: 600 }}>{objects[i].name}</div><div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{fmtE(c.invest)} · {fmtP(c.brutto)}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: 15, fontWeight: 700, color: n >= 0 ? T.green : T.red, fontFeatureSettings: "'tnum'" }}>{fmtE(n / 12, 0)}</div><div style={{ fontSize: 9, color: T.textDim }}>CF/Mon</div></div>
                </div>
              ); })}
            </Card>
            <Card title="Wahre Rechnung" accent={T.green}>
              <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.7, marginBottom: 12 }}>Negativer Cashflow ≠ Verlust</div>
              <Metric label="Zuzahlung/Monat" value={fmtE((portfolio.cfVor + steuer.ersparnis) / 12, 0)} highlight={(portfolio.cfVor + steuer.ersparnis) >= 0 ? "green" : "red"} />
              <Metric label="Vermögensaufbau/Monat" value={fmtE((portfolio.tilgJ + portfolio.stBetrag) / 12, 0)} highlight="green" sub="Tilgung" />
              <Metric label="Wertsteigerung/Monat" value={fmtE(portfolio.kpGes * 0.015 / 12, 0)} highlight="green" sub="~1,5% p.a." />
              <BigNumber label="Vermögenszuwachs p.a." value={fmtE(portfolio.tilgJ + portfolio.stBetrag + portfolio.kpGes * 0.015 + steuer.ersparnis)} color={T.copper} />
            </Card>
          </>}

          {tab === 5 && <>
            <Card title="Verkauf">
              <Input label="Verkauf nach Jahr" value={exitJahr} onChange={setExitJahr} suffix="Jahre" step={1} min={1} />
              <Input label="Wertsteigerung p.a." value={exitWertst * 100} onChange={v => setExitWertst(v / 100)} suffix="%" step={0.1} />
              <div style={{ padding: "10px 14px", borderRadius: 8, marginTop: 8, background: exit.steuerfrei ? T.greenBg : T.redBg, border: `1px solid ${exit.steuerfrei ? `${T.green}20` : `${T.red}20`}`, fontSize: 11, fontWeight: 600, color: exit.steuerfrei ? T.green : T.red }}>
                {exit.steuerfrei ? "✓ Steuerfrei — ≥ 10 Jahre" : "⚠ Spekulationssteuerpflichtig"}
              </div>
            </Card>
            <Card title="Verkaufsrechnung">
              <Metric label="Verkaufspreis" value={fmtE(exit.verkPreis)} highlight="copper" />
              <Metric label="(-) Kosten 2%" value={fmtE(-exit.verkKosten)} />
              <Metric label="(-) Restschuld" value={fmtE(-exit.restschuld)} highlight="red" />
              <Metric label="(-) Vorfälligkeit" value={fmtE(-exit.vorfaellig)} />
              <Divider />
              <Metric label="Netto-Erlös" value={fmtE(exit.netto)} highlight="green" />
            </Card>
            <Card title="Gesamtbilanz" accent={T.green}>
              <Metric label="EK-Einsatz" value={fmtE(-portfolio.ek)} highlight="red" />
              <Metric label="Netto-Erlös" value={fmtE(exit.netto)} highlight="green" />
              <Metric label="Kum. CF + Steuer" value={fmtE(exit.kumCf)} highlight={exit.kumCf >= 0 ? "green" : "red"} />
              <BigNumber label="Gesamtgewinn" value={fmtE(exit.gewinn)} color={T.green} />
              <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{fmtP(exit.rendite)}</div><div style={{ fontSize: 9, color: T.textDim, letterSpacing: 1, marginTop: 2 }}>GESAMT</div></div>
                <div style={{ width: 1, background: T.border }} />
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: T.copper, fontFeatureSettings: "'tnum'" }}>{fmtP(exit.renditePA)}</div><div style={{ fontSize: 9, color: T.textDim, letterSpacing: 1, marginTop: 2 }}>P.A.</div></div>
              </div>
            </Card>
          </>}
        </div>

        <div style={{ textAlign: "center", padding: "0 0 36px", fontSize: 9, color: T.textDim, letterSpacing: 1, transition: "color 0.4s ease" }}>
          Alle Berechnungen ohne Gewähr · Keine Steuerberatung
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}

