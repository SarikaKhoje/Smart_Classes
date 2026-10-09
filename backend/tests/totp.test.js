import test from 'node:test';
import assert from 'node:assert/strict';
import { createTotpProvisioningUri, generateTotpSecret, verifyTotpCode } from '../utils/totp.js';

test('verifies RFC 6238 SHA-1 TOTP codes and rejects code replay', () => {
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  const code = '287082';
  const verifiedStep = verifyTotpCode(secret, code, { now: 59_000 });

  assert.equal(verifiedStep, 1);
  assert.equal(verifyTotpCode(secret, code, { now: 59_000, afterStep: verifiedStep }), null);
});

test('generates authenticator-compatible enrollment secrets and URIs', () => {
  const secret = generateTotpSecret();
  assert.match(secret, /^[A-Z2-7]{32}$/);
  assert.match(
    createTotpProvisioningUri(secret, 'teacher@example.com'),
    /^otpauth:\/\/totp\/Kashvi%20SmartClass%3Ateacher%40example\.com\?/
  );
});
