const fs = require('fs');
const path = require('path');

const files = ['index.html', 'dashboard.html', 'portal.html', 'reset-password.html'];
const snippet = `
<script>
  // Disable Ctrl, Shift, F12 and Right Click to prevent inspection
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.shiftKey || e.key === 'F12' || e.keyCode === 123) {
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
    if (!content.includes('e.ctrlKey || e.shiftKey')) {
      content = content.replace(/<\/body>/i, snippet);
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + file);
    } else {
      console.log('Already updated ' + file);
    }
  }
});
