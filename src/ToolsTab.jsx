import React, { useState } from "react";

/* =========================================================================
   Haberdash Haven — Tools tab
   Standalone, self-contained quilting calculators (Tiers 1–3).
   Styling references existing CSS custom properties from styles.css
   (var(--teal), var(--sun-gold), etc.) so it inherits the brand palette.
   No external deps beyond React. Drop into src/ and wire one <ToolsTab/>.
   ========================================================================= */

/* ---------- math helpers ---------- */
const EIGHTHS = ["", "1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8"];
const num = (v) => {
  const n = parseFloat(v);
  return isFinite(n) ? n : 0;
};
const ceil8 = (x) => Math.ceil(x * 8) / 8;
function toFrac(x, unit = '"') {
  if (!isFinite(x) || x <= 0) return "—";
  const r = Math.round(x * 8) / 8;
  const whole = Math.floor(r);
  const f = Math.round((r - whole) * 8);
  if (f === 0) return whole + unit;
  if (whole === 0) return EIGHTHS[f] + unit;
  return whole + " " + EIGHTHS[f] + unit;
}
function yards(inches) {
  return Math.ceil((inches / 36) * 8) / 8;
}
function fracYd(y) {
  if (!isFinite(y) || y <= 0) return "—";
  const whole = Math.floor(y);
  const f = Math.round((y - whole) * 8);
  if (f === 0) return whole + " yd";
  if (whole === 0) return EIGHTHS[f] + " yd";
  return whole + " " + EIGHTHS[f] + " yd";
}

/* ---------- UI primitives ---------- */
// Layout only. Every surface, font, and color comes from styles.css via the
// app's own selectors: .card + <h2> (gradient-underlined title), global <label>
// (teal bold), .input (pale-teal field), .muted (helper text).
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

