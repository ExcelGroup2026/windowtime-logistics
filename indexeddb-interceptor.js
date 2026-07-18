// ============================================
// IndexedDB Interceptor - Capture data saves
// ============================================

console.log('📦 IndexedDB Interceptor: Initializing...');

// Wait for sheetAPI
let retries = 0;
const waitForSheetAPI = setInterval(() => {
  if (window.sheetAPI) {
    clearInterval(waitForSheetAPI);
    console.log('✅ SheetAPI ready - initializing IndexedDB interceptor');
    initIndexedDBInterceptor();
  } else if (retries++ > 50) {
    clearInterval(waitForSheetAPI);
    console.warn('⚠️ SheetAPI not found');
  }
}, 100);

function initIndexedDBInterceptor() {
  const originalOpen = indexedDB.open;

  indexedDB.open = function(dbName, version) {
    console.log('📂 IndexedDB.open:', dbName, version);

    const request = originalOpen.apply(this, arguments);

    request.onsuccess = function(e) {
      const db = e.target.result;
      console.log('✅ DB opened:', dbName);
      console.log('📋 Object Stores:', Array.from(db.objectStoreNames));

      // Intercept all object stores
      for (let i = 0; i < db.objectStoreNames.length; i++) {
        const storeName = db.objectStoreNames[i];
        monitorObjectStore(db, storeName);
      }
    };

    request.onerror = function(e) {
      console.error('❌ IndexedDB error:', e);
    };

    return request;
  };

  console.log('✅ IndexedDB.open interceptor installed');
}

function monitorObjectStore(db, storeName) {
  // Intercept put operations
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);

  // Override put method on subsequent transactions
  const origTransaction = db.transaction;
  db.transaction = function(storeNames, mode, ...args) {
    const tx = origTransaction.apply(this, [storeNames, mode, ...args]);

    if (mode === 'readwrite' || mode === 'write') {
      const origAddMethod = tx.objectStore(storeNames[0]).add;
      const origPutMethod = tx.objectStore(storeNames[0]).put;
      const origDeleteMethod = tx.objectStore(storeNames[0]).delete;
      const origClearMethod = tx.objectStore(storeNames[0]).clear;

      // Intercept add
      if (origAddMethod) {
        tx.objectStore(storeNames[0]).add = function(data, ...a) {
          console.log('📝 IndexedDB ADD:', storeName, data);
          syncToSheets(data);
          return origAddMethod.apply(this, [data, ...a]);
        };
      }

      // Intercept put
      if (origPutMethod) {
        tx.objectStore(storeNames[0]).put = function(data, ...a) {
          console.log('📝 IndexedDB PUT:', storeName, data);
          syncToSheets(data);
          return origPutMethod.apply(this, [data, ...a]);
        };
      }

      // Intercept delete
      if (origDeleteMethod) {
        tx.objectStore(storeNames[0]).delete = function(key, ...a) {
          console.log('🗑️ IndexedDB DELETE:', storeName, key);
          return origDeleteMethod.apply(this, [key, ...a]);
        };
      }

      // Intercept clear
      if (origClearMethod) {
        tx.objectStore(storeNames[0]).clear = function(...a) {
          console.log('🧹 IndexedDB CLEAR:', storeName);
          return origClearMethod.apply(this, [...a]);
        };
      }
    }

    return tx;
  };
}

function syncToSheets(data) {
  if (!window.sheetAPI || !data) return;

  console.log('🔄 Attempting to sync to Google Sheets:', data);

  // Check if data looks like queue data
  const queueData = mapToQueueSchema(data);

  if (queueData && Object.values(queueData).some(v => v && String(v).trim())) {
    console.log('📊 Syncing queue data:', queueData);

    window.sheetAPI.saveSheet('Queues', [queueData])
      .then(result => {
        console.log('✅ Synced to Queues:', result);
      })
      .catch(error => {
        console.warn('⚠️ Sync failed:', error.message);
      });
  }
}

function mapToQueueSchema(data) {
  if (!data || typeof data !== 'object') return null;

  const queueData = {
    'Date': data.date || data.วันที่ || new Date().toISOString().split('T')[0],
    'Queue No. (Q)': data.queue || data['queue no'] || data.คิวที่ || data.queue_no || '',
    'Customer PO No.': data.po || data['po no'] || data.ลูกค้า || data.customer_po || '',
    'Ship To Name / Destination': data.destination || data.ปลายทาง || data.customer_name || '',
    'Description': data.description || data.รายละเอียด || '',
    'Qty': data.qty || data.จำนวน || '',
    'Fleet Type (Own Fleet/Subcontractor)': data.fleet || data['fleet type'] || data['fleet_type'] || '',
    'Subcontractor Company': data.subcontractor || data.subcontractor_company || '',
    'Truck Plate No.': data.plate || data['plate no'] || data.ทะเบียน || data.truck_plate || '',
    'Driver Name': data.driver || data['driver name'] || data.driver_name || data.คนขับ || '',
    'Truck Type (4W/6W/10W)': data['truck type'] || data.truck_type || data.ประเภท || '',
    'Window Start': data['window start'] || data.window_start || data.window || '',
    'Window End': data['window end'] || data.window_end || '',
    'Dock No.': data.dock || data['dock no'] || data.dock_no || data.ช่อง || '',
    'Status': data.status || data.สถานะ || '',
    'Cancel Reason': data.reason || data.หมายเหตุ || data.cancel_reason || ''
  };

  return queueData;
}

console.log('✅ IndexedDB interceptor loaded');
