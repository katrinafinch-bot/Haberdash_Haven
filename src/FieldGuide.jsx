import React, { useEffect, useState } from "react";
import { t } from "./i18n.js";

/**
 * FieldGuide — full-screen modal for the bilingual
 * "Quilter's Field Guide" (Know Your Tools & Materials).
 *
 * PAYWALL: the guide content is NOT a public asset. It lives in the
 * Supabase table `premium_guides` behind a plan-gated RLS policy
 * (Basic + Premium + comped/admin only). A free user's query returns
 * zero rows, so the content never reaches their browser. We render the
 * fetched HTML in an iframe via srcDoc so its self-contained styles,
 * language toggle, and quizzes stay isolated from the app.
 *
 * The mount is also gated in App.jsx by canAccess("basic"); RLS is the
 * real enforcement, the mount check is UX.
 */
/**
 * srcDoc anchor fix: inside an `about:srcdoc` iframe, bare `#id` TOC links
 * resolve against the PARENT app URL and navigate the iframe away instead of
 * scrolling. We inject a capture-phase click handler that scrolls to the target
 * element itself, offset by the guide's sticky topbar height. Runs inside the
 * sandbox (allow-scripts) and covers every language edition automatically.
 */
function withAnchorFix(html) {
  if (typeof html !== "string") return html;
  const fix = `
<script>
(function(){
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if(!a) return;
    var href = a.getAttribute('href');
    if(!href || href === '#') return;
    var el = document.getElementById(decodeURIComponent(href.slice(1)));
    if(!el) return;
    e.preventDefault();
    var bar = document.querySelector('.topbar');
    var off = bar ? bar.getBoundingClientRect().height + 8 : 72;
    var top = el.getBoundingClientRect().top + window.pageYOffset - off;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }, true);
})();
<\/script>`;
  return html.indexOf("</body>") !== -1
    ? html.replace("</body>", fix + "</body>")
    : html + fix;
}

export default function FieldGuide({ supabase, onClose, lang="en-US" }) {
  const [html, setHtml]     = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | denied | error

  useEffect(() => {
    let alive = true;
    if (!supabase) { setStatus("error"); return; }
    supabase
      .from("premium_guides")
      .select("html")
      .eq("slug", "field-guide")
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) { console.error("Field guide fetch error:", error); setStatus("error"); return; }
        if (!data || !data.html) { setStatus("denied"); return; } // RLS filtered it out
        setHtml(withAnchorFix(data.html));
        setStatus("ready");
      });
    return () => { alive = false; };
  }, [supabase]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quilter's Field Guide"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "var(--warm-white, #FFFEF9)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Header bar */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12, padding: "12px 16px",
        background: "var(--teal, #0D5252)", color: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 17,
            lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {t("fg_title",lang)}
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, opacity: 0.92, lineHeight: 1.1 }}>
            {t("fg_subtitle",lang)}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={t("fg_close",lang)}
          style={{
            flexShrink: 0, background: "rgba(255,255,255,0.16)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.35)", borderRadius: 999,
            padding: "8px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          &#10005; {t("fg_close",lang)}
        </button>
      </div>

      {/* Body */}
      {status === "ready" ? (
        <iframe
          title="Quilter's Field Guide"
          srcDoc={html}
          sandbox="allow-scripts allow-popups"
          style={{ flex: 1, width: "100%", border: "none" }}
        />
      ) : (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 10,
          padding: 24, textAlign: "center", fontFamily: "Nunito, sans-serif",
          color: "var(--ink-soft, #2A3D3D)",
        }}>
          {status === "loading" && (
            <>
              <div style={{ fontSize: 30 }}>&#128216;</div>
              <div style={{ fontWeight: 700 }}>{t("fg_loading",lang)}</div>
            </>
          )}
          {status === "denied" && (
            <>
              <div style={{ fontSize: 30 }}>&#128274;</div>
              <div style={{ fontWeight: 800, color: "var(--teal, #0D5252)" }}>
                {t("fg_denied_title",lang)}
              </div>
              <div className="muted" style={{ fontSize: 13, maxWidth: 320 }}>
                {t("fg_denied_body",lang)}
              </div>
              <button
                className="btn active"
                style={{ marginTop: 6 }}
                onClick={() => { window.location.href = window.location.origin; }}
              >
                {t("stash_upgrade_basic",lang)}
              </button>
            </>
          )}
          {status === "error" && (
            <>
              <div style={{ fontSize: 30 }}>&#128533;</div>
              <div style={{ fontWeight: 700 }}>{t("fg_error_title",lang)}</div>
              <div className="muted" style={{ fontSize: 13 }}>{t("fg_error_body",lang)}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