function Field({ label, value, onChange, suffix, step = "0.25", min = "0" }) {
  return (
    <label>
      {label}
      {suffix ? <span className="muted" style={{ display: "inline", fontWeight: 600 }}> ({suffix})</span> : null}
      <input
        className="input"
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label>
      {label}
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Result({ children }) {
  return (
    <div
      style={{
        marginTop: 2,
        background: "var(--teal-pale)",
        border: "1.5px solid var(--border-teal)",
        borderRadius: "var(--r-sm)",
        padding: "10px 14px",
        boxShadow: "var(--shadow-inset), 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      {children}
    </div>
  );
}
function Row({ k, v, big }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        padding: "3px 0",
      }}
    >
      <span className="muted" style={{ marginTop: 0 }}>{k}</span>
      <span
        style={{
          color: "var(--teal)",
          fontWeight: 800,
          fontSize: big ? 16 : 14,
          textAlign: "right",
          textShadow: "0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {v}
      </span>
    </div>
  );
}
function Note({ children }) {
  return (
    <p className="muted" style={{ marginTop: 10, lineHeight: 1.5 }}>
      {children}
    </p>
  );
}
function CalcCard({ title, sub, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {sub ? <p className="muted" style={{ marginTop: -10, marginBottom: 14, lineHeight: 1.5 }}>{sub}</p> : null}
      {children}
    </div>
  );
}

/* =========================================================================
   TIER 1
   ========================================================================= */

function BackingBatting() {
  const [w, setW] = useState("60");
  const [l, setL] = useState("72");
  const [ov, setOv] = useState("4");
  const [bolt, setBolt] = useState("42");
  const W = num(w), L = num(l), O = num(ov), B = num(bolt) || 42;
  const bw = W + 2 * O, bl = L + 2 * O;
  // orientation A: panels run vertically (cover the width)
  const pA = Math.max(1, Math.ceil(bw / B));
  const lenA = pA * bl + (pA - 1) * 0.5;
  // orientation B: panels run horizontally
  const pB = Math.max(1, Math.ceil(bl / B));
  const lenB = pB * bw + (pB - 1) * 0.5;
  const useA = lenA <= lenB;
  const panels = useA ? pA : pB;
  const len = useA ? lenA : lenB;
  const seamDir = useA ? "vertical (parallel to length)" : "horizontal (parallel to width)";

  return (
    <CalcCard
      title="Backing & Batting"
      sub="Yardage for the back, plus the batting cut size. Compares both seam orientations and picks the thriftier one."
    >
      <div style={grid2}>
        <Field label="Quilt width" value={w} onChange={setW} suffix="in" />
        <Field label="Quilt length" value={l} onChange={setL} suffix="in" />
        <Field label="Overage per side" value={ov} onChange={setOv} suffix="in" />
        <Field label="Usable bolt width" value={bolt} onChange={setBolt} suffix="in" />
      </div>
      <Result>
        <Row k="Batting cut size" v={`${toFrac(bw)} × ${toFrac(bl)}`} big />
        <div style={{ height: 6 }} />
        <Row k="Backing panels" v={`${panels} × full width`} />
        <Row k="Seams run" v={seamDir} />
        <Row k="Backing fabric" v={fracYd(yards(len))} big />
      </Result>
      <Note>
        Overage covers shifting + longarm clamps — use ~2&quot; per side if you quilt it yourself, 3–4&quot; for a
        longarmer. Backing assumes a {B}&quot; usable width; 1/2&quot; seam allowance per join.
      </Note>
    </CalcCard>
  );
}

function Binding() {
  const [w, setW] = useState("60");
  const [l, setL] = useState("72");
  const [sw, setSw] = useState("2.5");
  const [extra, setExtra] = useState("10");
  const [bolt, setBolt] = useState("42");
  const W = num(w), L = num(l), SW = num(sw) || 2.5, EX = num(extra), B = num(bolt) || 42;
  const perim = 2 * (W + L);
  const total = perim + EX;
  const strips = Math.max(1, Math.ceil(total / B));
  const fabricIn = strips * SW;
  return (
    <CalcCard
      title="Binding"
      sub="Strips and yardage for double-fold binding around the whole quilt."
    >
      <div style={grid2}>
        <Field label="Quilt width" value={w} onChange={setW} suffix="in" />
        <Field label="Quilt length" value={l} onChange={setL} suffix="in" />
        <Field label="Strip width" value={sw} onChange={setSw} suffix="in" step="0.125" />
        <Field label="Extra (corners + join)" value={extra} onChange={setExtra} suffix="in" />
      </div>
      <Field label="Usable bolt width" value={bolt} onChange={setBolt} suffix="in" />
      <Result>
        <Row k="Perimeter" v={toFrac(perim)} />
        <Row k="Binding length needed" v={toFrac(total)} />
        <Row k="Strips to cut" v={`${strips} @ ${toFrac(SW)}`} big />
        <Row k="Binding fabric" v={fracYd(yards(fabricIn))} big />
      </Result>
      <Note>2 1/2&quot; strips give a standard 3/8&quot; double-fold finish. Bump the extra if you want more mitre wiggle room.</Note>
    </CalcCard>
  );
}

function Borders() {
  const [w, setW] = useState("48");
  const [l, setL] = useState("60");
  const [bw, setBw] = useState("4");
  const [bolt, setBolt] = useState("42");
  const W = num(w), L = num(l), BW = num(bw), B = num(bolt) || 42;
  // butted: sides first (length L), then top/bottom (length W + 2*BW)
  const sideLen = L;
  const topLen = W + 2 * BW;
  const totalLen = 2 * sideLen + 2 * topLen;
  const strips = Math.max(1, Math.ceil(totalLen / B));
  const fabricIn = strips * BW;
  const newW = W + 2 * BW, newL = L + 2 * BW;
  return (
    <CalcCard
      title="Borders"
      sub="Cross-grain (WOF) border strips for all four sides, butted corners."
    >
      <div style={grid2}>
        <Field label="Quilt top width" value={w} onChange={setW} suffix="in" />
        <Field label="Quilt top length" value={l} onChange={setL} suffix="in" />
        <Field label="Border width (finished + seams)" value={bw} onChange={setBw} suffix="in" />
        <Field label="Usable bolt width" value={bolt} onChange={setBolt} suffix="in" />
      </div>
      <Result>
        <Row k="Strips to cut" v={`${strips} @ ${toFrac(BW)}`} big />
        <Row k="Border fabric" v={fracYd(yards(fabricIn))} big />
        <div style={{ height: 6 }} />
        <Row k="New quilt size" v={`${toFrac(newW)} × ${toFrac(newL)}`} />
      </Result>
      <Note>
        For one continuous border with no piecing seams, cut these lengthwise instead — you&apos;ll need{" "}
        {fracYd(yards(Math.max(newL, newW)))} of length. Run again with the new size for a second border.
      </Note>
    </CalcCard>
  );
}

function PieceCount() {
  const [mode, setMode] = useState("from"); // from = how many fit; need = yardage for N pieces
  const [pw, setPw] = useState("5");
  const [pl, setPl] = useState("5");
  const [fw, setFw] = useState("42");
  const [fl, setFl] = useState("36");
  const [need, setNeed] = useState("40");
  const PW = num(pw), PL = num(pl), FW = num(fw), FL = num(fl), N = num(need);

  let body;
  if (mode === "from") {
    const aA = Math.floor(FW / PW) * Math.floor(FL / PL);
    const aB = Math.floor(FW / PL) * Math.floor(FL / PW);
    const best = Math.max(aA, aB);
    body = (
      <Result>
        <Row k="Straight layout" v={`${aA} pieces`} />
        <Row k="Rotated layout" v={`${aB} pieces`} />
        <Row k="Best yield" v={`${best} pieces`} big />
      </Result>
    );
  } else {
    const perRow = Math.max(1, Math.floor(FW / PW));
    const rows = Math.ceil(N / perRow);
    const inches = rows * PL;
    body = (
      <Result>
        <Row k="Pieces per WOF row" v={perRow} />
        <Row k="Rows needed" v={rows} />
        <Row k="Fabric needed" v={fracYd(yards(inches))} big />
      </Result>
    );
  }

  return (
    <CalcCard
      title="Fabric / Piece Count"
      sub="How many pieces fit in a cut — or how much fabric N pieces will take."
    >
      <SelectField
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "from", label: "How many pieces fit in a cut of fabric" },
          { value: "need", label: "Yardage needed for N pieces" },
        ]}
      />
      <div style={grid2}>
        <Field label="Piece width" value={pw} onChange={setPw} suffix="in" />
        <Field label="Piece length" value={pl} onChange={setPl} suffix="in" />
        {mode === "from" ? (
          <>
            <Field label="Fabric width" value={fw} onChange={setFw} suffix="in" />
            <Field label="Fabric length" value={fl} onChange={setFl} suffix="in" />
          </>
        ) : (
          <>
            <Field label="Usable bolt width" value={fw} onChange={setFw} suffix="in" />
            <Field label="Pieces needed" value={need} onChange={setNeed} suffix="pcs" step="1" />
          </>
        )}
      </div>
      {body}
    </CalcCard>
  );
}

