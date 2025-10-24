// check-repositorio-counts.js
// Visit Repositorio CESO and extract the category counts and repo list items
const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://ceso-aphis-yuc.web.app/repositorio-ceso.html';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);

  const result = { url, status: null, counts: {}, repoListText: null, console: [], errors: [] };
  page.on('console', msg => result.console.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => result.errors.push({ message: err.message }));

  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle2' });
    result.status = resp.status();

    // Wait for badges to render
    await page.waitForSelector('#count-actas-ceso, #count-formatos-ceso', { timeout: 10000 });

    // Extract badge counts
    result.counts = await page.evaluate(() => {
      const ids = ['count-actas-ceso','count-normativas-ceso','count-manuales-ceso','count-formatos-ceso','count-reportes-ceso','count-certificaciones-ceso'];
      const out = {};
      ids.forEach(id => {
        const el = document.getElementById(id);
        out[id] = el ? el.textContent.trim() : null;
      });
      return out;
    });

    // Extract repoList HTML text
    const repoListExists = await page.$('#repoList');
    if (repoListExists) {
      result.repoListText = await page.evaluate(() => document.getElementById('repoList').innerText.trim());
    }

  } catch (e) {
    result.errors.push({ message: e.message });
  } finally {
    await browser.close();
    console.log(JSON.stringify(result, null, 2));
  }
})();
