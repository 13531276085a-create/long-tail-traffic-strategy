// Reusable social card renderer — minimal, no Google Fonts, system fonts only.
// Usage: node render-card.js <task-dir>
// Expects: <task-dir>/index.html with .page elements (1080x1440 each)

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const taskDir = process.argv[2] || '.';
const htmlPath = path.join(taskDir, 'index.html');
const outDir = path.join(taskDir, 'output');

if (!fs.existsSync(htmlPath)) {
  console.error('No index.html found in', taskDir);
  process.exit(1);
}
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const pageCount = (html.match(/class="page"/g) || []).length;
  if (pageCount === 0) {
    // Single page — screenshot the whole body
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const pg = await browser.newPage();
  await pg.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 1 });
  await pg.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));

  const els = await pg.$$('.page');

  if (els.length > 0) {
    for (let i = 0; i < els.length; i++) {
      const name = `page-${String(i + 1).padStart(2, '0')}.png`;
      await els[i].screenshot({ path: path.join(outDir, name), type: 'png' });
      console.log(`OK: ${name}`);
    }
  } else {
    // No .page elements — screenshot entire body
    await pg.screenshot({ path: path.join(outDir, 'output.png'), type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1440 } });
    console.log('OK: output.png');
  }

  await browser.close();
  console.log(`Done. ${Math.max(els.length, 1)} page(s) → ${outDir}`);
})();
