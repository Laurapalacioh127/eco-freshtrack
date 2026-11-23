import './config.env-fixture';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as config from '../../src/config';

test('DB_HOST is read from the environment', () => {
  assert.equal(config.DB_HOST, 'db.test');
});

test('DB_PORT is parsed as a number', () => {
  assert.equal(config.DB_PORT, 5432);
});

test('DB_NAME falls back to postgres when empty', () => {
  assert.equal(config.DB_NAME, 'postgres');
});

test('SUPABASE_URL is read from the environment', () => {
  assert.equal(config.SUPABASE_URL, 'https://x.supabase.co');
});

test('SUPABASE_SECRET_KEY defaults to an empty string', () => {
  assert.equal(config.SUPABASE_SECRET_KEY, '');
});

test('NODE_ENV is test', () => {
  assert.equal(config.NODE_ENV, 'test');
});
