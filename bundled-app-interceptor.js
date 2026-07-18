// ============================================
// Bundled App Interceptor - Capture all data saves
// ============================================

console.log('🔍 Bundled App Interceptor: Initializing...');

// Wait for sheetAPI to load
let retries = 0;
const waitForSheetAPI = setInterval(() => {
  if (window.sheetAPI) {
    clearInterval(waitForSheetAPI);
    console.log('✅ SheetAPI ready - initializing interceptor');
    initInterceptor();
  } else if (retries++ > 50) {
    clearInterval(waitForSheetAPI);
    console.warn('⚠️ SheetAPI not found after retries');
  }
}, 100);

function initInterceptor() {
  // Intercept XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._method = method;
    this._url = url;
    return originalXHROpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(body) {
    const self = this;
    const originalOnReadyStateChange = this.onreadystatechange;

    // Capture response
    this.onreadystatechange = function() {
      if (this.readyState === 4) {
        try {
          // Try to parse response
          const response = this.responseText;
          console.log('📤 XHR Response:', this._url, response?.substring(0, 100));
        } catch (e) {
          // Silent
        }
      }

      // Call original handler
      if (originalOnReadyStateChange) {
        originalOnReadyStateChange.call(this);
      }
    };

    // Log request
    if (this._method === 'POST' || this._method === 'PUT') {
      console.log('📤 XHR Request:', this._method, this._url);
      if (body) {
        console.log('📋 Body:', body?.substring ? body.substring(0, 200) : body);

        // Try to parse and sync to Sheets
        try {
          let jsonData = null;

          if (typeof body === 'string') {
            // Try JSON parse
            try {
              jsonData = JSON.parse(body);
            } catch (e) {
              // Try FormData
              if (body.includes('=')) {
                jsonData = {};
                const params = new URLSearchParams(body);
                params.forEach((value, key) => {
                  jsonData[key] = value;
                });
              }
            }
          }

          if (jsonData) {
            console.log('✅ Extracted data:', jsonData);
            syncToSheets(jsonData);
          }
        } catch (e) {
          console.warn('⚠️ Could not extract data:', e.message);
        }
      }
    }

    return originalXHRSend.apply(this, [body]);
  };

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};

    if (options.method === 'POST' || options.method === 'PUT') {
      console.log('📤 Fetch Request:', options.method, url);
      if (options.body) {
        console.log('📋 Body:', options.body?.substring ? options.body.substring(0, 200) : options.body);

        // Try to sync
        try {
          let jsonData = null;

          if (typeof options.body === 'string') {
            try {
              jsonData = JSON.parse(options.body);
            } catch (e) {
              if (options.body.includes('=')) {
                jsonData = {};
                const params = new URLSearchParams(options.body);
                params.forEach((value, key) => {
                  jsonData[key] = value;
                });
              }
            }
          }

          if (jsonData) {
            console.log('✅ Extracted fetch data:', jsonData);
            syncToSheets(jsonData);
          }
        } catch (e) {
          console.warn('⚠️ Could not extract fetch data:', e.message);
        }
      }
    }

    return originalFetch.apply(this, args);
  };

  // Monitor form submissions
  document.addEventListener('submit', (e) => {
    console.log('📝 Form submitted:', e.target);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (Object.keys(data).length > 0) {
      console.log('✅ Form data captured:', data);
      syncToSheets(data);
    }
  }, true);

  console.log('✅ Bundled app interceptor initialized');
}

function syncToSheets(data) {
  if (!window.sheetAPI) {
    console.warn('⚠️ SheetAPI not available');
    return;
  }

  // Map bundled app fields to Google Sheets
  const queueData = {
    'Date': data.date || data.วันที่ || new Date().toISOString().split('T')[0],
    'Queue No. (Q)': data.queue || data['queue no'] || data['คิวที่'] || '',
    'Customer PO No.': data.po || data['customer po'] || data['ลูกค้า'] || '',
    'Ship To Name / Destination': data.destination || data.ปลายทาง || '',
    'Description': data.description || data.รายละเอียด || '',
    'Qty': data.qty || data.จำนวน || '',
    'Fleet Type (Own Fleet/Subcontractor)': data.fleet || data['fleet type'] || '',
    'Subcontractor Company': data.subcontractor || data['บริษัท'] || '',
    'Truck Plate No.': data.plate || data['plate no'] || data.ทะเบียน || '',
    'Driver Name': data.driver || data['driver name'] || data.คนขับ || '',
    'Truck Type (4W/6W/10W)': data['truck type'] || data.ประเภท || '',
    'Window Start': data['window start'] || data.window || '',
    'Window End': data['window end'] || '',
    'Dock No.': data.dock || data['dock no'] || data.ช่อง || '',
    'Status': data.status || data.สถานะ || '',
    'Cancel Reason': data.reason || data.หมายเหตุ || ''
  };

  // Check if we have meaningful data
  const hasData = Object.values(queueData).some(v => v && String(v).trim());

  if (hasData) {
    console.log('📊 Syncing to Google Sheets:', queueData);

    window.sheetAPI.saveSheet('Queues', [queueData])
      .then(result => {
        console.log('✅ Synced to Queues sheet:', result);
      })
      .catch(error => {
        console.error('❌ Sync failed:', error.message);
      });
  }
}

console.log('✅ Bundled app interceptor loaded');
