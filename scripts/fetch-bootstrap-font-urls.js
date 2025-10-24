(async () => {
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');
    const txt = await res.text();
    const urls = Array.from(txt.matchAll(/url\(([^)]+)\)/g)).map(m => m[1].replace(/['"]+/g, ''));
    console.log(JSON.stringify({ ok: res.ok, status: res.status, urls }, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
