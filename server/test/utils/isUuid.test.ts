import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUuid } from '../../src/utils/isUuid';

test('isUuid accepts a valid UUID', () => {
  assert.equal(isUuid('00000000-0000-4000-8000-000000000101'), true);
});

test('isUuid rejects a numeric id', () => {
  assert.equal(isUuid('1'), false);
});

test('isUuid rejects a legacy mock id', () => {
  assert.equal(isUuid('u1'), false);
});

test('isUuid rejects an empty string', () => {
  assert.equal(isUuid(''), false);
});