function BiasBinding() {
  const [len, setLen] = useState("280");
  const [sw, setSw] = useState("2.5");
  const L = num(len), SW = num(sw) || 2.5;
  const side = Math.ceil(Math.sqrt(L * SW * 1.05)); // ~5% for waste/joins
  const yieldIn = Math.floor((side * side) / SW);
  return (
    <CalcCard
      title="Bias Binding (from a square)"
      sub="Continuous bias binding for curved, scalloped, or stretchy edges. Pairs with the Binding calc for the length."
    >
      <div style={grid2}>
        <Field label="Binding length needed" value={len} onChange={setLen} suffix="in" step="1" />
        <Field label="Strip width" value={sw} onChange={setSw} suffix="in" step="0.125" />
      </div>
      <Result>
        <Row k="Cut one square" v={`${side}" × ${side}"`} big />
        <Row k="Yields about" v={`${yieldIn}" of bias`} />
        <Row k="Fabric" v={fracYd(yards(side))} />
      </Result>
      <Note>Square side = √(length × strip width), plus a little for joins. Cut with the continuous-bias tube method.</Note>
    </CalcCard>
  );
}

/* =========================================================================
   TIER 2
   ========================================================================= */

function Sashing() {
  const [rows, setRows] = useState("4");
  const [cols, setCols] = useState("4");
  const [s, setS] = useState("12");
  const [sw, setSw] = useState("2");
  const [posts, setPosts] = useState("no");
  const [bolt, setBolt] = useState("42");
  const R = Math.max(1, Math.round(num(rows)));
  const C = Math.max(1, Math.round(num(cols)));
  const S = num(s), SW = num(sw), B = num(bolt) || 42;
  const cutW = SW + 0.5; // cut sashing strip width (1/2" seam)
  const rowWidth = C * S + (C - 1) * SW; // finished assembled row width
  const withPosts = posts === "yes";

  // vertical sashing (between columns within each block row) — same either way
  const vertCount = R * (C - 1);
  const vertLen = vertCount * (S + 0.5);

  let horizCount, horizLen, horizDesc, cornerCount, cnInches;
  if (withPosts) {
    // each of (R-1) sashing rows = C horizontal pieces + (C-1) cornerstones
    horizCount = (R - 1) * C;
    horizLen = horizCount * (S + 0.5);
    horizDesc = `${horizCount} @ ${toFrac(S + 0.5)}`;
    cornerCount = (R - 1) * (C - 1);
    const perRow = Math.max(1, Math.floor(B / cutW));
    const cnRows = cornerCount > 0 ? Math.ceil(cornerCount / perRow) : 0;
    cnInches = cnRows * cutW;
  } else {
    horizCount = R - 1; // long full-width strips
    horizLen = horizCount * (rowWidth + 0.5);
    horizDesc = `${horizCount} @ ${toFrac(rowWidth + 0.5)}`;
    cornerCount = 0;
    cnInches = 0;
  }

  const sashLen = vertLen + horizLen;
  const strips = sashLen > 0 ? Math.ceil(sashLen / B) : 0;
  const sashFabricIn = strips * cutW;

  return (
    <CalcCard
      title="Sashing"
      sub="Strips between blocks in a grid, with optional cornerstones (posts)."
    >
      <div style={grid2}>
        <Field label="Block rows" value={rows} onChange={setRows} step="1" />
        <Field label="Block columns" value={cols} onChange={setCols} step="1" />
        <Field label="Finished block size" value={s} onChange={setS} suffix="in" />
        <Field label="Sashing width (finished)" value={sw} onChange={setSw} suffix="in" />
      </div>
      <div style={grid2}>
        <SelectField
          label="Cornerstones"
          value={posts}
          onChange={setPosts}
          options={[
            { value: "no", label: "No posts" },
            { value: "yes", label: "With posts" },
          ]}
        />
        <Field label="Usable bolt width" value={bolt} onChange={setBolt} suffix="in" />
      </div>
      <Result>
        <Row k="Cut strip width" v={toFrac(cutW)} />
        <Row k="Vertical sashing pieces" v={`${vertCount} @ ${toFrac(S + 0.5)}`} />
        <Row k="Horizontal sashing pieces" v={horizDesc} />
        {withPosts ? <Row k="Cornerstones" v={`${cornerCount} @ ${toFrac(cutW)} sq`} /> : null}
        <Row k="Sashing fabric" v={fracYd(yards(sashFabricIn))} big />
        {withPosts && cornerCount > 0 ? (
          <Row k="Cornerstone fabric" v={fracYd(yards(cnInches))} big />
        ) : null}
      </Result>
      <Note>
        Approximate — assumes 1/2&quot; seams. With posts, cornerstones are sized to the sashing width and usually cut from a
        contrast fabric (shown separately).
      </Note>
    </CalcCard>
  );
}

