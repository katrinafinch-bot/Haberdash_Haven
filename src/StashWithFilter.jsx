import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

/**
 * Stash tab with phrase-based thread filtering.
 * Searches across: thread name, brand, color name, color code, notes, tags.
 *
 * Drop into your existing Stash tab, or use as full replacement.
 */
export default function StashWithFilter({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('color_name');

  useEffect(() => {
    if (user) fetchStash();
  }, [user]);

  async function fetchStash() {
    setLoading(true);
    // Pull user inventory joined with thread library
    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        id,
        quantity,
        notes,
        is_low_stock,
        tags,
        thread_id,
        thread_library (
          id,
          brand,
          color_name,
          color_code,
          color_hex,
          weight,
          fiber_type
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
      setItems([]);
    } else {
      // Flatten for easier filtering
      setItems(
        (data || []).map((row) => ({
          inv_id: row.id,
          quantity: row.quantity,
          notes: row.notes,
          is_low_stock: row.is_low_stock,
          tags: row.tags || [],
          ...row.thread_library,
        }))
      );
    }
    setLoading(false);
  }

  // Phrase search across multiple fields
  const filtered = useMemo(() => {
    const phrase = search.trim().toLowerCase();
    let result = items;

    if (phrase) {
      // Support quoted phrases AND multi-word AND-search
      const quoted = phrase.match(/"([^"]+)"/g) || [];
      const remaining = phrase.replace(/"[^"]+"/g, '').trim();
      const terms = [
        ...quoted.map((q) => q.slice(1, -1)),
        ...remaining.split(/\s+/).filter(Boolean),
      ];

      result = result.filter((item) => {
        const haystack = [
          item.brand,
          item.color_name,
          item.color_code,
          item.weight,
          item.fiber_type,
          item.notes,
          ...(item.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return terms.every((t) => haystack.includes(t));
      });
    }

    if (brandFilter) result = result.filter((i) => i.brand === brandFilter);
    if (lowStockOnly) result = result.filter((i) => i.is_low_stock);

    // Sort
    return [...result].sort((a, b) => {
      const av = (a[sortBy] || '').toString().toLowerCase();
      const bv = (b[sortBy] || '').toString().toLowerCase();
      return av.localeCompare(bv);
    });
  }, [items, search, brandFilter, lowStockOnly, sortBy]);

  const brands = useMemo(
    () => [...new Set(items.map((i) => i.brand).filter(Boolean))].sort(),
    [items]
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Stash</h2>
        <span style={styles.count}>
          {filtered.length} of {items.length}
        </span>
      </div>

      {/* Filter bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <input
            style={styles.searchInput}
            placeholder='Search: brand, color, code, notes, tags... (use "quotes" for phrases)'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              style={styles.clearBtn}
              onClick={() => setSearch('')}
              title="Clear"
            >
              ×
            </button>
          )}
        </div>

        <div style={styles.filterRow}>
          <select
            style={styles.select}
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            style={styles.select}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="color_name">Sort: Color name</option>
            <option value="brand">Sort: Brand</option>
            <option value="color_code">Sort: Code</option>
          </select>

          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Low stock only
          </label>
        </div>

        {/* Active filter chips */}
        {(search || brandFilter || lowStockOnly) && (
          <div style={styles.chips}>
            {search && (
              <span style={styles.chip}>
                "{search}"
                <button style={styles.chipX} onClick={() => setSearch('')}>×</button>
              </span>
            )}
            {brandFilter && (
              <span style={styles.chip}>
                Brand: {brandFilter}
                <button style={styles.chipX} onClick={() => setBrandFilter('')}>×</button>
              </span>
            )}
            {lowStockOnly && (
              <span style={styles.chip}>
                Low stock
                <button style={styles.chipX} onClick={() => setLowStockOnly(false)}>×</button>
              </span>
            )}
            <button
              style={styles.clearAll}
              onClick={() => {
                setSearch('');
                setBrandFilter('');
                setLowStockOnly(false);
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={styles.empty}>
          {items.length === 0
            ? 'No threads in your stash yet.'
            : 'No matches. Try different keywords.'}
        </p>
      ) : (
        <div style={styles.grid}>
          {filtered.map((t) => (
            <div key={t.inv_id} style={styles.card}>
              <div
                style={{
                  ...styles.swatch,
                  background: t.color_hex || '#ccc',
                }}
              />
              <div style={styles.cardBody}>
                <div style={styles.cardHead}>
                  <strong>{t.color_name}</strong>
                  {t.is_low_stock && <span style={styles.lowBadge}>LOW</span>}
                </div>
                <div style={styles.meta}>{t.brand}</div>
                <div style={styles.meta}>#{t.color_code}</div>
                <div style={styles.qty}>
                  Qty: {t.quantity ?? 0}
                </div>
                {t.tags && t.tags.length > 0 && (
                  <div style={styles.tagRow}>
                    {t.tags.map((tag) => (
                      <span key={tag} style={styles.tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 16, maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { color: '#004D4D', margin: 0 },
  count: { color: '#666', fontSize: 14 },
  filterBar: {
    background: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    margin: '12px 0',
    border: '1px solid #ddd',
  },
  searchWrap: { position: 'relative', marginBottom: 8 },
  searchInput: {
    width: '100%',
    padding: '10px 36px 10px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box',
  },
  clearBtn: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#ddd',
    border: 'none',
    width: 22,
    height: 22,
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
  },
  filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  select: {
    padding: 8,
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 13,
    background: '#fff',
  },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#333' },
  chips: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' },
  chip: {
    background: '#004D4D',
    color: '#fff',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 12,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  chipX: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    padding: 0,
    lineHeight: 1,
  },
  clearAll: {
    background: 'none',
    border: 'none',
    color: '#c33',
    cursor: 'pointer',
    fontSize: 12,
    textDecoration: 'underline',
  },
  empty: { textAlign: 'center', color: '#888', padding: 32 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 10,
  },
  card: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  swatch: { height: 70 },
  cardBody: { padding: 10, fontSize: 13 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  meta: { color: '#666', fontSize: 12, marginTop: 2 },
  qty: { marginTop: 6, fontWeight: 600 },
  lowBadge: {
    background: '#c33',
    color: '#fff',
    fontSize: 9,
    padding: '2px 5px',
    borderRadius: 3,
    fontWeight: 700,
  },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: {
    background: '#e0eaea',
    color: '#004D4D',
    fontSize: 10,
    padding: '2px 5px',
    borderRadius: 8,
  },
};
