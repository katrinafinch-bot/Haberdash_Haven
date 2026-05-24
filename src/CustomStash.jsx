import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Custom RGB picker — native <input type="color"> shows only ~8 swatches on mobile
function MiniColorPicker({ value, onChange }) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : '#000000';
  const rgb = {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
  const toHex = x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0');
  const setCh = (ch, v) => {
    const next = { ...rgb, [ch]: Number(v) };
    onChange('#' + toHex(next.r) + toHex(next.g) + toHex(next.b));
  };
  const chans = [['r', 'R', '#e44'], ['g', 'G', '#2a2'], ['b', 'B', '#36f']];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0, background: hex, border: '1px solid #ccc' }} />
        <input
          type="text"
          value={hex.toUpperCase()}
          onChange={e => { let v = e.target.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v); }}
          style={{ fontFamily: 'monospace', fontSize: 13, width: 90, padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc' }}
        />
      </div>
      {chans.map(([ch, label, col]) => (
        <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: col, width: 12 }}>{label}</span>
          <input type="range" min="0" max="255" value={rgb[ch]} onChange={e => setCh(ch, e.target.value)} style={{ flex: 1, accentColor: col }} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888', width: 28, textAlign: 'right' }}>{rgb[ch]}</span>
        </div>
      ))}
    </div>
  );
}

