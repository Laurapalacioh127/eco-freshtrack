import assert from 'node:assert/strict';
import { before, beforeEach, test } from 'node:test';
import request from 'supertest';
import type { Express } from 'express';
import {
  createProfileRepository,
  deleteUser,
  findProfileByIdRepository,
  HOUSEHOLD,
  mockAuthModules,
  NO_PROFILE_ID,
  refreshSession,
  signInWithPassword,
  signUp,
} from '../helpers/auth';

mockAuthModules();

let app: Express;
before(async () => {
  const mod = await import('../../src/app.js');
  app = ((mod.default as unknown as { default?: Express }).default ?? mod.default) as Express;
});

const session = { access_token: 'access-1', refresh_token: 'refresh-1', expires_at: 1900000000 };
const authUser = { id: HOUSEHOLD.id, email: HOUSEHOLD.email, identities: [{ id: 'identity-1' }] };
const validRegister = { email: 'Hogar@X.co ', password: 'secret123', name: ' Hogar ' };

beforeEach(() => {
  for (const fn of [signUp, signInWithPassword, refreshSession, createProfileRepository, deleteUser]) {
    fn.mock.resetCalls();
  }
  signUp.mock.mockImplementation(async () => ({ data: { user: authUser, session }, error: null }));
  signInWithPassword.mock.mockImplementation(async () => ({ data: { user: authUser, session }, error: null }));
  refreshSession.mock.mockImplementation(async () => ({ data: { user: authUser, session }, error: null }));
  createProfileRepository.mock.mockImplementation(async () => HOUSEHOLD);
});

test('POST /api/auth/register returns 201 with the session and the household profile', async () => {
  const res = await request(app).post('/api/auth/register').send(validRegister);

  assert.equal(res.status, 201);
  assert.deepEqual(res.body, {
    user: HOUSEHOLD, accessToken: 'access-1', refreshToken: 'refresh-1', expiresAt: 1900000000,
  });
});

test('POST /api/auth/register creates the profile with the Supabase user id and normalized input', async () => {
  await request(app).post('/api/auth/register').send(validRegister);

  assert.deepEqual(createProfileRepository.mock.calls[0].arguments, [
    { id: HOUSEHOLD.id, email: 'hogar@x.co', name: 'Hogar' },
  ]);
});

test('POST /api/auth/register returns empty tokens when email confirmation is on', async () => {
  signUp.mock.mockImplementation(async () => ({ data: { user: authUser, session: null }, error: null }));

  const res = await request(app).post('/api/auth/register').send(validRegister);

  assert.deepEqual(
    { status: res.status, accessToken: res.body.accessToken, refreshToken: res.body.refreshToken },
    { status: 201, accessToken: '', refreshToken: '' },
  );
});

test('POST /api/auth/register returns 409 when Supabase hides an existing account', async () => {
  signUp.mock.mockImplementation(async () => ({
    data: { user: { ...authUser, identities: [] }, session: null }, error: null,
  }));

  const res = await request(app).post('/api/auth/register').send(validRegister);

  assert.equal(res.status, 409);
});

test('POST /api/auth/register returns 409 when Supabase reports the user exists', async () => {
  signUp.mock.mockImplementation(async () => ({
    data: { user: null, session: null }, error: { message: 'User already registered', code: 'user_already_exists' },
  }));

  const res = await request(app).post('/api/auth/register').send(validRegister);

  assert.equal(res.status, 409);
});

test('POST /api/auth/register deletes the auth user when the profile insert fails', async () => {
  createProfileRepository.mock.mockImplementation(async () => {
    throw Object.assign(new Error('duplicate key'), { code: '23505' });
  });

  const res = await request(app).post('/api/auth/register').send(validRegister);

  assert.deepEqual(
    { status: res.status, deleted: deleteUser.mock.calls[0]?.arguments },
    { status: 409, deleted: [HOUSEHOLD.id] },
  );
});

test('POST /api/auth/register returns 400 for a password shorter than 6 characters', async () => {
  const res = await request(app).post('/api/auth/register').send({ ...validRegister, password: '12345' });

  assert.equal(res.status, 400);
});

test('POST /api/auth/register returns 400 for an invalid email', async () => {
  const res = await request(app).post('/api/auth/register').send({ ...validRegister, email: 'no-at-sign' });

  assert.equal(res.status, 400);
});

test('POST /api/auth/register returns 400 when the name is blank', async () => {
  const res = await request(app).post('/api/auth/register').send({ ...validRegister, name: '   ' });

  assert.equal(res.status, 400);
});

test('POST /api/auth/register does not call Supabase when validation fails', async () => {
  await request(app).post('/api/auth/register').send({});

  assert.equal(signUp.mock.callCount(), 0);
});

test('POST /api/auth/login returns the session for valid credentials', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'hogar@x.co', password: 'secret123' });

  assert.deepEqual(res.body, {
    user: HOUSEHOLD, accessToken: 'access-1', refreshToken: 'refresh-1', expiresAt: 1900000000,
  });
});

test('POST /api/auth/login returns 401 for wrong credentials', async () => {
  signInWithPassword.mock.mockImplementation(async () => ({
    data: { user: null, session: null }, error: { message: 'Invalid login credentials', code: 'invalid_credentials' },
  }));

  const res = await request(app).post('/api/auth/login').send({ email: 'hogar@x.co', password: 'wrong-pass' });

  assert.equal(res.status, 401);
});

test('POST /api/auth/login returns 403 when the account has no profile', async () => {
  signInWithPassword.mock.mockImplementation(async () => ({
    data: { user: { id: NO_PROFILE_ID }, session }, error: null,
  }));

  const res = await request(app).post('/api/auth/login').send({ email: 'x@x.co', password: 'secret123' });

  assert.equal(res.status, 403);
});

test('POST /api/auth/login returns 400 without a password', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'hogar@x.co' });

  assert.equal(res.status, 400);
});

test('POST /api/auth/refresh returns a new session for a valid refresh token', async () => {
  const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'refresh-0' });

  assert.equal(res.body.accessToken, 'access-1');
});

test('POST /api/auth/refresh sends the refresh token to Supabase', async () => {
  await request(app).post('/api/auth/refresh').send({ refreshToken: 'refresh-0' });

  assert.deepEqual(refreshSession.mock.calls[0].arguments, [{ refresh_token: 'refresh-0' }]);
});

test('POST /api/auth/refresh returns 401 for an invalid refresh token', async () => {
  refreshSession.mock.mockImplementation(async () => ({
    data: { user: null, session: null }, error: { message: 'Invalid Refresh Token', code: 'refresh_token_not_found' },
  }));

  const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'stale' });

  assert.equal(res.status, 401);
});

test('POST /api/auth/refresh returns 400 without a refresh token', async () => {
  const res = await request(app).post('/api/auth/refresh').send({});

  assert.equal(res.status, 400);
});

test('auth routes are public: login does not require an Authorization header', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'hogar@x.co', password: 'secret123' });

  assert.equal(res.status, 200);
});

test('the profile lookup uses the id returned by Supabase, not anything from the body', async () => {
  findProfileByIdRepository.mock.resetCalls();

  await request(app).post('/api/auth/login').send({ email: 'hogar@x.co', password: 'secret123', id: 'evil' });

  assert.deepEqual(findProfileByIdRepository.mock.calls[0].arguments, [HOUSEHOLD.id]);
});
