const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'packages/common/services/mockData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Use regex to add summa property based on narx
content = content.replace(/narx: '(\d+)'/g, "narx: '$1', summa: $1");

fs.writeFileSync(filePath, content);
console.log('Updated mockData.ts');
