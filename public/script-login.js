// ===== Login Form Handler =====
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const roleButtons = document.querySelectorAll('.role-btn');
  let selectedRole = 'shipper';

  // Role Button Selection
  roleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();

      // Remove active class from all buttons
      roleButtons.forEach(btn => btn.classList.remove('role-btn-active'));

      // Add active class to clicked button
      this.classList.add('role-btn-active');

      // Store selected role
      selectedRole = this.getAttribute('data-role');
      console.log('Selected role:', selectedRole);
    });
  });

  // Form Submission
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Simple validation
    if (!email || !password) {
      alert('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (!email.includes('@')) {
      alert('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    // Log login info
    console.log('Login attempt:', {
      email: email,
      password: '***',
      role: selectedRole,
      rememberMe: rememberMe
    });

    // Simulate login
    showLoginMessage('กำลังเข้าสู่ระบบ...', 'processing');

    setTimeout(() => {
      // Simulate successful login
      if (email === 'demo@company.com') {
        showLoginMessage('เข้าสู่ระบบสำเร็จ! 🎉', 'success');

        // Store session
        sessionStorage.setItem('user', JSON.stringify({
          email: email,
          role: selectedRole,
          rememberMe: rememberMe
        }));

        // Redirect to dashboard
        setTimeout(() => {
          // Store user info
          localStorage.setItem('currentUser', JSON.stringify({
            email: email,
            role: selectedRole,
            loginTime: new Date().toISOString()
          }));

          // Redirect to dashboard (create if doesn't exist)
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        showLoginMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
      }
    }, 1500);
  });

  // Show login message
  function showLoginMessage(message, type) {
    const btn = document.querySelector('.login-btn');
    const originalText = btn.textContent;
    btn.textContent = message;
    btn.style.opacity = '0.7';
    btn.disabled = true;

    if (type === 'error') {
      btn.style.background = '#ef4444';
    } else if (type === 'success') {
      btn.style.background = '#10b981';
    }

    // Reset after 2 seconds (on error) or keep for success
    if (type === 'error') {
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.opacity = '1';
        btn.style.background = '';
        btn.disabled = false;
      }, 2000);
    }
  }

  // Remember me functionality
  const rememberMeCheckbox = document.getElementById('rememberMe');
  const emailInput = document.getElementById('email');

  // Load saved email if remembered
  window.addEventListener('load', function() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      emailInput.value = savedEmail;
      rememberMeCheckbox.checked = true;
    }
  });

  // Save email on remember
  rememberMeCheckbox.addEventListener('change', function() {
    if (this.checked) {
      localStorage.setItem('rememberedEmail', emailInput.value);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  });

  // Auto-save email on input if remember is checked
  emailInput.addEventListener('change', function() {
    if (rememberMeCheckbox.checked) {
      localStorage.setItem('rememberedEmail', this.value);
    }
  });
});
