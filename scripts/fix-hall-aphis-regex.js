const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'hall-aphis.html');
console.log('Editing file:', filePath);

let content = fs.readFileSync(filePath, 'utf8');

// Replace any character class that ends with -\u036f (possibly with a stray non-printable first char)
// e.g. "[<strange>-\u036f]" -> "[\u0300-\u036f]"
const classPattern = /\[[^\]]*\\u036f\]/g;
if (!classPattern.test(content)) {
  console.log('No matching character classes ending with \\u036f found. No changes applied.');
  process.exit(0);
}

const newContent = content.replace(classPattern, '[\\u0300-\\u036f]');
if (newContent === content) {
  console.log('Content unchanged after replacement.');
  process.exit(0);
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Replacements applied. Please review hall-aphis.html to confirm.');
