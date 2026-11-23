import assert from 'node:assert/strict';
import { before, mock, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import { authHeader, mockAuthModules } from '../helpers/auth';

mockAuthModules();

const ID = '00000000-0000-4000-8000-000000000601';
const user = { id: ID, name: 'Ana', email: 'a@x.co', role: 'household', points: 10, kgSaved: 2.4 };
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

test('GET /api/users/:id returns kgSaved as the number 2.4', async () => {
  const res = await request(app).get(`/api/users/${ID}`).set(authHeader('admin'));

  assert.strictEqual(res.body.kgSaved, 2.4);
});

test('GET /api/users/:id returns 404 for a non-UUID id', async () => {
  const res = await request(app).get('/api/users/u1').set(authHeader('admin'));

  assert.equal(res.status, 404);
  assert.equal(res.body.message, 'User not found');
});