function Triangles() {
  const [f, setF] = useState("3");
  const [type, setType] = useState("hst");
  const F = num(f);
  let cut, made, label;
  if (type === "hst") {
    cut = F + 0.875;
    made = "2 triangles per pair of squares";
    label = "Half-square triangle (HST)";
  } else {
    cut = F + 1.25;
    made = "4 triangles per square (cut twice on diagonal)";
    label = "Quarter-square triangle (QST)";
  }
  return (
    <CalcCard title="HST / QST Triangles" sub="Cut size from the finished (sewn) triangle size.">
      <SelectField
        label="Triangle type"
        value={type}
        onChange={setType}
        options={[
          { value: "hst", label: "Half-square (HST)" },
          { value: "qst", label: "Quarter-square (QST)" },
        ]}
      />
      <Field label="Finished size" value={f} onChange={setF} suffix="in" step="0.5" />
      <Result>
        <Row k={label} v="" />
        <Row k="Cut square" v={toFrac(ceil8(cut))} big />
        <Row k="Yields" v={made} />
      </Result>
      <Note>HST = finished + 7/8&quot;. QST = finished + 1 1/4&quot;. Cut a hair generous and trim to size for crisp points.</Note>
    </CalcCard>
  );
}

function FlyingGeese() {
  const [fw, setFw] = useState("4");
  const [fh, setFh] = useState("2");
  const W = num(fw), H = num(fh);
  const bigSq = ceil8(W + 1.25);
  const smSq = ceil8(H + 0.875);
  return (
    <CalcCard
      title="Flying Geese"
      sub="No-waste, four-at-a-time method — one large square + four small squares yields 4 units."
    >
      <div style={grid2}>
        <Field label="Finished width" value={fw} onChange={setFw} suffix="in" step="0.5" />
        <Field label="Finished height" value={fh} onChange={setFh} suffix="in" step="0.5" />
      </div>
      <Result>
        <Row k="Large (goose) square — cut" v={`1 @ ${toFrac(bigSq)}`} big />
        <Row k="Small (sky) squares — cut" v={`4 @ ${toFrac(smSq)}`} big />
        <Row k="Yields" v="4 flying geese units" />
      </Result>
      <Note>Large = width + 1 1/4&quot;. Small = height + 7/8&quot;. Classic 2:1 geese have height = 1/2 the width (e.g. 4×2).</Note>
    </CalcCard>
  );
}

