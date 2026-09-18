import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readConfig } from '../config';
import { WindowLimiter } from '../rate-limit';

test('hosting defaults bind production publicly and keep development local', () => {
  assert.equal(readConfig({}).host, '127.0.0.1');
  assert.equal(readConfig({ NODE_ENV: 'production' }).host, '0.0.0.0');
  assert.equal(readConfig({ NODE_ENV: 'production', HOST: '127.0.0.1' }).host, '127.0.0.1');
  assert.equal(readConfig({}).trustProxyHops, 0);
});

test('invalid hosting and budget settings fail at startup', () => {
  for (const env of [{ PORT: 'NaN' }, { MODEL_RATE_LIMIT: '0' }, { TRUST_PROXY_HOPS: '-1' }]) {
    assert.throws(() => readConfig(env));
  }
});

test('rate limits isolate clients, expire, and bound memory', () => {
  const limiter = new WindowLimiter(2, 1000, 2);
  assert.equal(limiter.consume('a', 0).allowed, true);
  assert.equal(limiter.consume('a', 0).allowed, true);
  assert.equal(limiter.consume('a', 0).allowed, false);
  assert.equal(limiter.consume('b', 0).allowed, true);
  assert.equal(limiter.consume('c', 0).allowed, false);
  assert.equal(limiter.consume('c', 1000).allowed, true);
  assert.equal(limiter.consume('a', 1000).allowed, true);
});
