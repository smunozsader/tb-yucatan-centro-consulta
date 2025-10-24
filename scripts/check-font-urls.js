const urls = [
  'https://framework-gb.cdn.gob.mx/gm/v3/assets/fonts/icogobmx.woff2',
  'https://framework-gb.cdn.gob.mx/gm/v3/assets/fonts/icogobmx.woff',
  'https://framework-gb.cdn.gob.mx/gm/v3/assets/fonts/icogobmx.ttf',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.woff2',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.woff',
  'https://ceso-aphis-yuc.web.app/static/gobmx-font-fallback.css',
  'https://ceso-aphis-yuc.web.app/assets/fonts/icogobmx.woff',
  'https://ceso-aphis-yuc.web.app/assets/fonts/icogobmx.ttf',
  'https://ceso-aphis-yuc.web.app/assets/fonts/bootstrap-icons/bootstrap-icons.woff2'
];

(async () => {
  const results = [];
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      results.push({ url, ok: res.ok, status: res.status, contentType: res.headers.get('content-type') || null });
    } catch (err) {
      results.push({ url, ok: false, error: err.message });
    }
  }
  console.log(JSON.stringify(results, null, 2));
})();
