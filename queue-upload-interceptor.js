// ============================================
// Queue Upload Interceptor - Hijack existing upload button
// ============================================

console.log('🔗 Queue Upload Interceptor: Initializing...');

function initInterceptor() {
  // Find the upload button (อัพโหลดไฟล์จัดรถ)
  const uploadBtn = findUploadButton();

  if (uploadBtn) {
    console.log('✅ Found upload button:', uploadBtn.textContent);

    // Remove existing click handlers and replace with queue form
    uploadBtn.onclick = null;
    uploadBtn.removeEventListener('click', null);

    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openQueueModal();
    });

    console.log('✅ Upload button hijacked - now opens queue form');
  } else {
    console.warn('⚠️ Upload button not found yet, will retry...');
    setTimeout(initInterceptor, 1000);
  }

  // Create modal (if not exists)
  if (!document.getElementById('queue-upload-modal-overlay')) {
    createQueueModal();
  }
}

function findUploadButton() {
  // Search by text content
  const buttons = document.querySelectorAll('button, a, div[role="button"]');

  for (const btn of buttons) {
    const text = btn.textContent || btn.innerText || '';

    // Thai text match
    if (text.includes('อัพโหลดไฟล์จัดรถ') ||
        text.includes('อัพโหลด') ||
        text.includes('Upload')) {
      return btn;
    }
  }

  return null;
}

function createQueueModal() {
  const modalHTML = `
    <div id="queue-upload-modal-overlay" style="
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 99999;
      align-items: center;
      justify-content: center;
    ">
      <div id="queue-upload-modal-content" style="
        background: white;
        width: 95%;
        height: 95%;
        max-width: 1200px;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          border-bottom: 2px solid #f0f0f0;
          background: linear-gradient(135deg, #2f7cf6 0%, #1e5ace 100%);
        ">
          <h1 style="
            margin: 0;
            font-size: 24px;
            color: white;
            font-weight: 600;
          ">
            📝 บันทึก Queue Data
          </h1>
          <button id="queue-upload-close" style="
            background: rgba(255,255,255,0.2);
            border: none;
            font-size: 32px;
            cursor: pointer;
            color: white;
            padding: 0;
            width: 50px;
            height: 50px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            ✕
          </button>
        </div>
        <iframe id="queue-upload-iframe" style="
          flex: 1;
          border: none;
          width: 100%;
          height: 100%;
        "></iframe>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Close handlers
  document.getElementById('queue-upload-close').addEventListener('click', closeQueueModal);
  document.getElementById('queue-upload-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'queue-upload-modal-overlay') {
      closeQueueModal();
    }
  });

  console.log('✅ Queue modal created');
}

function openQueueModal() {
  const overlay = document.getElementById('queue-upload-modal-overlay');
  const iframe = document.getElementById('queue-upload-iframe');

  if (overlay && iframe) {
    iframe.src = 'queue-input.html';
    overlay.style.display = 'flex';
    console.log('📂 Queue form opened in modal');
  }
}

function closeQueueModal() {
  const overlay = document.getElementById('queue-upload-modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    console.log('📂 Queue modal closed');
  }
}

// Initialize immediately
try {
  initInterceptor();
} catch (e) {
  console.error('❌ Init error:', e.message);
}

// Retry after a delay
setTimeout(initInterceptor, 1000);
