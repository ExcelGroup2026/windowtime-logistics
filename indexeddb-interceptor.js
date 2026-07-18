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
  // Intercept IDBObjectStore.prototype methods
  const origPut = IDBObjectStore.prototype.put;
  const origAdd = IDBObjectStore.prototype.add;

  IDBObjectStore.prototype.put = function(value, key) {
    console.log('📝 IDBObjectStore.put:', value);
    syncToSheets(value);
    return origPut.apply(this, [value, key]);
  };

  IDBObjectStore.prototype.add = function(value, key) {
    console.log('📝 IDBObjectStore.add:', value);
    syncToSheets(value);
    return origAdd.apply(this, [value, key]);
  };

  console.log('✅ IDBObjectStore interceptor installed');
}

function syncToSheets(data) {
  if (!window.sheetAPI || !data) {
    return;
  }

  console.log('🔄 Attempting to sync to Google Sheets:', data);

  // Check if data looks like queue/booking data
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
    'Queue No. (Q)': data.queue || data['queue no'] || data.คิวที่ || data.queue_no || data['Queue No.'] || '',
    'Customer PO No.': data.po || data['po no'] || data.ลูกค้า || data.customer_po || data['Customer PO No.'] || '',
    'Ship To Name / Destination': data.destination || data.ปลายทาง || data.customer_name || data['Ship To Name / Destination'] || '',
    'Description': data.description || data.รายละเอียด || data['Description'] || '',
    'Qty': data.qty || data.จำนวน || data['Qty'] || '',
    'Fleet Type (Own Fleet/Subcontractor)': data.fleet || data['fleet type'] || data['fleet_type'] || data['Fleet Type (Own Fleet/Subcontractor)'] || '',
    'Subcontractor Company': data.subcontractor || data.subcontractor_company || data['Subcontractor Company'] || '',
    'Truck Plate No.': data.plate || data['plate no'] || data.ทะเบียน || data.truck_plate || data['Truck Plate No.'] || '',
    'Driver Name': data.driver || data['driver name'] || data.driver_name || data.คนขับ || data['Driver Name'] || '',
    'Truck Type (4W/6W/10W)': data['truck type'] || data.truck_type || data.ประเภท || data['Truck Type (4W/6W/10W)'] || '',
    'Window Start': data['window start'] || data.window_start || data.window || data['Window Start'] || '',
    'Window End': data['window end'] || data.window_end || data['Window End'] || '',
    'Dock No.': data.dock || data['dock no'] || data.dock_no || data.ช่อง || data['Dock No.'] || '',
    'Status': data.status || data.สถานะ || data['Status'] || '',
    'Cancel Reason': data.reason || data.หมายเหตุ || data.cancel_reason || data['Cancel Reason'] || ''
  };

  return queueData;
}

console.log('✅ IndexedDB interceptor loaded');
