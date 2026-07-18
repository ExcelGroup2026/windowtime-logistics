// ===== Dashboard Handler =====
document.addEventListener('DOMContentLoaded', function() {
  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('currentUser'));

  // If no user logged in, redirect to login
  if (!userInfo) {
    alert('กรุณาเข้าสู่ระบบก่อน');
    window.location.href = 'index.html';
    return;
  }

  // Display user info
  displayUserInfo(userInfo);

  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Setup action buttons
  const actionBtns = document.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.textContent;
      alert('ทำการดำเนินการ: ' + action + '\n\nฟีเจอร์นี้จะมาในเร็วๆ นี้');
    });
  });
});

// Display user information
function displayUserInfo(userInfo) {
  const userNameEl = document.getElementById('userName');
  const userEmailEl = document.getElementById('userEmail');
  const userRoleEl = document.getElementById('userRole');
  const loginTimeEl = document.getElementById('loginTime');

  if (userNameEl) {
    const email = userInfo.email || 'ผู้ใช้';
    const name = email.split('@')[0];
    userNameEl.textContent = 'ยินดีต้อนรับ ' + name;
  }

  if (userEmailEl) {
    userEmailEl.textContent = userInfo.email || '-';
  }

  if (userRoleEl) {
    const roleLabels = {
      'shipper': 'ผู้จัดส่ง (Shipper)',
      'receiver': 'ผู้รับสินค้า (Receiver)',
      'admin': 'คนบริหาร (Admin)',
      'supplier': 'Supplier'
    };
    userRoleEl.textContent = roleLabels[userInfo.role] || userInfo.role;
  }

  if (loginTimeEl) {
    const loginDate = new Date(userInfo.loginTime);
    const timeStr = loginDate.toLocaleTimeString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    loginTimeEl.textContent = timeStr;
  }

  console.log('User logged in:', userInfo);
}

// Logout function
function logout() {
  const confirm = window.confirm('คุณแน่ใจหรือว่าต้องการออกจากระบบ?');
  if (confirm) {
    // Clear user info
    localStorage.removeItem('currentUser');
    sessionStorage.clear();

    // Redirect to login
    alert('ออกจากระบบสำเร็จ');
    window.location.href = 'index.html';
  }
}
