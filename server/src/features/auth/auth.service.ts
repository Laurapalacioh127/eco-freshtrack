import Boom from '@hapi/boom';
import { isAuthRetryableFetchError, Session } from '@supabase/supabase-js';
import { createAuthClient, getSupabaseAdmin } from '../../config/supabase';
import { AuthSession, AuthUser, LoginDTO, RefreshDTO, RegisterDTO } from './auth.types';
import { createProfileRepository, findProfileByIdRepository } from './auth.repository';

const PG_UNIQUE_VIOLATION = '23505';

const EMAIL_TAKEN = 'El correo ya está registrado';
const MISSING_PROFILE = 'Tu cuenta no tiene un perfil en FreshTrack';
const AUTH_UNAVAILABLE = 'El servicio de autenticación no está disponible, intenta de nuevo';

const toSession = (user: AuthUser, session: Session | null): AuthSession => ({
  user,
  accessToken: session?.access_token ?? '',
  refreshToken: session?.refresh_token ?? '',
  expiresAt: session?.expires_at ?? null,
});

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === PG_UNIQUE_VIOLATION;

// A network failure talking to Supabase must not look like a bad token: a 401 would
// make the client drop a perfectly valid session.
const throwIfUnavailable = (error: unknown): void => {
  if (isAuthRetryableFetchError(error)) {
    throw Boom.badGateway(AUTH_UNAVAILABLE);
  }
};

const getProfileOrThrow = async (id: string): Promise<AuthUser> => {
  const profile = await findProfileByIdRepository(id);

  if (!profile) {
    throw Boom.forbidden(MISSING_PROFILE);
  }

  return profile;
};

export const registerService = async ({ email, password, name }: RegisterDTO): Promise<AuthSession> => {
  const { data, error } = await createAuthClient().auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    throwIfUnavailable(error);
    if (error.code === 'user_already_exists' || error.code === 'email_exists') {
      throw Boom.conflict(EMAIL_TAKEN);
    }
    if (error.code === 'weak_password') {
      throw Boom.badRequest('La contraseña es demasiado débil');
    }
    throw Boom.badRequest('No se pudo registrar el usuario');
  }

  // With email confirmation on, Supabase hides existing accounts by returning a
  // user without identities instead of an error.
  if (!data.user || data.user.identities?.length === 0) {
    throw Boom.conflict(EMAIL_TAKEN);
  }

  const authUserId = data.user.id;

  try {
    const profile = await createProfileRepository({ id: authUserId, email, name });
    return toSession(profile, data.session);
  } catch (profileError) {
    // Without a profile the account cannot log in; remove it so the email can be reused.
    await getSupabaseAdmin()
      .auth.admin.deleteUser(authUserId)
      .catch((cleanupError: unknown) => console.error('Could not delete orphan auth user', cleanupError));

    if (isUniqueViolation(profileError)) {
      throw Boom.conflict(EMAIL_TAKEN);
    }
    throw profileError;
  }
};

export const loginService = async ({ email, password }: LoginDTO): Promise<AuthSession> => {
  const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    throwIfUnavailable(error);
    if (error?.code === 'email_not_confirmed') {
      throw Boom.unauthorized('Confirma tu correo antes de iniciar sesión');
    }
    throw Boom.unauthorized('Correo o contraseña incorrectos');
  }

  return toSession(await getProfileOrThrow(data.user.id), data.session);
};

export const refreshService = async ({ refreshToken }: RefreshDTO): Promise<AuthSession> => {
  const { data, error } = await createAuthClient().auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session || !data.user) {
    throwIfUnavailable(error);
    throw Boom.unauthorized('Tu sesión expiró, inicia sesión de nuevo');
  }

  return toSession(await getProfileOrThrow(data.user.id), data.session);
};

// Used by authMiddleware: validates the access token against Supabase and loads the
// profile (and therefore the role) from public.users.
export const getUserFromTokenService = async (token: string): Promise<AuthUser> => {
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);

  if (error || !data.user) {
    throwIfUnavailable(error);
    throw Boom.unauthorized('Token inválido o expirado');
  }

  return getProfileOrThrow(data.user.id);
};
