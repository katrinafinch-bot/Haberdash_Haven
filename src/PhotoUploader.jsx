import { useState } from 'react';
import { supabase } from './supabaseClient';

/**
 * Reusable photo uploader for machines and projects.
 *
 * Props:
 *   bucket       - 'machine-photos' or 'project-photos'
 *   userId       - current user's UUID
 *   existing     - array of existing photo URLs
 *   onChange     - callback(newUrls) when photos change
 *   maxPhotos    - default 6
 *   maxSizeMB    - default 5
 */
export default function PhotoUploader({
  bucket,
  userId,
  existing = [],
  onChange,
  maxPhotos = 6,
  maxSizeMB = 5,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (existing.length + files.length > maxPhotos) {
      setError(`Max ${maxPhotos} photos. Remove some first.`);
      return;
    }

    setUploading(true);
    setError('');
    const newUrls = [...existing];

    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} exceeds ${maxSizeMB}MB limit.`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image.`);
        continue;
      }

      const ext = file.name.split('.').pop().toLowerCase();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${userId}/${filename}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (upErr) {
        setError(`Upload failed: ${upErr.message}`);
        continue;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (data?.publicUrl) newUrls.push(data.publicUrl);
    }

    setUploading(false);
    onChange(newUrls);
    e.target.value = ''; // reset input
  }

  async function handleRemove(url) {
    // Extract path: bucket/userId/filename
    const parts = url.split(`/${bucket}/`);
    if (parts.length === 2) {
      const path = parts[1];
      const { error: delErr } = await supabase.storage.from(bucket).remove([path]);
      if (delErr) console.warn('Storage delete failed:', delErr);
    }
    onChange(existing.filter((u) => u !== url));
  }

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {existing.map((url) => (
          <div key={url} style={styles.thumbWrap}>
            <img src={url} alt="" style={styles.thumb} />
            <button
              type="button"
              style={styles.removeBtn}
              onClick={() => handleRemove(url)}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
        {existing.length < maxPhotos && (
          <label style={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFiles}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <span style={styles.uploadIcon}>📷</span>
            <span style={styles.uploadText}>
              {uploading ? 'Uploading...' : 'Add Photo'}
            </span>
          </label>
        )}
      </div>
      <div style={styles.meta}>
        {existing.length} / {maxPhotos} photos · max {maxSizeMB}MB each
      </div>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles = {
  container: { marginTop: 8 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: 8,
  },
  thumbWrap: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid #ddd',
  },
  thumb: { width: '100%', height: '100%', objectFit: 'cover' },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    width: 24,
    height: 24,
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1,
  },
  uploadBox: {
    aspectRatio: '1',
    border: '2px dashed #004D4D',
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#004D4D',
    background: '#f8fafa',
  },
  uploadIcon: { fontSize: 24 },
  uploadText: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  meta: { fontSize: 11, color: '#888', marginTop: 6 },
  error: { color: '#c33', fontSize: 13, marginTop: 6 },
};
