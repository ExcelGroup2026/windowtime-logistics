// ============================================
// Comprehensive Save Interceptor
// Intercepts ALL data save methods
// ============================================

console.log('🔍 Comprehensive Save Interceptor: Loading...');

// 1. Monitor ALL fetch calls
const origFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  const options = args[1] || {};

  if (options.method === 'POST' || options.method === 'PUT') {
    console.log('📤 Fetch POST/PUT:', url);
    if (options.body) {
      try {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        console.log('📋 Fetch body:', data);
        captureAndSaveData(data);
      } catch (e) {
        console.log('Could not parse fetch body');
      }
    }
  }

  return origFetch.apply(this, args);
};

// 2. Monitor ALL XMLHttpRequest
const origOpen = XMLHttpRequest.prototype.open;
const origSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...args) {
  this._method = method;
  this._url = url;
  return origOpen.apply(this, [method, url, ...args]);
};

XMLHttpRequest.prototype.send = function(body) {
  if (this._method === 'POST' || this._method === 'PUT') {
    console.log('📤 XHR POST/PUT:', this._url);
    if (body) {
      try {
        const data = typeof body === 'string' ? JSON.parse(body) : body;
        console.log('📋 XHR body:', data);
        captureAndSaveData(data);
      } catch (e) {
        console.log('Could not parse XHR body');
      }
    }
  }

  return origSend.apply(this, [body]);
};

// 3. Monitor ALL button clicks
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const text = btn.textContent || '';

  if (text.includes('บันทึก') || text.includes('Save') || text.includes('Submit') || text.includes('save')) {
    console.log('💾 Save button clicked:', text.substring(0, 30));

    // Wait a bit for data to be ready, then capture from inputs
    setTimeout(() => {
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
        console.log('📋 Captured from inputs:', data);
        captureAndSaveData(data);
      }
    }, 100);
  }
}, true);

// 4. Monitor form submissions
document.addEventListener('submit', (e) => {
  console.log('📝 Form submitted:', e.target.tagName);

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  if (Object.keys(data).length > 0) {
    console.log('📋 Form data:', data);
    captureAndSaveData(data);
  }
}, true);

// 5. Monitor window changes (Vue/React state updates)
const handler = {
  get(target, prop) {
    return Reflect.get(target, prop);
  }
};

function captureAndSaveData(rawData) {
  if (!rawData || (typeof rawData === 'object' && Object.keys(rawData).length === 0)) {
    return;
  }

  // Flatten and clean data
  const data = flattenObject(rawData);

  // Generate key
  const timestamp = new Date().toISOString();
  const queueNo = data['Queue No. (Q)'] || data['คิวที่'] || data.queue || data['queue_no'] || 'unknown';
  const storageKey = `queue_${queueNo}_${timestamp}`;

  // Save to localStorage
  localStorage.setItem(storageKey, JSON.stringify(data));
  localStorage.setItem('last_queue', JSON.stringify(data));
  localStorage.setItem('last_queue_timestamp', timestamp);

  console.log('✅ Data saved to localStorage:', storageKey);
}

function flattenObject(obj, prefix = '') {
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
}

console.log('✅ Comprehensive Save Interceptor loaded');
console.log('📊 Monitoring: fetch, XHR, form submissions, button clicks');
