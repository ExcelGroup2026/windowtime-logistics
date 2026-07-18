// ============================================
// Data Saver - Manual data capture and saving
// ============================================

console.log('[DATA-SAVER] Initializing data saver...');

window.dataSaver = {
  // Save queue data manually
  saveQueueData: function(data) {
    console.log('[DATA-SAVER] Saving queue data:', data);

    if (!data || typeof data !== 'object') {
      console.error('[DATA-SAVER] Invalid data format');
      return false;
    }

    try {
      const queueNo = data['Queue No. (Q)'] || data['คิวที่'] || data.queue || 'unknown_' + Date.now();
      const timestamp = new Date().toISOString();
      const key = `queue_${queueNo}_${timestamp}`;

      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem('last_queue', JSON.stringify(data));
      localStorage.setItem('last_queue_timestamp', timestamp);

      console.log('[DATA-SAVER] ✅ Saved to localStorage:', key);
      return true;
    } catch (error) {
      console.error('[DATA-SAVER] Error saving data:', error);
      return false;
    }
  },

  // Extract data from form or UI elements
  extractDataFromUI: function(containerSelector) {
    console.log('[DATA-SAVER] Extracting data from UI:', containerSelector);

    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn('[DATA-SAVER] Container not found:', containerSelector);
      return null;
    }

    const data = {};

    // Extract from all input elements
    const inputs = container.querySelectorAll('input, textarea, select');
    inputs.forEach(inp => {
      if (inp.value && inp.value.trim()) {
        const key = inp.name || inp.id || inp.placeholder || inp.getAttribute('data-field') || inp.getAttribute('aria-label');
        if (key) {
          data[key] = inp.value;
        }
      }
    });

    console.log('[DATA-SAVER] Extracted data:', data);
    return Object.keys(data).length > 0 ? data : null;
  },

  // Create and show a save button overlay
  createSaveButton: function(options = {}) {
    const defaults = {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      text: '💾 Save to Sheets',
      containerSelector: 'body',
      onSave: null
    };

    const config = { ...defaults, ...options };

    // Create button
    const btn = document.createElement('button');
    btn.id = 'data-saver-btn';
    btn.textContent = config.text;
    btn.style.cssText = `
      position: ${config.position};
      bottom: ${config.bottom};
      right: ${config.right};
      padding: 12px 16px;
      background: #2f7cf6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      z-index: 99999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: all 0.2s;
    `;

    btn.onmouseover = () => {
      btn.style.background = '#1e5bb8';
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    };

    btn.onmouseout = () => {
      btn.style.background = '#2f7cf6';
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    };

    btn.onclick = () => {
      console.log('[DATA-SAVER] Save button clicked');

      // Extract data from page
      const data = window.dataSaver.extractDataFromUI(config.containerSelector);

      if (!data) {
        console.warn('[DATA-SAVER] No data found to save');
        alert('ไม่มีข้อมูลให้บันทึก');
        return;
      }

      // Save data
      const success = window.dataSaver.saveQueueData(data);

      if (success) {
        // Show success message
        const origText = btn.textContent;
        btn.textContent = '✅ Saved!';
        btn.style.background = '#4caf50';

        setTimeout(() => {
          btn.textContent = origText;
          btn.style.background = '#2f7cf6';
        }, 2000);

        // Call callback if provided
        if (config.onSave) {
          config.onSave(data);
        }

        console.log('[DATA-SAVER] ✅ Data saved successfully');
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    };

    document.body.appendChild(btn);
    console.log('[DATA-SAVER] Save button created');
    return btn;
  },

  // Monitor for input changes and auto-save
  autoSave: function(containerSelector, debounceMs = 5000) {
    console.log('[DATA-SAVER] Setting up auto-save for:', containerSelector);

    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn('[DATA-SAVER] Container not found for auto-save:', containerSelector);
      return;
    }

    let saveTimeout;

    const handleChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const data = window.dataSaver.extractDataFromUI(containerSelector);
        if (data) {
          console.log('[DATA-SAVER] Auto-saving...');
          window.dataSaver.saveQueueData(data);
        }
      }, debounceMs);
    };

    // Monitor input changes
    container.addEventListener('change', handleChange, true);
    container.addEventListener('input', handleChange, true);

    console.log('[DATA-SAVER] Auto-save enabled');
  }
};

console.log('[DATA-SAVER] ✅ Data Saver ready');
console.log('[DATA-SAVER] Usage: window.dataSaver.createSaveButton() or window.dataSaver.autoSave()');