function SquareInSquare() {
  const [c, setC] = useState("3");
  const C = num(c);
  const centerCut = C + 0.5;
  const cornerCut = ceil8(C / 1.41421 + 0.875);
  const onPoint = C * 1.41421;
  return (
    <CalcCard
      title="Square-in-a-Square"
      sub="Economy / corner-triangle method — block stays the same finished size as the on-point unit."
    >
      <Field label="Finished center square" value={c} onChange={setC} suffix="in" step="0.5" />
      <Result>
        <Row k="Center square — cut" v={toFrac(centerCut)} big />
        <Row k="Corner squares — cut" v={`2 @ ${toFrac(cornerCut)}`} big />
        <Row k="Corner cut" v="each square once on the diagonal → 4 triangles" />
        <Row k="On-point unit (finished)" v={toFrac(onPoint)} />
      </Result>
      <Note>Corner squares = (center ÷ 1.414) + 7/8&quot;, rounded up. Slightly oversized so you can square up cleanly.</Note>
    </CalcCard>
  );
}

function UnitConverter() {
  const [val, setVal] = useState("1.5");
  const [from, setFrom] = useState("yd");
  const V = num(val);
  // normalize to inches
  let inches;
  if (from === "yd") inches = V * 36;
  else if (from === "in") inches = V;
  else if (from === "cm") inches = V / 2.54;
  else inches = V * 100 / 2.54; // m
  const yd = inches / 36;
  const cm = inches * 2.54;
  const m = cm / 100;
  // decimal -> fraction (nearest 1/8)
  const frac = toFrac(inches);
  return (
    <CalcCard title="Unit Converter" sub="Yards · inches · metric, plus decimal → nearest 1/8&quot;.">
      <div style={grid2}>
        <Field label="Value" value={val} onChange={setVal} step="0.125" />
        <SelectField
          label="From"
          value={from}
          onChange={setFrom}
          options={[
            { value: "yd", label: "Yards" },
            { value: "in", label: "Inches" },
            { value: "cm", label: "Centimeters" },
            { value: "m", label: "Meters" },
          ]}
        />
      </div>
      <Result>
        <Row k="Yards" v={yd.toFixed(3).replace(/\.?0+$/, "")} />
        <Row k="Inches" v={inches.toFixed(2).replace(/\.?0+$/, "")} />
        <Row k="Inches (nearest 1/8)" v={frac} big />
        <Row k="Centimeters" v={cm.toFixed(1)} />
        <Row k="Meters" v={m.toFixed(3).replace(/\.?0+$/, "")} />
      </Result>
    </CalcCard>
  );
}

