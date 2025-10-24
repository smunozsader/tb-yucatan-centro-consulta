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
    const failedRequests = [];

    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }));
    page.on('requestfailed', req => failedRequests.push({ url: req.url(), reason: req.failure() && req.failure().errorText }));

    let res = { url, status: 'unknown', headerPresent: false, footerPresent: false, gobmxScript: false, console: [], failedRequests: [] };
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      res.status = response && response.status();

      // Wait up to 5s for header/footer to appear (gob.mx injects them)
      try {
        await page.waitForSelector('header', { timeout: 5000 });
        res.headerPresent = true;
      } catch (e) {
        res.headerPresent = false;
      }

      try {
        await page.waitForSelector('footer', { timeout: 5000 });
        res.footerPresent = true;
      } catch (e) {
        res.footerPresent = false;
      }

      // Check for gobmx runtime tag
      res.gobmxScript = await page.evaluate(() => !!document.querySelector('script[src*="gobmx.js"]'));

    } catch (err) {
      res.error = err.message;
    }

    // collect logs and failed requests
    res.console = logs.slice(0, 500);
    res.failedRequests = failedRequests;
    results.push(res);
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
})();