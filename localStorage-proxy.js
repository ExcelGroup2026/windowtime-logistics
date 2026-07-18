// ============================================
// localStorage Proxy - Intercept and sync with Google Sheets
// ============================================

console.log('[PROXY] START - localStorage proxy loading');

// Override immediately before anything else
const origSetItem = Storage.prototype.setItem;
const origGetItem = Storage.prototype.getItem;

console.log('[PROXY] Original methods saved');

Storage.prototype.setItem = function(key, value) {
  console.log('[PROXY] >>> setItem:', key, '=', (value + '').substring(0, 50));

  // Save to localStorage first
  origSetItem.call(this, key, value);

  // Skip syncing for metadata keys to prevent infinite loops
  if (key.startsWith('windowtime_') || !key.startsWith('queue_')) {
    console.log('[PROXY] Skipping sync for non-queue key:', key);
    return;
  }

  // Sync to sheets if available
  if (window.sheetAPI && typeof window.sheetAPI.saveSheet === 'function') {
    syncToSheets(key, value).catch(err => {
      console.log('[PROXY] Sync error:', err.message);
    });
  } else {
    console.log('[PROXY] sheetAPI not ready yet for:', key);
  }
};

console.log('[PROXY] setItem override installed');

function syncToSheets(key, value) {
  return new Promise((resolve, reject) => {
    try {
      // Only sync queue_ keys
      if (!key.startsWith('queue_')) {
        console.log('[PROXY] Skipping non-queue key:', key);
        resolve();
        return;
      }

      // Parse the value
      let data;
      try {
        data = typeof value === 'string' ? JSON.parse(value) : value;
      } catch (e) {
        console.log('[PROXY] Failed to parse value for:', key);
        reject(e);
        return;
      }

      // Extract queue number from key
      const parts = key.split('_');
      const queueNo = parts[1] || 'unknown';

      // Prepare row data - ensure all values are strings or primitives
      const row = {
        'Queue No. (Q)': queueNo,
        ...data
      };

      // Log what we're about to send
      console.log('[PROXY] Row before send:', row);
      console.log('[PROXY] Row keys:', Object.keys(row));

      // Ensure all values are properly formatted
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          const val = row[key];
          console.log(`  [PROXY] ${key} = ${typeof val} = ${String(val).substring(0, 50)}`);
        }
      }

      // Send to sheets
      window.sheetAPI.saveSheet('TimeStamps', [row])
        .then(() => {
          console.log('[PROXY] ✅ Synced to TimeStamps sheet for queue:', queueNo);
          resolve();
        })
        .catch(err => {
          console.log('[PROXY] ❌ Failed to sync:', err.message);
          reject(err);
        });

    } catch (err) {
      console.log('[PROXY] Exception in syncToSheets:', err.message);
      reject(err);
    }
  });
}

console.log('[PROXY] ✅✅✅ READY - localStorage setItem is now proxied to Google Sheets');
