import { useState, useEffect, useRef } from "react";

/**
 * 🧵 SPOOL QUEST — a little sewing-room adventure for the Home tab.
 * Rescue your quilt before the Autumn Quilt Bee deadline.
 * Rendered as a full-screen modal. Pure React state, no backend.
 *
 * Props:
 *   onClose() — called when the player closes the game
 */

const START_QUILTER = {
  name: "Stitchy",
  health: 100,
  energy: 100,
  skill: 1,
  reputation: 0,
  quilt_progress: 0,
  stress: 0,
};

const START_INVENTORY = {
  thread_spools: 2,
  needles: 3,
  snippers: 1,
  tweezers: 0,
  seam_ripper: 0,
  pins: 10,
  thimble: 0,
  fabric_scraps: 5,
};

const ITEM_META = {
  thread_spools: { icon: "🧵", label: "Thread spools" },
  needles:       { icon: "🪡", label: "Needles" },
  snippers:      { icon: "✂️", label: "Snippers" },
  tweezers:      { icon: "🔧", label: "Tweezers" },
  seam_ripper:   { icon: "🔪", label: "Seam ripper" },
  pins:          { icon: "📌", label: "Pins" },
  thimble:       { icon: "🫙", label: "Thimble" },
  fabric_scraps: { icon: "🎀", label: "Fabric scraps" },
};

const RANDOM_EVENTS = [
  { text: "😱 You pricked your finger on a hidden needle!", effect: { health: -10, stress: 5 } },
  { text: "🐱 The cat knocked your pin cushion off the table — pins everywhere!", effect: { pins: -3, stress: 5 } },
  { text: "✨ You found a forgotten spool in your notions drawer!", effect: { thread_spools: 1, energy: 5 } },
  { text: "🌟 A quilting friend drops off extra fabric scraps!", effect: { fabric_scraps: 3, reputation: 5 } },
  { text: "😩 You had to rip out an entire row. So. Many. Seams.", effect: { quilt_progress: -5, stress: 10, energy: -10 } },
  { text: "☕ You took a coffee break and feel refreshed!", effect: { energy: 15, stress: -10 } },
  { text: "🧵 Your thread tangled into a catastrophic bird's nest!", effect: { thread_spools: -1, stress: 15, energy: -5 } },
  { text: "📦 A package arrived — you impulse-bought a thimble online!", effect: { thimble: 1 } },
];

const STAT_KEYS = new Set(["health", "energy", "skill", "reputation", "quilt_progress", "stress"]);

function clampStat(key, v) {
  if (key === "skill") return Math.max(1, Math.min(5, v));
  return Math.max(0, Math.min(100, v));
}

