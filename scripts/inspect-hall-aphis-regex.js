const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'hall-aphis.html');
const content = fs.readFileSync(filePath, 'utf8');

let idx = content.indexOf('\\u036f');
if (idx === -1) {
  console.log('No literal \\u036f found in file. Searching for Unicode U+036F char instead...');
  const u036f = String.fromCharCode(0x036f);
  idx = content.indexOf(u036f);
}

if (idx === -1) {
  console.log('No occurrences of \u036f or U+036F found. Searching for sequences "-\\u036f"');
  idx = content.indexOf('-\\u036f');
}

console.log('First match index:', idx);

let pos = 0;
while (pos !== -1) {
  pos = content.indexOf('\\u036f', pos);
  if (pos === -1) break;
  const start = Math.max(0, pos - 10);
  const end = Math.min(content.length, pos + 10);
  const snippet = content.slice(start, end);
  console.log('---');
  console.log('pos:', pos);
  console.log('snippet:', snippet.replace(/\n/g, '\\n'));
  // print char codes around match
  for (let i = start; i < end; i++) {
    const ch = content.charCodeAt(i);
    const repr = content[i] === '\n' ? '\\n' : (content[i] === '\r' ? '\\r' : content[i]);
    console.log(i, repr, ch.toString(16));
  }
  pos = pos + 1;
}

// Also search for the exact broken string shown earlier: "replace(/[\u0000-\u036f]/g, '')" where \u0000 might be represented literally
const brokenLiteral = "replace(/[\u0000-\\u036f]/g, '')";
if (content.includes(brokenLiteral)) {
  console.log('Found brokenLiteral exact match');
}

// Search for sequences 'replace(/[', and show what follows
let p = 0;
while ((p = content.indexOf("replace(/[", p)) !== -1) {
  const start = p;
  const end = Math.min(content.length, p + 40);
  console.log('Found replace(/[ at', p, ' snippet:', content.slice(start, end).replace(/\n/g, '\\n'));
  p = p + 9;
}

console.log('Done');
