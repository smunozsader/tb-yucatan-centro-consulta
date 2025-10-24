// check-repositorio-visual.js
// Tiny Puppeteer script to visit the live Repositorio CESO page and extract visible file entries

const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://ceso-aphis-yuc.web.app/repositorio-ceso.html';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);

  const results = { url, status: null, foundText: [], console: [], errors: [] };

  page.on('console', msg => results.console.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => results.errors.push({ message: err.message }));

  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle2' });
    results.status = resp.status();

    // Wait for the category view or list to render
    await page.waitForSelector('#categoryView, #repoList, .list-group', { timeout: 10000 });

    // Extract document titles / filenames visible in the page
    const items = await page.evaluate(() => {
      const texts = [];
      document.querySelectorAll('.list-group-item').forEach(li => {
        texts.push(li.innerText.trim());
      });
      return texts;
    });

    results.foundText = items;
  } catch (e) {
    results.errors.push({ message: e.message });
  } finally {
    await browser.close();
    console.log(JSON.stringify(results, null, 2));
  }
})();
