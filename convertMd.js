const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'description.md');
const htmlPath = path.join(__dirname, 'description.html');

const markdown = fs.readFileSync(mdPath, 'utf8');

function simpleMdToHtml(md) {
  const lines = md.split(/\n/);
  const htmlLines = [];
  let inList = false;
  for (let line of lines) {
    if (line.startsWith('# ')) {
      htmlLines.push('<h1>' + line.substring(2).trim() + '</h1>');
    } else if (line.startsWith('## ')) {
      htmlLines.push('<h2>' + line.substring(3).trim() + '</h2>');
    } else if (line.startsWith('### ')) {
      htmlLines.push('<h3>' + line.substring(4).trim() + '</h3>');
    } else if (line.startsWith('- ')) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      htmlLines.push('<li>' + line.substring(2).trim() + '</li>');
    } else if (line.trim() === '') {
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }
    } else {
      htmlLines.push('<p>' + line.trim() + '</p>');
    }
  }
  if (inList) {
    htmlLines.push('</ul>');
  }
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>Project Description</title>\n</head>\n<body>\n' + htmlLines.join('\n') + '\n</body>\n</html>\n';
}

const html = simpleMdToHtml(markdown);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Converted description.md to description.html');
