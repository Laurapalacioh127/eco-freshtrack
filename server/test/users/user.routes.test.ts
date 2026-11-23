import assert from 'node:assert/strict';
import { before, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, mockAuthModules } from '../helpers/auth';

mockAuthModules();

const ID = '00000000-0000-4000-8000-000000000601';
const user = { id: ID, name: 'Ana', email: 'a@x.co', role: 'household' };
const findAllUsersRepository = mock.fn(async () => [user]);
const findUserByIdRepository = mock.fn(async () => user);

mock.module('../../src/features/users/user.repository', {
  namedExports: { findAllUsersRepository, findUserByIdRepository },
});

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

test('GET /api/users/:id returns the user as id, name, email and role', async () => {
  const res = await request(app).get(`/api/users/${ID}`).set(authHeader('admin'));

  assert.deepEqual(res.body, { id: ID, name: 'Ana', email: 'a@x.co', role: 'household' });
});

test('GET /api/users/me returns exactly id, name, email and role', async () => {
  const res = await request(app).get('/api/users/me').set(authHeader('household'));

  assert.deepEqual(res.body, { id: ID, name: 'Ana', email: 'a@x.co', role: 'household' });
});

test('GET /api/users/:id returns 404 for a non-UUID id', async () => {
  const res = await request(app).get('/api/users/u1').set(authHeader('admin'));

  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'User not found');
});
