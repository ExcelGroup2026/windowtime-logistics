// ============================================
// Comprehensive Save Interceptor
// Must execute IMMEDIATELY before bundled app
// ============================================

(function() {
  console.log('🔍 [INTERCEPTOR] Starting immediate execution');

  // Ensure functions are on window for debugging
  window.captureAndSaveData = function(rawData) {
    if (!rawData || (typeof rawData === 'object' && Object.keys(rawData).length === 0)) {
      return;
    }

    const data = flattenObject(rawData);
    const timestamp = new Date().toISOString();
    const queueNo = data['Queue No. (Q)'] || data['คิวที่'] || data.queue || data['queue_no'] || 'unknown';
    const storageKey = `queue_${queueNo}_${timestamp}`;

    localStorage.setItem(storageKey, JSON.stringify(data));
    localStorage.setItem('last_queue', JSON.stringify(data));
    localStorage.setItem('last_queue_timestamp', timestamp);

    console.log('✅ [INTERCEPTOR] Data saved to localStorage:', storageKey);
  };

  window.flattenObject = function(obj, prefix = '') {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(result, flattenObject(value, newKey));
        } else if (value !== null && value !== undefined && value !== '') {
          result[newKey] = String(value);
        }
      }
    }
    return result;
  };

  console.log('✅ [INTERCEPTOR] Functions defined on window');

  // 1. Override fetch
  const origFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};

    if (options.method === 'POST' || options.method === 'PUT') {
      console.log('📤 [INTERCEPTOR] Fetch POST/PUT:', url);
      if (options.body) {
        try {
          const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
          console.log('📋 [INTERCEPTOR] Fetch body:', data);
          window.captureAndSaveData(data);
        } catch (e) {
          console.log('[INTERCEPTOR] Could not parse fetch body:', e.message);
        }
      }
    }
    return origFetch.apply(this, args);
  };
  console.log('✅ [INTERCEPTOR] Fetch intercepted');

  // 2. Override XHR
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._method = method;
    this._url = url;
    return origOpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(body) {
    if (this._method === 'POST' || this._method === 'PUT') {
      console.log('📤 [INTERCEPTOR] XHR POST/PUT:', this._url);
      if (body) {
        try {
          const data = typeof body === 'string' ? JSON.parse(body) : body;
          console.log('📋 [INTERCEPTOR] XHR body:', data);
          window.captureAndSaveData(data);
        } catch (e) {
          console.log('[INTERCEPTOR] Could not parse XHR body:', e.message);
        }
      }
    }
    return origSend.apply(this, [body]);
  };
  console.log('✅ [INTERCEPTOR] XHR intercepted');

  // 3. Monitor form submissions
  const handleSubmit = function(e) {
    console.log('📝 [INTERCEPTOR] Form submitted:', e.target.tagName);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      if (Object.keys(data).length > 0) {
        console.log('📋 [INTERCEPTOR] Form data:', data);
        window.captureAndSaveData(data);
      }
    } catch (err) {
      console.log('[INTERCEPTOR] Form submission error:', err.message);
    }
  };

  // Try to add event listener immediately
  try {
    document.addEventListener('submit', handleSubmit, true);
    console.log('✅ [INTERCEPTOR] Form submit listener added');
  } catch (e) {
    console.log('[INTERCEPTOR] Could not add form listener immediately');
    // Retry after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('submit', handleSubmit, true);
        console.log('✅ [INTERCEPTOR] Form submit listener added after DOMContentLoaded');
      });
    }
  }

  // 4. Monitor button clicks
  const handleClick = function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const text = btn.textContent || '';
    if (text.includes('บันทึก') || text.includes('Save') || text.includes('Submit') || text.includes('save')) {
      console.log('💾 [INTERCEPTOR] Save button clicked:', text.substring(0, 30));

      setTimeout(() => {
        try {
          const parent = btn.closest('form') || btn.closest('div[role="main"]') || btn.closest('main') || document.body;
          const inputs = parent.querySelectorAll('input, textarea, select');
          const data = {};
          let hasData = false;

          inputs.forEach(inp => {
            if (inp.value && inp.value.trim()) {
              const key = inp.name || inp.id || inp.placeholder || inp.getAttribute('aria-label');
              if (key) {
                data[key] = inp.value;
                hasData = true;
              }
            }
          });

          if (hasData) {
            console.log('📋 [INTERCEPTOR] Captured from inputs:', data);
            window.captureAndSaveData(data);
          }
        } catch (err) {
          console.log('[INTERCEPTOR] Error capturing input data:', err.message);
        }
      }, 100);
    }
  };

  try {
    document.addEventListener('click', handleClick, true);
    console.log('✅ [INTERCEPTOR] Click listener added');
  } catch (e) {
    console.log('[INTERCEPTOR] Could not add click listener immediately');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('click', handleClick, true);
        console.log('✅ [INTERCEPTOR] Click listener added after DOMContentLoaded');
      });
    }
  }

  console.log('✅✅✅ [INTERCEPTOR] READY - Monitoring: fetch, XHR, form submissions, button clicks');
})();
