const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.TEST_URL || 'https://ceso-aphis-yuc.web.app/hall-ceso.html';
  console.log('Running smoke test against', url);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true });
  const page = await browser.newPage();
  // Use a common Chrome UA to avoid simplistic bot blocking
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36');
  page.setDefaultNavigationTimeout(30000);

  // Optionally inject a mock gobmxAuth before any script runs so the page thinks
  // it's authenticated. This helps with smoke testing against protected pages.
  if (process.env.MOCK_AUTH === '1' || process.env.MOCK_AUTH === 'true') {
    await page.evaluateOnNewDocument(() => {
      window.gobmxAuth = {
        getCurrentUser: () => ({
          correo: 'test@ceso.example',
          nombre: 'Usuario de Prueba',
          email: 'test@ceso.example',
          uid: 'test-uid',
          sessionId: 'session-test',
          organization: 'CESO'
        }),
        cesoUsers: [
          { correo: 'test@ceso.example', nombre: 'Usuario de Prueba' }
        ],
        logout: () => {}
      };
      // Provide a minimal console to avoid missing-console issues
      window.console = window.console || { log: () => {}, error: () => {}, warn: () => {} };
    });
  }

  // Optionally inject a fake Firestore implementation to provide deterministic
  // agreements data for the smoke test. This avoids needing real Firestore
  // credentials and lets us assert UI behavior reliably.
  if (process.env.MOCK_FAKE_FIRESTORE === '1' || process.env.MOCK_FAKE_FIRESTORE === 'true') {
    await page.evaluateOnNewDocument(() => {
      // Sample agreement documents
      const sampleDocs = [
        {
          id: 'doc-pendiente',
          data: {
            agreementNumber: 'CESO-001',
            description: 'Acuerdo pendiente de prueba',
            responsible: 'test@ceso.example',
            status: 'Pendiente',
            complianceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: 'doc-completado',
          data: {
            agreementNumber: 'CESO-002',
            description: 'Acuerdo completado de prueba',
            responsible: 'other@ceso.example',
            status: 'Completado',
            complianceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      const makeSnapshot = (docs) => ({
        size: docs.length,
        empty: docs.length === 0,
        forEach: (cb) => docs.forEach(d => cb({ id: d.id, data: () => d.data }))
      });

      window.firebase = window.firebase || {};
      window.firebase.firestore = function() {
        return {
          collection: function(name) {
            return {
              limit: function() { return this; },
              orderBy: function() { return this; },
              get: async function() {
                if (name === 'acuerdos-ceso') {
                  return makeSnapshot(sampleDocs.map(d => ({ id: d.id, data: () => d.data })));
                }
                // default empty
                return makeSnapshot([]);
              },
              doc: function(id) {
                return {
                  get: async function() {
                    const found = sampleDocs.find(d => d.id === id) || { data: () => null };
                    return { exists: !!found, data: () => (found.data ? found.data() : null) };
                  },
                  collection: function(sub) {
                    return {
                      orderBy: function() { return this; },
                      get: async function() { return makeSnapshot([]); }
                    };
                  }
                };
              }
            };
          }
        };
      };
    });
  }

  try {
    // Retry once on transient socket errors
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
    } catch (e) {
      console.warn('First navigation attempt failed, retrying once:', e.message);
      await new Promise(r => setTimeout(r, 1000));
      await page.goto(url, { waitUntil: 'networkidle2' });
    }

    // Wait for the main stats elements to show numeric values (not 'Cargando...' or empty)
    await page.waitForSelector('#totalAgreements', { timeout: 15000 });
    await page.waitForSelector('#pendingAgreements', { timeout: 15000 });

    // Wait until the text contains at least one digit
    await page.waitForFunction(() => {
      const t = document.getElementById('totalAgreements');
      const p = document.getElementById('pendingAgreements');
      if (!t || !p) return false;
      return /\d/.test(t.textContent) && /\d/.test(p.textContent);
    }, { timeout: 20000 });

    const stats = await page.evaluate(() => {
      const getNum = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const txt = el.textContent.trim();
        const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
        return isNaN(num) ? null : num;
      };

      return {
        total: getNum('totalAgreements'),
        pending: getNum('pendingAgreements')
      };
    });

    console.log('Stats found:', stats);

    if (stats.total === null || stats.pending === null) {
      throw new Error('Total or Pending counts missing or non-numeric');
    }

    // Execute showAgreementsByStatus('Pendiente') in page context
    await page.evaluate(() => {
      if (typeof showAgreementsByStatus === 'function') {
        showAgreementsByStatus('Pendiente');
      } else if (typeof window.showAgreementsByStatus === 'function') {
        window.showAgreementsByStatus('Pendiente');
      } else {
        throw new Error('showAgreementsByStatus function not found on page');
      }
    });

    // Wait for modal to appear and list to load
    await page.waitForSelector('#agreementsModal.show', { timeout: 10000 });
    await page.waitForSelector('#agreementsList .list-group-item', { timeout: 15000 });

    // Ensure no 'Completado' badges are present in the Pendiente modal
    const completedBadges = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('#agreementsList .badge'));
      return badges.map(b => b.textContent.trim()).filter(t => /completado|cumplido|finalizado/i.test(t));
    });

    if (completedBadges.length > 0) {
      throw new Error(`Found ${completedBadges.length} completed-like badges in Pendiente list: ${completedBadges.join(', ')}`);
    }

    console.log('Modal Pendiente check passed (no completed badges found)');

    // Close browser and exit success
    await browser.close();
    console.log('SMOKE TEST: PASS');
    process.exit(0);
  } catch (err) {
    console.error('SMOKE TEST: FAIL', err.message);
    await browser.close();
    process.exit(2);
  }
})();
