const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/text-pink-100\/40/g, 'text-pink-100/70');
      content = content.replace(/text-pink-100\/50/g, 'text-pink-100/80');
      content = content.replace(/text-pink-100\/60/g, 'text-pink-100/90');
      content = content.replace(/text-pink-100\/70/g, 'text-pink-100');
      
      content = content.replace(/text-pink-200\/50/g, 'text-pink-200/80');
      
      content = content.replace(/text-pink-300\/30/g, 'text-pink-300/60');
      content = content.replace(/text-pink-300\/40/g, 'text-pink-300/70');
      content = content.replace(/text-pink-300\/50/g, 'text-pink-300/80');
      
      content = content.replace(/text-purple-400\/20/g, 'text-purple-400/60');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Updated ' + fullPath);
    }
  }
}

processDir(dir);