/* =========================================================================
   TIER 3
   ========================================================================= */

function SettingTriangles() {
  const [s, setS] = useState("8");
  const S = num(s);
  const sideCut = ceil8(S * 1.41421 + 1.25);
  const cornerCut = ceil8(S / 1.41421 + 0.875);
  return (
    <CalcCard
      title="Setting Triangles (On-Point)"
      sub="Side and corner triangle cut sizes for diagonal-set layouts — keeps straight grain on the outer edges."
    >
      <Field label="Finished block size" value={s} onChange={setS} suffix="in" />
      <Result>
        <Row k="Side triangles — cut square" v={toFrac(sideCut)} big />
        <Row k="Side cut" v="twice on the diagonal → 4 per square" />
        <div style={{ height: 6 }} />
        <Row k="Corner triangles — cut square" v={`2 @ ${toFrac(cornerCut)}`} big />
        <Row k="Corner cut" v="once on the diagonal → 2 per square" />
      </Result>
      <Note>Side = block × 1.414 + 1 1/4&quot;. Corner = block ÷ 1.414 + 7/8&quot;. Cut oversized and trim if you like floating points.</Note>
    </CalcCard>
  );
}

function OnPointPlanner() {
  const [r, setR] = useState("4");
  const [c, setC] = useState("3");
  const [s, setS] = useState("10");
  const R = Math.max(1, Math.round(num(r)));
  const C = Math.max(1, Math.round(num(c)));
  const S = num(s);
  const diag = S * 1.41421;
  const finW = C * diag;
  const finL = R * diag;
  const whole = R * C;
  const sideCount = 2 * (R - 1) + 2 * (C - 1);
  const sideSquares = Math.ceil(sideCount / 4);
  const sideCut = ceil8(S * 1.41421 + 1.25);
  const cornerCut = ceil8(S / 1.41421 + 0.875);
  return (
    <CalcCard
      title="On-Point Quilt Planner"
      sub="Finished size and triangle counts for a diagonal block set."
    >
      <div style={grid2}>
        <Field label="Diagonal rows" value={r} onChange={setR} step="1" />
        <Field label="Diagonal columns" value={c} onChange={setC} step="1" />
      </div>
      <Field label="Finished block size" value={s} onChange={setS} suffix="in" />
      <Result>
        <Row k="Finished size (before borders)" v={`${toFrac(finW)} × ${toFrac(finL)}`} big />
        <Row k="Block diagonal" v={toFrac(diag)} />
        <div style={{ height: 6 }} />
        <Row k="Whole blocks" v={`${whole}`} />
        <Row k="Side triangles" v={`${sideCount} (cut ${sideSquares} sq @ ${toFrac(sideCut)})`} />
        <Row k="Corner triangles" v={`4 (cut 2 sq @ ${toFrac(cornerCut)})`} />
      </Result>
      <Note>Side-triangle count assumes a standard rectangular diagonal set; odd-shaped layouts vary.</Note>
    </CalcCard>
  );
}

const BEDS = [
  { value: "custom", label: "Custom", w: 50, l: 60 },
  { value: "crib", label: "Crib (36×52)", w: 36, l: 52 },
  { value: "throw", label: "Throw (50×65)", w: 50, l: 65 },
  { value: "twin", label: "Twin (70×90)", w: 70, l: 90 },
  { value: "full", label: "Full (85×108)", w: 85, l: 108 },
  { value: "queen", label: "Queen (90×108)", w: 90, l: 108 },
  { value: "king", label: "King (108×108)", w: 108, l: 108 },
];

