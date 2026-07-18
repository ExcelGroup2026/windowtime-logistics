// ============================================
// Bundled App Data Sync - Auto-sync to Google Sheets
// ============================================

console.log('🔄 Bundled App Sync: Initializing...');

// Wait for sheetAPI to load
let retries = 0;
const waitForSheetAPI = setInterval(() => {
  if (window.sheetAPI) {
    clearInterval(waitForSheetAPI);
    console.log('✅ SheetAPI ready - initializing bundled app sync');
    initSync();
  } else if (retries++ > 50) {
    clearInterval(waitForSheetAPI);
    console.warn('⚠️ SheetAPI not found after retries');
  }
}, 100);

function initSync() {
  // Override fetch to intercept bundled app requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};

    // Intercept POST requests (likely data submissions)
    if (options.method === 'POST' || (typeof url === 'string' && url.includes('api'))) {
      console.log('📤 Intercepted POST request:', url);

      // Get request body
      let body = options.body;
      if (body) {
        try {
          if (typeof body === 'string') {
            body = JSON.parse(body);
          }
          console.log('📋 Request body:', body);

          // Try to extract queue/delivery data
          syncDataToSheets(body);
        } catch (e) {
          console.warn('⚠️ Could not parse request body:', e.message);
        }
      }
    }

    // Call original fetch
    return originalFetch.apply(this, args);
  };

  // Also monitor for form submissions
  document.addEventListener('submit', (e) => {
    console.log('📝 Form submitted:', e.target);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('📋 Form data:', data);

    syncDataToSheets(data);
  }, true);

  // Monitor for any data changes in key DOM elements
  monitorDOMChanges();
}

function syncDataToSheets(data) {
  if (!window.sheetAPI) {
    console.warn('⚠️ SheetAPI not available');
    return;
  }

  // Try to extract queue information from bundled app data
  const queueData = extractQueueData(data);

  if (queueData && Object.keys(queueData).length > 0) {
    console.log('✅ Extracted queue data:', queueData);

    // Sync to Queues sheet
    window.sheetAPI.saveSheet('Queues', [queueData])
      .then(result => {
        console.log('✅ Synced to Google Sheets:', result);
      })
      .catch(error => {
        console.warn('⚠️ Failed to sync:', error.message);
      });
  }
}

function extractQueueData(data) {
  // Map bundled app fields to Google Sheets columns
  const mapping = {
    // Common field names in different formats
    'date': 'Date',
    'queue': 'Queue No. (Q)',
    'queueNo': 'Queue No. (Q)',
    'customer': 'Ship To Name / Destination',
    'destination': 'Ship To Name / Destination',
    'driver': 'Driver Name',
    'driverName': 'Driver Name',
    'truck': 'Truck Plate No.',
    'truckPlate': 'Truck Plate No.',
    'truckType': 'Truck Type (4W/6W/10W)',
    'status': 'Status',
    'qty': 'Qty',
    'description': 'Description',
    'dock': 'Dock No.',
    'dockNo': 'Dock No.',
  };

  const queueData = {
    'Date': new Date().toISOString().split('T')[0],
    'Queue No. (Q)': '',
    'Customer PO No.': '',
    'Ship To Name / Destination': '',
    'Description': '',
    'Qty': '',
    'Fleet Type (Own Fleet/Subcontractor)': '',
    'Subcontractor Company': '',
    'Truck Plate No.': '',
    'Driver Name': '',
    'Truck Type (4W/6W/10W)': '',
    'Window Start': '',
    'Window End': '',
    'Dock No.': '',
    'Status': '',
    'Cancel Reason': ''
  };

  let hasData = false;

  // Match incoming data to schema
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') continue;

    const lowerKey = key.toLowerCase();
    const mappedField = mapping[lowerKey];

    if (mappedField && queueData.hasOwnProperty(mappedField)) {
      queueData[mappedField] = String(value);
      hasData = true;
    }

    // Also try direct key match
    if (queueData.hasOwnProperty(key)) {
      queueData[key] = String(value);
      hasData = true;
    }
  }

  return hasData ? queueData : null;
}

function monitorDOMChanges() {
  // Monitor for input changes in forms
  document.addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      console.log('📝 Field changed:', e.target.name || e.target.id, '=', e.target.value);
    }
  }, true);

  // Monitor for button clicks that might save data
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const buttonText = e.target.textContent || '';
      console.log('🔘 Button clicked:', buttonText);

      // Look for save/submit buttons
      if (buttonText.includes('บันทึก') ||
          buttonText.includes('Save') ||
          buttonText.includes('Submit') ||
          buttonText.includes('เข้าระบบ')) {
        console.log('💾 Potential save button detected');
      }
    }
  }, true);
}

console.log('✅ Bundled App Sync loaded - waiting for user actions');