export default function SpoolQuest({ onClose }) {
  const [quilter, setQuilter] = useState(START_QUILTER);
  const [inv, setInv] = useState(START_INVENTORY);
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState([
    { kind: "story", text: "🧵 The Autumn Quilt Bee is in THREE DAYS and your quilt isn't finished." },
    { kind: "story", text: "Half your thread has vanished (the cat, probably). Can you finish in time?" },
  ]);
  const [phase, setPhase] = useState("intro"); // intro | playing | won | lost
  const [loseReason, setLoseReason] = useState("");
  const logRef = useRef(null);

  // High score (best reputation) persisted in-memory for the session only.
  const [best, setBest] = useState(0);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  function pushLog(entry) { setLog(l => [...l.slice(-40), entry]); }

  function applyEffects(q, inventory, effects) {
    const nq = { ...q }, ni = { ...inventory };
    for (const [k, v] of Object.entries(effects)) {
      if (STAT_KEYS.has(k)) nq[k] = clampStat(k, nq[k] + v);
      else if (k in ni) ni[k] = Math.max(0, ni[k] + v);
    }
    return { nq, ni };
  }

  function endIfOver(q) {
    if (q.quilt_progress >= 100) { setPhase("won"); setBest(b => Math.max(b, q.reputation)); return true; }
    if (q.health <= 0)  { setLoseReason("💀 Your health hit zero. Even quilters need self-care!"); setPhase("lost"); return true; }
    if (q.energy <= 0)  { setLoseReason("😵 Complete exhaustion. Time to step away from the machine."); setPhase("lost"); return true; }
    if (q.stress >= 100){ setLoseReason("🤯 Maximum stress! You fled to a spa and abandoned the quilt."); setPhase("lost"); return true; }
    return false;
  }

  // Core turn handler: applies an action, then random event + deadline stress.
  function takeAction(actionFn) {
    let q = { ...quilter }, inventory = { ...inv };
    const result = actionFn(q, inventory);
    q = result.q; inventory = result.inv;

    // Random event (40% chance)
    if (Math.random() < 0.4) {
      const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      const out = applyEffects(q, inventory, ev.effect);
      q = out.nq; inventory = out.ni;
      pushLog({ kind: "event", text: `⚡ ${ev.text}` });
    }

    // Deadline pressure
    q.stress = clampStat("stress", q.stress + 1 + Math.floor(Math.random() * 4));

    setQuilter(q); setInv(inventory); setTurn(t => t + 1);
    endIfOver(q);
  }

  // ── Actions ──
  const actSew = () => takeAction((q, inventory) => {
    if (inventory.thread_spools < 1) { pushLog({ kind: "bad", text: "❌ Out of thread! Can't sew without it." }); q.stress = clampStat("stress", q.stress + 5); return { q, inv: inventory }; }
    if (q.energy < 15) { pushLog({ kind: "bad", text: "😴 Too tired to sew straight. Rest first!" }); q.stress = clampStat("stress", q.stress + 5); return { q, inv: inventory }; }
    const gain = (8 + Math.floor(Math.random() * 8)) + (q.skill - 1) * 3;
    inventory.thread_spools -= 1; q.energy = clampStat("energy", q.energy - 15);
    q.quilt_progress = clampStat("quilt_progress", q.quilt_progress + gain);
    q.reputation = clampStat("reputation", q.reputation + 2);
    pushLog({ kind: "good", text: `✅ Sewed a block! Quilt +${gain}%` });
    if (inventory.thimble) { q.energy = clampStat("energy", q.energy + 5); pushLog({ kind: "good", text: "🫙 Thimble saved your fingertip. +5 energy." }); }
    return { q, inv: inventory };
  });

  const actRip = () => takeAction((q, inventory) => {
    if (inventory.seam_ripper < 1) { pushLog({ kind: "bad", text: "❌ No seam ripper! Rummage for one." }); return { q, inv: inventory }; }
    const cost = 10 + Math.floor(Math.random() * 11);
    q.energy = clampStat("energy", q.energy - cost);
    q.stress = clampStat("stress", q.stress + 10);
    q.quilt_progress = clampStat("quilt_progress", q.quilt_progress - (3 + Math.floor(Math.random() * 5)));
    pushLog({ kind: "neutral", text: `😤 Bad seam removed. Energy -${cost}, but it'll be perfect.` });
    return { q, inv: inventory };
  });

  const actRest = () => takeAction((q, inventory) => {
    const rec = 20 + Math.floor(Math.random() * 16);
    q.energy = clampStat("energy", q.energy + rec);
    q.stress = clampStat("stress", q.stress - 15);
    pushLog({ kind: "good", text: `☕ Refreshed! Energy +${rec}, stress -15.` });
    return { q, inv: inventory };
  });

  const actRummage = () => takeAction((q, inventory) => {
    const finds = { needles: 2, pins: 5, tweezers: 1, seam_ripper: 1, thimble: 1, thread_spools: 1, fabric_scraps: 3 };
    let found = false;
    for (const [item, max] of Object.entries(finds)) {
      const qty = Math.floor(Math.random() * (max + 1));
      if (qty > 0 && Math.random() < 0.45) { inventory[item] += qty; pushLog({ kind: "good", text: `✨ Found ${qty} ${ITEM_META[item].label.toLowerCase()}!` }); found = true; }
    }
    if (!found) pushLog({ kind: "neutral", text: "😔 Nothing useful this time." });
    q.energy = clampStat("energy", q.energy - 5);
    return { q, inv: inventory };
  });

  const actPractice = () => takeAction((q, inventory) => {
    if (inventory.fabric_scraps < 2) { pushLog({ kind: "bad", text: "❌ Not enough scraps to practice." }); return { q, inv: inventory }; }
    if (q.skill >= 5) { pushLog({ kind: "neutral", text: "🌟 Already a Master Quilter!" }); return { q, inv: inventory }; }
    inventory.fabric_scraps -= 2; q.energy = clampStat("energy", q.energy - 10);
    const threshold = q.skill * 25, roll = 1 + Math.floor(Math.random() * 100);
    if (roll >= threshold) { q.skill = clampStat("skill", q.skill + 1); q.reputation = clampStat("reputation", q.reputation + 10); pushLog({ kind: "good", text: `🎉 SKILL UP! Now Level ${q.skill}!` }); }
    else { q.reputation = clampStat("reputation", q.reputation + 2); pushLog({ kind: "neutral", text: "👍 Good practice. Keep at it!" }); }
    return { q, inv: inventory };
  });

  const actNeedle = () => takeAction((q, inventory) => {
    if (inventory.needles < 1) { pushLog({ kind: "bad", text: "❌ No spare needles!" }); q.stress = clampStat("stress", q.stress + 5); return { q, inv: inventory }; }
    inventory.needles -= 1; q.energy = clampStat("energy", q.energy + 5);
    pushLog({ kind: "good", text: "✅ Fresh needle in. Stitches = chef's kiss. 💋" });
    return { q, inv: inventory };
  });

  function restart() {
    setQuilter(START_QUILTER); setInv(START_INVENTORY); setTurn(1);
    setLoseReason(""); setPhase("playing");
    setLog([{ kind: "story", text: "🧵 A fresh start. The deadline looms. Let's quilt!" }]);
  }

  // ── Styling helpers ──
  const C = {
    teal: "var(--teal)", gold: "var(--sun-gold)", amber: "var(--sun-amber)",
    sky: "var(--sky-cobalt)", leaf: "var(--leaf-bright)", red: "#C0392B",
    ink: "var(--ink)", muted: "var(--muted)", warm: "var(--warm-white)",
    border: "var(--border-teal)", linen: "var(--linen)",
  };
  const logColor = { good: C.leaf, bad: C.red, event: C.amber, neutral: C.muted, story: C.ink };

  const Bar = ({ label, value, color, max = 100, danger }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: danger ? C.red : C.ink, marginBottom: 3 }}>
        <span>{label}</span><span>{value}{max === 100 ? "%" : ""}</span>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, transition: "width .35s ease" }} />
      </div>
    </div>
  );

  const ActBtn = ({ emoji, label, sub, onClick, color }) => (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
      padding: "10px 12px", borderRadius: 12, cursor: "pointer", textAlign: "left",
      border: `1.5px solid ${C.border}`, background: C.warm, width: "100%",
      fontFamily: "Nunito,sans-serif",
    }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || C.teal }}>{label}</span>
      <span style={{ fontSize: 10, color: C.muted }}>{sub}</span>
    </button>
  );

  const overlay = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(13,82,82,0.55)", backdropFilter: "blur(3px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 12,
  };
  const panel = {
    width: "100%", maxWidth: 440, maxHeight: "92vh", overflowY: "auto",
    background: `linear-gradient(160deg, ${C.warm}, ${C.linen})`,
    borderRadius: 18, border: `2px solid ${C.border}`, boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
    padding: 18, fontFamily: "Nunito,sans-serif",
  };
  const titleStyle = { fontFamily: "'Caveat',cursive", color: C.teal, fontWeight: 700 };

  // ── Screens ──
  if (phase === "intro") {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={panel} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>🧵</div>
            <h2 style={{ ...titleStyle, fontSize: 38, margin: "4px 0" }}>Spool Quest</h2>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: 20, fontWeight: 600, color: C.amber, marginBottom: 12 }}>
              Rescue your quilt before the Bee!
            </div>
          </div>
          {log.map((l, i) => (
            <p key={i} style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, margin: "0 0 8px" }}>{l.text}</p>
          ))}
          <div style={{ background: C.teal, color: "#fff", borderRadius: 10, padding: "10px 12px", fontSize: 12, margin: "12px 0" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>🎯 Goal: Quilt Progress to 100%</div>
            <div style={{ opacity: 0.9 }}>☠️ Avoid: Health, Energy at 0 · Stress at 100</div>
          </div>
          <button onClick={() => setPhase("playing")} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: C.gold, color: C.ink, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            Start Quilting →
          </button>
          <button onClick={onClose} style={{ width: "100%", padding: "8px", marginTop: 8, borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>
            Maybe later
          </button>
        </div>
      </div>
    );
  }

  if (phase === "won" || phase === "lost") {
    const won = phase === "won";
    return (
      <div style={overlay} onClick={onClose}>
        <div style={panel} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44 }}>{won ? "🎉" : "💔"}</div>
            <h2 style={{ ...titleStyle, fontSize: 34, margin: "6px 0" }}>{won ? "Quilt Complete!" : "Game Over"}</h2>
            <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>
              {won
                ? "The Bee judges gasp in admiration. Stitchy accepts the blue ribbon with happy tears. 🏆"
                : loseReason}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, margin: "14px 0", fontSize: 13 }}>
              <div><b style={{ color: C.teal }}>{quilter.reputation}</b><br /><span style={{ color: C.muted, fontSize: 11 }}>Reputation</span></div>
              <div><b style={{ color: C.teal }}>Lv.{quilter.skill}</b><br /><span style={{ color: C.muted, fontSize: 11 }}>Skill</span></div>
              <div><b style={{ color: C.teal }}>{turn}</b><br /><span style={{ color: C.muted, fontSize: 11 }}>Turns</span></div>
            </div>
            {best > 0 && <div style={{ fontSize: 12, color: C.amber, marginBottom: 10 }}>⭐ Best reputation this session: {best}</div>}
          </div>
          <button onClick={restart} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: C.gold, color: C.ink, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            Play Again
          </button>
          <button onClick={onClose} style={{ width: "100%", padding: "8px", marginTop: 8, borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Playing ──
  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ ...titleStyle, fontSize: 24, margin: 0 }}>🧵 Spool Quest</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: C.muted }}>Turn {turn} · Skill Lv.{quilter.skill}</span>
            <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer", color: C.muted, lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: C.warm, borderRadius: 12, padding: "12px 14px", marginBottom: 12, border: `1px solid ${C.border}` }}>
          <Bar label="🛏️ Quilt Progress" value={quilter.quilt_progress} color={C.leaf} />
          <Bar label="❤️ Health" value={quilter.health} color="#E8607A" danger={quilter.health <= 20} />
          <Bar label="⚡ Energy" value={quilter.energy} color={C.gold} danger={quilter.energy <= 20} />
          <Bar label="😰 Stress" value={quilter.stress} color={C.red} danger={quilter.stress >= 80} />
        </div>

        {/* Event log */}
        <div ref={logRef} style={{ background: "rgba(0,0,0,0.03)", borderRadius: 10, padding: "8px 10px", height: 92, overflowY: "auto", marginBottom: 12, border: `1px solid ${C.border}` }}>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 12, color: logColor[l.kind] || C.ink, marginBottom: 3, lineHeight: 1.35 }}>{l.text}</div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <ActBtn emoji="🧵" label="Sew" sub="−1 spool, +progress" onClick={actSew} />
          <ActBtn emoji="🔪" label="Rip Seam" sub="needs ripper" onClick={actRip} />
          <ActBtn emoji="😴" label="Rest" sub="+energy −stress" onClick={actRest} color={C.sky} />
          <ActBtn emoji="🔍" label="Rummage" sub="find supplies" onClick={actRummage} color={C.sky} />
          <ActBtn emoji="📚" label="Practice" sub="−2 scraps, skill" onClick={actPractice} color={C.amber} />
          <ActBtn emoji="🪡" label="New Needle" sub="−1 needle" onClick={actNeedle} color={C.amber} />
        </div>

        {/* Notions bag */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(inv).map(([k, v]) => (
            <div key={k} title={ITEM_META[k].label} style={{
              fontSize: 12, padding: "3px 8px", borderRadius: 20, background: v === 0 ? "rgba(192,57,43,0.08)" : C.teal + "18",
              color: v === 0 ? C.red : C.teal, border: `1px solid ${v === 0 ? "rgba(192,57,43,0.2)" : C.border}`, fontWeight: 600,
            }}>
              {ITEM_META[k].icon} {v}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