function SizeEstimator() {
  const [bed, setBed] = useState("twin");
  const [w, setW] = useState("70");
  const [l, setL] = useState("90");
  const [s, setS] = useState("12");
  const [sash, setSash] = useState("0");
  const [set, setSet] = useState("straight");
  const onBed = (v) => {
    setBed(v);
    const b = BEDS.find((x) => x.value === v);
    if (b && v !== "custom") {
      setW(String(b.w));
      setL(String(b.l));
    }
  };
  const W = num(w), L = num(l), S = num(s), SA = num(sash);
  const onPoint = set === "onpoint";
  const span = onPoint ? S * 1.41421 : S; // axis size of one block
  const unit = span + SA;
  const across = unit > 0 ? Math.max(1, Math.round(W / unit)) : 0;
  const down = unit > 0 ? Math.max(1, Math.round(L / unit)) : 0;
  const total = across * down;
  const finW = across * span + Math.max(0, across - 1) * SA;
  const finL = down * span + Math.max(0, down - 1) * SA;
  return (
    <CalcCard
      title="Quilt Size Estimator"
      sub="How many blocks to hit a target size — straight or on-point set."
    >
      <SelectField label="Target size" value={bed} onChange={onBed} options={BEDS} />
      <div style={grid2}>
        <Field label="Target width" value={w} onChange={(v) => { setBed("custom"); setW(v); }} suffix="in" />
        <Field label="Target length" value={l} onChange={(v) => { setBed("custom"); setL(v); }} suffix="in" />
        <Field label="Finished block size" value={s} onChange={setS} suffix="in" />
        <Field label="Sashing width" value={sash} onChange={setSash} suffix="in" />
      </div>
      <SelectField
        label="Set"
        value={set}
        onChange={setSet}
        options={[
          { value: "straight", label: "Straight (grid) set" },
          { value: "onpoint", label: "On-point (diagonal) set" },
        ]}
      />
      <Result>
        <Row k="Layout" v={`${across} across × ${down} down`} big />
        <Row k="Total blocks" v={`${total}`} big />
        <Row k="Actual finished size" v={`${toFrac(finW)} × ${toFrac(finL)}`} />
        {onPoint ? <Row k="Block diagonal" v={toFrac(span)} /> : null}
      </Result>
      <Note>
        {onPoint
          ? "On-point counts whole blocks only — add setting + corner triangles (and their fabric) from the On-Point Planner."
          : "Bed sizes are typical finished-quilt dimensions with a modest drop — adjust to your mattress and overhang."}
      </Note>
    </CalcCard>
  );
}

/* =========================================================================
   Tab shell
   ========================================================================= */

const TIERS = [
  {
    key: "essentials",
    label: "Essentials",
    blurb: "The basics you reach for on every quilt.",
    calcs: [BackingBatting, Binding, BiasBinding, Borders, PieceCount],
  },
  {
    key: "blocks",
    label: "Blocks & Units",
    blurb: "Piecing math for blocks, triangles, and sashing.",
    calcs: [Sashing, Triangles, FlyingGeese, SquareInSquare, UnitConverter],
  },
  {
    key: "layout",
    label: "Layout & Planning",
    blurb: "On-point sets and whole-quilt planning.",
    calcs: [SettingTriangles, OnPointPlanner, SizeEstimator],
  },
];

export default function ToolsTab() {
  const [active, setActive] = useState("essentials");
  const tier = TIERS.find((t) => t.key === active) || TIERS[0];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--teal)",
          }}
        >
          Quilting Tools
        </div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: 18, color: "var(--sun-amber)" }}>
          let the calculators do the math
        </div>
      </div>

      <div className="sub-tab-row">
        {TIERS.map((t) => (
          <button
            key={t.key}
            className={`sub-tab ${active === t.key ? "active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 13, margin: "8px 2px 12px" }}>{tier.blurb}</p>


      {tier.calcs.map((C, i) => (
        <C key={tier.key + i} />
      ))}
    </div>
  );
}
