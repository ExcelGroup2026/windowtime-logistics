// ============================================
// App Data Interceptor
// Intercepts and saves data from the app
// ============================================

console.log('[APP-INTERCEPTOR] Loading...');

(function() {
  // Override fetch to capture any POST/PUT requests from the app
  const origFetch = window.fetch;

  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    const method = (options.method || 'GET').toUpperCase();

    console.log('[APP-INTERCEPTOR] fetch called:', method, url);

    // Capture POST/PUT requests
    if ((method === 'POST' || method === 'PUT') && options.body) {
      try {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        console.log('[APP-INTERCEPTOR] Captured POST/PUT body:', body);

        // Save to localStorage for syncing
        if (body && typeof body === 'object') {
          const timestamp = new Date().toISOString();

          // Extract queue number from various possible fields
          let queueNo = null;
          if (body['Queue No. (Q)']) queueNo = body['Queue No. (Q)'];
          else if (body['คิวที่']) queueNo = body['คิวที่'];
          else if (body.queue) queueNo = body.queue;
          else if (body.queueNo) queueNo = body.queueNo;

          // If no queue number found, use one of the values from the object
          if (!queueNo) {
            const keys = Object.keys(body);
            if (keys.length > 0) {
              queueNo = String(body[keys[0]]).substring(0, 20);
            } else {
              queueNo = 'unknown';
            }
          }

          const storageKey = `queue_${queueNo}_${timestamp}`;

          // Store the actual object, not stringified
          // JSON.stringify will be done by localStorage-proxy
          localStorage.setItem(storageKey, JSON.stringify(body));
          localStorage.setItem('last_queue', JSON.stringify(body));
          localStorage.setItem('last_queue_timestamp', timestamp);

          console.log('[APP-INTERCEPTOR] ✅ Saved to localStorage:', storageKey, 'Queue:', queueNo);
        }
      } catch (e) {
        console.log('[APP-INTERCEPTOR] Could not parse body:', e.message);
      }
    }

    // Call original fetch
    return origFetch.apply(this, args);
  };

  console.log('[APP-INTERCEPTOR] ✅ Fetch intercepted');

  // Also monitor XMLHttpRequest
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._intercept_method = method;
    this._intercept_url = url;
    return origOpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(body) {
    if ((this._intercept_method === 'POST' || this._intercept_method === 'PUT') && body) {
      console.log('[APP-INTERCEPTOR] XHR POST/PUT:', this._intercept_url);
      try {
        const data = typeof body === 'string' ? JSON.parse(body) : body;
        console.log('[APP-INTERCEPTOR] Captured XHR body:', data);

        // Save to localStorage for syncing
        if (data && typeof data === 'object') {
          const timestamp = new Date().toISOString();
          const queueNo = data['Queue No. (Q)'] || data['คิวที่'] || data.queue || 'unknown';
          const storageKey = `queue_${queueNo}_${timestamp}`;

          localStorage.setItem(storageKey, JSON.stringify(data));
          localStorage.setItem('last_queue', JSON.stringify(data));
          localStorage.setItem('last_queue_timestamp', timestamp);

          console.log('[APP-INTERCEPTOR] ✅ Saved to localStorage:', storageKey);
        }
      } catch (e) {
        console.log('[APP-INTERCEPTOR] Could not parse XHR body:', e.message);
      }
    }

    return origSend.apply(this, [body]);
  };

  console.log('[APP-INTERCEPTOR] ✅ XHR intercepted');

  // Create a button that manually saves current page data
  function createAutoSaveButton() {
    const btn = document.createElement('button');
    btn.textContent = '⚙️ Auto-capture ON';
    btn.style.cssText = `
      position: fixed;
      bottom: 180px;
      right: 20px;
      padding: 8px 12px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      z-index: 99997;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;

    btn.title = 'Auto-capture is enabled - data will be saved automatically when the app sends it';

    document.body.appendChild(btn);
    console.log('[APP-INTERCEPTOR] Auto-capture button created');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAutoSaveButton);
  } else {
    setTimeout(createAutoSaveButton, 100);
  }

  console.log('[APP-INTERCEPTOR] ✅✅✅ READY - All app data will be automatically captured and synced to Google Sheets');
})();
