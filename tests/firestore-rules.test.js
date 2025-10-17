// Minimal unit tests for Firestore rules using @firebase/rules-unit-testing
const rules = require('fs').readFileSync('firestore.rules', 'utf8');
const { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } = require('@firebase/rules-unit-testing');

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: { rules }
  });

  try {
    // Unauthenticated client
    const unauth = testEnv.unauthenticatedContext();
    const unauthDb = unauth.firestore();

    // Attempt to create an agreement (should fail)
    await assertFails(unauthDb.collection('acuerdos-ceso').doc('test1').set({ foo: 'bar' }));

  // Authenticated user without claims
  // Note: the emulator mock token expects 'sub' (subject) instead of 'uid'
  const userCtx = testEnv.authenticatedContext('user1', { sub: 'user1', email: 'user@example.com' });
    const userDb = userCtx.firestore();

    // Should fail because no role claim
    await assertFails(userDb.collection('acuerdos-ceso').doc('test2').set({ foo: 'bar' }));

    // Authenticated user with 'RESPONSABLE' role
  const responsableCtx = testEnv.authenticatedContext('resp1', { sub: 'resp1', email: 'resp@example.com', role: 'RESPONSABLE' });
  const respDb = responsableCtx.firestore();

    // Should succeed
    await assertSucceeds(respDb.collection('acuerdos-ceso').doc('test3').set({ agreementNumber: 'YUC-TEST-1', description: 'prueba' }));

    console.log('Rules smoke tests passed');
  } finally {
    await testEnv.clearFirestore();
    await testEnv.cleanup();
  }
})();
