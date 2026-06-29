const fs = require('fs');
const path = require('path');

const files = ['index.html', 'dashboard.html', 'portal.html', 'reset-password.html'];
const snippet = `
<script>
  // Disable Ctrl, Shift shortcuts (F12, Ctrl+Shift+I/C/J, Ctrl+U) and Right Click to prevent inspection
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j' || e.keyCode === 73 || e.keyCode === 67 || e.keyCode === 74)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
  
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  }, true);
</script>
</body>`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove old key blocker script if present
    content = content.replace(/<script>[\s\S]*?Disable Ctrl, Shift, F12[\s\S]*?<\/script>/i, '');
    
    // Inject the new one
    if (!content.includes('e.ctrlKey && e.shiftKey && (e.key ===')) {
      content = content.replace(/<\/body>/i, snippet);
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + file);
    } else {
      console.log('Already updated ' + file);
    }
  }
});
