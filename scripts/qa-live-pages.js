const puppeteer = require('puppeteer');

const urls = [
  'https://ceso-aphis-yuc.web.app/batch-upload-aphis',
  'https://ceso-aphis-yuc.web.app/batch-upload-ceso'
];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = [];

  for (const url of urls) {
    const page = await browser.newPage();
    const logs = [];
    page.on('console', msg => {
      try {
        logs.push({ type: msg.type(), text: msg.text() });
      } catch (e) {
        logs.push({ type: 'unknown', text: String(msg) });
      }
    });
    page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }));

    let res = { url, status: 'unknown', headerPresent: false, footerPresent: false, console: [] };
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      res.status = response && response.status();

      // wait a short time for the gob.mx script to inject header/footer
      await page.waitForTimeout(1200);

      // Check for header/footer elements
      res.headerPresent = await page.evaluate(() => !!document.querySelector('header'));
      res.footerPresent = await page.evaluate(() => !!document.querySelector('footer'));

      // Also check for the presence of the gobmx runtime script tag
      res.gobmxScript = await page.evaluate(() => !!document.querySelector('script[src*="gobmx.js"]'));

    } catch (err) {
      res.error = err.message;
    }

    // collect console logs
    res.console = logs.slice(0, 200);
    results.push(res);
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
})();