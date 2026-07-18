// ============================================
// Initialize Save UI for bundled app
// ============================================

console.log('[INIT-SAVE-UI] Starting...');

// Wait for app to be loaded
function initializeSaveUI() {
  console.log('[INIT-SAVE-UI] Initializing save UI...');

  // Try to find app container
  const appContainer = document.querySelector('[role="main"]') ||
                       document.querySelector('main') ||
                       document.querySelector('.app') ||
                       document.querySelector('#app') ||
                       document.body;

  console.log('[INIT-SAVE-UI] App container found:', appContainer ? 'YES' : 'NO');

  // Create save button
  if (window.dataSaver && typeof window.dataSaver.createSaveButton === 'function') {
    console.log('[INIT-SAVE-UI] Creating save button...');

    window.dataSaver.createSaveButton({
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      text: '💾 Save to Google Sheets',
      containerSelector: 'body',
      onSave: function(data) {
        console.log('[INIT-SAVE-UI] Data saved successfully:', data);
      }
    });

    console.log('[INIT-SAVE-UI] ✅ Save button created');
  } else {
    console.error('[INIT-SAVE-UI] dataSaver not available');
  }

  // Also create a monitoring button to show what data would be captured
  createMonitorButton();
}

function createMonitorButton() {
  const btn = document.createElement('button');
  btn.textContent = '📊 Show Data';
  btn.style.cssText = `
    position: fixed;
    bottom: 140px;
    right: 20px;
    padding: 10px 14px;
    background: #666;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    z-index: 99998;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `;

  btn.onclick = () => {
    const data = window.dataSaver.extractDataFromUI('body');
    if (data) {
      console.log('[INIT-SAVE-UI] Captured data:', data);
      alert('Captured data:\n' + JSON.stringify(data, null, 2));
    } else {
      console.warn('[INIT-SAVE-UI] No data captured');
      alert('No data found to capture');
    }
  };

  document.body.appendChild(btn);
  console.log('[INIT-SAVE-UI] Monitor button created');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSaveUI);
} else {
  // DOM already loaded
  setTimeout(initializeSaveUI, 100);
}

// Also initialize after a delay to catch dynamic content
setTimeout(initializeSaveUI, 2000);

console.log('[INIT-SAVE-UI] ✅ Ready');
