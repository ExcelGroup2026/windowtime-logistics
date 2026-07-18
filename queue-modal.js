// ============================================
// Queue Modal - Add Upload Queue button to bundled app
// ============================================

console.log('🔲 Queue Modal: Initializing...');

// Wait for DOM to be ready
function initQueueModal() {
  // Create modal HTML
  const modalHTML = `
    <div id="queue-modal-overlay" style="
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
    ">
      <div id="queue-modal-content" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        width: 90%;
        max-width: 1000px;
        height: 90%;
        max-height: 800px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 10000;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #ddd;
          background: #f5f5f5;
        ">
          <h2 style="margin: 0; font-size: 20px; color: #333;">📝 Upload Queue Data</h2>
          <button id="queue-modal-close" style="
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #666;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
        <iframe id="queue-iframe" style="
          flex: 1;
          border: none;
          width: 100%;
          height: 100%;
        "></iframe>
      </div>
    </div>
  `;

  // Insert modal into page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Close button handler
  document.getElementById('queue-modal-close').addEventListener('click', () => {
    document.getElementById('queue-modal-overlay').style.display = 'none';
  });

  // Close modal when clicking overlay
  document.getElementById('queue-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'queue-modal-overlay') {
      document.getElementById('queue-modal-overlay').style.display = 'none';
    }
  });

  // Create Upload Queue button
  const uploadButton = document.createElement('button');
  uploadButton.id = 'queue-upload-btn';
  uploadButton.innerHTML = '📤 Upload Queue';
  uploadButton.style.cssText = `
    padding: 12px 24px;
    background: #2f7cf6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 9998;
    box-shadow: 0 2px 8px rgba(47, 124, 246, 0.3);
    transition: all 0.3s;
  `;

  uploadButton.addEventListener('mouseover', () => {
    uploadButton.style.background = '#1e5ace';
    uploadButton.style.boxShadow = '0 4px 12px rgba(47, 124, 246, 0.4)';
  });

  uploadButton.addEventListener('mouseout', () => {
    uploadButton.style.background = '#2f7cf6';
    uploadButton.style.boxShadow = '0 2px 8px rgba(47, 124, 246, 0.3)';
  });

  uploadButton.addEventListener('click', () => {
    // Load queue-input.html into iframe
    document.getElementById('queue-iframe').src = 'queue-input.html';
    document.getElementById('queue-modal-overlay').style.display = 'flex';
    console.log('📤 Opening queue upload modal');
  });

  document.body.appendChild(uploadButton);

  console.log('✅ Queue upload button added to bundled app');
  console.log('💡 Click "📤 Upload Queue" button to open form');
}

// Initialize immediately
if (document.body) {
  initQueueModal();
} else {
  // Wait for body if not ready
  document.addEventListener('DOMContentLoaded', initQueueModal);
  setTimeout(initQueueModal, 1000); // Fallback
}

// Also try to inject button into sidebar if available
setTimeout(() => {
  const sidebar = document.querySelector('[role="navigation"]') ||
                 document.querySelector('.sidebar') ||
                 document.querySelector('nav');

  if (sidebar && !document.getElementById('queue-upload-btn')) {
    const sidebarBtn = document.createElement('a');
    sidebarBtn.href = '#';
    sidebarBtn.innerHTML = '📤 Upload Queue';
    sidebarBtn.style.cssText = `
      display: block;
      padding: 12px 16px;
      color: #2f7cf6;
      text-decoration: none;
      border-radius: 4px;
      margin: 8px 0;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;

    sidebarBtn.addEventListener('mouseover', () => {
      sidebarBtn.style.background = '#f0f0f0';
    });

    sidebarBtn.addEventListener('mouseout', () => {
      sidebarBtn.style.background = 'transparent';
    });

    sidebarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('queue-iframe').src = 'queue-input.html';
      document.getElementById('queue-modal-overlay').style.display = 'flex';
    });

    sidebar.appendChild(sidebarBtn);
    console.log('✅ Queue button added to sidebar');
  }
}, 2000);
