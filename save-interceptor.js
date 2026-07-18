// ============================================
// Save Interceptor - Capture form saves
// ============================================

console.log('💾 Save Interceptor: Initializing...');

// Monitor all form submissions
document.addEventListener('submit', (e) => {
  console.log('📝 Form submitted:', e.target);

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  if (Object.keys(data).length > 0) {
    console.log('✅ Form data captured:', data);
    saveToLocalStorage(data);
  }
}, true);

// Also monitor button clicks for save/submit buttons
document.addEventListener('click', (e) => {
  const btn = e.target;
  const text = btn.textContent || '';

  // Check if it's a save button
  if (text.includes('บันทึก') || text.includes('Save') || text.includes('Submit')) {
    console.log('💾 Save button clicked:', text);

    // Try to find and capture form data
    const form = btn.closest('form');
    if (form) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      if (Object.keys(data).length > 0) {
        console.log('✅ Form data from clicked button:', data);
        saveToLocalStorage(data);
      }
    } else {
      // Try to find input values near the button
      const parent = btn.closest('div[class*="modal"], div[class*="dialog"], [role="main"], main, .container');
      if (parent) {
        const inputs = parent.querySelectorAll('input, textarea, select');
        const data = {};

        inputs.forEach(inp => {
          if (inp.name) {
            data[inp.name] = inp.value;
          } else if (inp.placeholder) {
            data[inp.placeholder] = inp.value;
          } else if (inp.id) {
            data[inp.id] = inp.value;
          }
        });

        if (Object.keys(data).length > 0) {
          console.log('✅ Form data from inputs near button:', data);
          saveToLocalStorage(data);
        }
      }
    }
  }
}, true);

function saveToLocalStorage(data) {
  if (!data || Object.keys(data).length === 0) return;

  // Generate key based on data content
  const timestamp = new Date().toISOString();
  const queueNo = data['Queue No. (Q)'] || data['คิวที่'] || data.queue || 'unknown';
  const storageKey = `queue_${queueNo}_${timestamp}`;

  // Save to localStorage
  localStorage.setItem(storageKey, JSON.stringify(data));
  console.log('💾 Saved to localStorage:', storageKey);

  // Also save to a generic 'last_queue' key for quick access
  localStorage.setItem('last_queue', JSON.stringify(data));
  localStorage.setItem('last_queue_timestamp', timestamp);

  console.log('✅ Data saved and localStorage proxy will sync to Google Sheets');
}

console.log('✅ Save Interceptor loaded - monitoring form submissions');