export default function CustomStash({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const blankForm = {
    name: '',
    category: '',
    brand: '',
    description: '',
    quantity: 1,
    unit: 'piece',
    color: '',
    color_hex: '',
    location: '',
    notes: '',
    image_url: '',
    tags: '',
    is_low_stock: false,
  };
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_stash_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setItems(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      user_id: user.id,
      name: form.name,
      category: form.category || null,
      brand: form.brand || null,
      description: form.description || null,
      quantity: parseFloat(form.quantity) || 1,
      unit: form.unit || 'piece',
      color: form.color || null,
      color_hex: form.color_hex || null,
      location: form.location || null,
      notes: form.notes || null,
      image_url: form.image_url || null,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      is_low_stock: form.is_low_stock,
    };

    let result;
    if (editingId) {
      result = await supabase
        .from('custom_stash_items')
        .update(payload)
        .eq('id', editingId)
        .eq('user_id', user.id);
    } else {
      result = await supabase.from('custom_stash_items').insert([payload]);
    }

    if (result.error) {
      alert('Error: ' + result.error.message);
    } else {
      resetForm();
      fetchItems();
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || '',
      category: item.category || '',
      brand: item.brand || '',
      description: item.description || '',
      quantity: item.quantity || 1,
      unit: item.unit || 'piece',
      color: item.color || '',
      color_hex: item.color_hex || '',
      location: item.location || '',
      notes: item.notes || '',
      image_url: item.image_url || '',
      tags: (item.tags || []).join(', '),
      is_low_stock: item.is_low_stock || false,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(blankForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item permanently?')) return;
    const { error } = await supabase
      .from('custom_stash_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) alert('Error: ' + error.message);
    else fetchItems();
  }

  async function adjustQuantity(item, delta) {
    const newQty = Math.max(0, (item.quantity || 0) + delta);
    const { error } = await supabase
      .from('custom_stash_items')
      .update({ quantity: newQty })
      .eq('id', item.id)
      .eq('user_id', user.id);
    if (error) alert(error.message);
    else fetchItems();
  }

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const filtered = items.filter((i) => {
    const matchSearch =
      !search ||
      [i.name, i.brand, i.description, i.notes, ...(i.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchCat = !filterCategory || i.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Misc. Supplies</h2>
        <button style={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '× Cancel' : '+ Add Item'}
        </button>
      </div>

      <p style={styles.subtitle}>
        Anything that doesn't fit in threads, fabric, or rulers. Vintage notions,
        odd bits, work-in-progress supplies — your call.
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>{editingId ? 'Edit Item' : 'New Item'}</h3>

          <div style={styles.row}>
            <label style={styles.label}>
              Name *
              <input
                style={styles.input}
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Vintage mother-of-pearl buttons"
              />
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Category
              <input
                style={styles.input}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Buttons, Trim, Zippers"
                list="category-list"
              />
              <datalist id="category-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label style={styles.label}>
              Brand
              <input
                style={styles.input}
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Quantity
              <input
                style={styles.input}
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>
            <label style={styles.label}>
              Unit
              <select
                style={styles.input}
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="piece">piece</option>
                <option value="yard">yard</option>
                <option value="meter">meter</option>
                <option value="spool">spool</option>
                <option value="skein">skein</option>
                <option value="pack">pack</option>
                <option value="set">set</option>
                <option value="roll">roll</option>
                <option value="card">card</option>
                <option value="box">box</option>
              </select>
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Color
              <input
                style={styles.input}
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </label>
            <label style={styles.label}>
              Color Hex
              <MiniColorPicker
                value={form.color_hex || '#000000'}
                onChange={(hex) => setForm({ ...form, color_hex: hex })}
              />
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Location
              <input
                style={styles.input}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Drawer 3, Blue bin"
              />
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Description
              <textarea
                style={{ ...styles.input, minHeight: 60 }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Tags (comma-separated)
              <input
                style={styles.input}
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. vintage, gift, special-occasion"
              />
            </label>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Notes
              <textarea
                style={{ ...styles.input, minHeight: 60 }}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>

          <div style={styles.row}>
            <label style={{ ...styles.label, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.is_low_stock}
                onChange={(e) => setForm({ ...form, is_low_stock: e.target.checked })}
              />
              Mark as low stock
            </label>
          </div>

          <div style={styles.formActions}>
            <button type="submit" style={styles.primaryBtn}>
              {editingId ? 'Save Changes' : 'Add to Stash'}
            </button>
            <button type="button" style={styles.secondaryBtn} onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={styles.filters}>
        <input
          style={styles.input}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {categories.length > 0 && (
          <select
            style={styles.input}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={styles.empty}>
          {items.length === 0
            ? 'No misc supplies yet. Tap "Add Item" to start.'
            : 'No matches.'}
        </p>
      ) : (
        <div style={styles.grid}>
          {filtered.map((item) => (
            <div key={item.id} style={styles.card}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={styles.thumb} />
              )}
              <div style={styles.cardBody}>
                <div style={styles.cardHeader}>
                  <strong style={styles.itemName}>{item.name}</strong>
                  {item.is_low_stock && <span style={styles.lowBadge}>LOW</span>}
                </div>
                {item.category && (
                  <div style={styles.itemMeta}>{item.category}</div>
                )}
                {item.brand && <div style={styles.itemMeta}>{item.brand}</div>}
                {item.color && (
                  <div style={styles.colorRow}>
                    {item.color_hex && (
                      <span
                        style={{
                          ...styles.colorDot,
                          backgroundColor: item.color_hex,
                        }}
                      />
                    )}
                    {item.color}
                  </div>
                )}
                <div style={styles.qtyRow}>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => adjustQuantity(item, -1)}
                  >
                    −
                  </button>
                  <span style={styles.qty}>
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => adjustQuantity(item, 1)}
                  >
                    +
                  </button>
                </div>
                {item.location && (
                  <div style={styles.itemMeta}>📍 {item.location}</div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div style={styles.tags}>
                    {item.tags.map((t) => (
                      <span key={t} style={styles.tag}>{t}</span>
                    ))}
                  </div>
                )}
                <div style={styles.cardActions}>
                  <button style={styles.linkBtn} onClick={() => startEdit(item)}>
                    Edit
                  </button>
                  <button
                    style={{ ...styles.linkBtn, color: '#c33' }}
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Haberdash Haven palette: black, deep teal (#004D4D), silver (#C0C0C0)
const styles = {
  container: { padding: 16, maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { color: '#004D4D', margin: 0 },
  subtitle: { color: '#666', marginTop: 4, marginBottom: 16, fontSize: 14 },
  primaryBtn: {
    background: '#004D4D', color: '#fff', border: 'none',
    padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
  },
  secondaryBtn: {
    background: '#fff', color: '#004D4D', border: '1px solid #004D4D',
    padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
  },
  form: {
    background: '#f8f8f8', padding: 16, borderRadius: 8,
    marginBottom: 16, border: '1px solid #ddd',
  },
  formTitle: { marginTop: 0, color: '#004D4D' },
  row: { display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  label: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 200, fontSize: 13, color: '#333' },
  input: {
    marginTop: 4, padding: 8, border: '1px solid #ccc',
    borderRadius: 4, fontSize: 14, fontFamily: 'inherit',
  },
  formActions: { display: 'flex', gap: 8, marginTop: 8 },
  filters: { display: 'flex', gap: 8, marginBottom: 16 },
  empty: { textAlign: 'center', color: '#888', padding: 32 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 12,
  },
  card: {
    background: '#fff', border: '1px solid #ddd', borderRadius: 8,
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  },
  thumb: { width: '100%', height: 140, objectFit: 'cover' },
  cardBody: { padding: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { color: '#000', fontSize: 15 },
  itemMeta: { fontSize: 12, color: '#666' },
  lowBadge: {
    background: '#c33', color: '#fff', fontSize: 10,
    padding: '2px 6px', borderRadius: 4, fontWeight: 700,
  },
  colorRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#444' },
  colorDot: {
    width: 14, height: 14, borderRadius: '50%', border: '1px solid #ccc',
  },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' },
  qtyBtn: {
    background: '#004D4D', color: '#fff', border: 'none',
    width: 28, height: 28, borderRadius: 4, cursor: 'pointer', fontSize: 16, fontWeight: 700,
  },
  qty: { fontWeight: 600, color: '#000' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  tag: {
    background: '#e0eaea', color: '#004D4D', fontSize: 11,
    padding: '2px 6px', borderRadius: 10,
  },
  cardActions: {
    display: 'flex', justifyContent: 'flex-end', gap: 12,
    paddingTop: 8, borderTop: '1px solid #eee', marginTop: 4,
  },
  linkBtn: {
    background: 'none', border: 'none', color: '#004D4D',
    cursor: 'pointer', fontSize: 13, padding: 0,
  },
};
