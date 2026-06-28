const firebaseConfig = {
  apiKey:            "AIzaSyBPXWdCMkXUtubyOx5OGR6iPxcmqJDqex8",
  authDomain:        "codeminer.firebaseapp.com",
  projectId:         "codeminer",
  storageBucket:     "codeminer.firebasestorage.app",
  messagingSenderId: "904581344425",
  appId:             "1:904581344425:web:37ae619d7d8403957f8db8",
  measurementId:     "G-1P9T3KN8VJ"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const urlParams = new URLSearchParams(window.location.search);
const actionCode = urlParams.get('oobCode');
const mode = urlParams.get('mode');

const resetForm = document.getElementById('resetForm');
const newPasswordInput = document.getElementById('newPassword');
const messageBox = document.getElementById('messageBox');
const btnSubmit = document.getElementById('btnSubmit');

// Error Handling UI
function showMessage(text, type = 'error') {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type} visible`;
  setTimeout(() => {
    messageBox.className = 'message-box';
  }, 5000);
}

function setLoading(isLoading) {
  if (isLoading) {
    btnSubmit.classList.add('loading');
  } else {
    btnSubmit.classList.remove('loading');
  }
}

// Ensure the page was opened with a valid reset code
if (mode !== 'resetPassword' || !actionCode) {
  showMessage('Invalid or expired reset link. Please request a new one.');
  newPasswordInput.disabled = true;
  btnSubmit.disabled = true;
}

resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const newPassword = newPasswordInput.value;
  if (newPassword.length < 6) {
    showMessage('Password must be at least 6 characters long.');
    return;
  }
  
  setLoading(true);
  
  try {
    await auth.confirmPasswordReset(actionCode, newPassword);
    showMessage('Password has been reset successfully! Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    
  } catch (error) {
    let errorMsg = 'Failed to reset password. The link might have expired.';
    if (error.code === 'auth/weak-password') {
      errorMsg = 'The password is too weak.';
    }
    showMessage(errorMsg || error.message);
  } finally {
    setLoading(false);
  }
});
