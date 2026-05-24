import { useState } from "react";
import PhotoUploader from "./PhotoUploader.jsx";

/**
 * Universal photo + notes editor for any user_* table item.
 *
 * Use this on RulerBrowser, FeetBrowser, AccuQuiltBrowser, etc.
 * Open it when the user clicks "Edit" on an owned item.
 *
 * Props:
 *   supabase      - Supabase client
 *   userId        - current user UUID
 *   table         - e.g. "user_rulers", "user_feet", "user_dies", "user_fabric", "user_patterns", "user_accuquilt"
 *   bucket        - e.g. "ruler-photos", "feet-photos", "die-photos", etc.
 *   fkColumn      - name of FK column linking to library (e.g. "ruler_id", "foot_id", "accuquilt_id")
 *   fkValue       - the library row id this user item references
 *   itemName      - display name shown in header (e.g. "Creative Grids 6.5\" Square")
 *   initial       - { photos: [], notes: "", quantity: 1 } from the current row
 *   onClose       - close handler
 *   onSaved       - callback after save (to refresh parent)
 */
export default function ItemPhotoEditor({
  supabase, userId, table, bucket, fkColumn, fkValue,
  itemName, initial = {}, onClose, onSaved,
}) {
  const [photos, setPhotos]     = useState(initial.photos || []);
  const [notes, setNotes]       = useState(initial.notes || "");
  const [quantity, setQuantity] = useState(initial.quantity || 1);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");

  async function save() {
    setSaving(true);
    setErr("");
    const payload = {
      photos,
      image_url: photos[0] || null,
      notes: notes || null,
      quantity: parseInt(quantity) || 1,
    };
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq("user_id", userId)
      .eq(fkColumn, fkValue);
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved && onSaved();
    onClose && onClose();
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Edit — {itemName}</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <label style={styles.label}>
          Quantity
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ ...styles.input, minHeight: 60 }}
            placeholder="Personal notes — condition, storage, project ideas…"
          />
        </label>

        <div style={styles.label}>
          Photos
          <PhotoUploader
            bucket={bucket}
            userId={userId}
            existing={photos}
            onChange={setPhotos}
            maxPhotos={6}
          />
        </div>

        {err && <div style={styles.err}>{err}</div>}

        <div style={styles.actions}>
          <button style={styles.secondary} onClick={onClose}>Cancel</button>
          <button style={styles.primary} onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 8, maxWidth: 520, width: "100%",
    maxHeight: "90vh", overflowY: "auto", padding: 16,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { margin: 0, color: "#004D4D", fontSize: 18 },
  closeBtn: {
    background: "none", border: "none", fontSize: 24, cursor: "pointer",
    color: "#888", padding: 0, lineHeight: 1,
  },
  label: { display: "flex", flexDirection: "column", marginBottom: 12, fontSize: 13, color: "#333", fontWeight: 600 },
  input: {
    marginTop: 4, padding: 8, border: "1px solid #ccc", borderRadius: 4,
    fontSize: 14, fontFamily: "inherit", fontWeight: 400,
  },
  err: { background: "#fee", color: "#c33", padding: 8, borderRadius: 4, fontSize: 13, marginBottom: 12 },
  actions: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 },
  primary: {
    background: "#004D4D", color: "#fff", border: "none",
    padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontWeight: 600,
  },
  secondary: {
    background: "#fff", color: "#004D4D", border: "1px solid #004D4D",
    padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontWeight: 600,
  },
};
