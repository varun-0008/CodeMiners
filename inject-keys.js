const fs = require('fs');
const path = require('path');

const files = ['index.html', 'dashboard.html', 'portal.html', 'reset-password.html'];

const replacementText = `  // Disable Ctrl, Shift shortcuts (F12, Ctrl+Shift+I/C/J, Ctrl+U) and Right Click to prevent inspection
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
  }, true);`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /\/\/\s*Disable Ctrl,\s*Shift,\s*F12 and Right Click to prevent inspection[\s\S]*?},\s*true\);/;
    if (regex.test(content)) {
      content = content.replace(regex, replacementText);
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + file);
    } else {
      console.log('Target block not found or already updated in ' + file);
    }
  }
});
