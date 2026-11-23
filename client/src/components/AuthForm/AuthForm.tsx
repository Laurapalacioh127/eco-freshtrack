'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Portal } from '@/types';
import { portalTheme } from '@/utils/portalTheme';
import { consumeSessionExpired, homePathFor, roleForPortal } from '@/utils/authStorage';
import {
  AuthFormErrors,
  AuthFormValues,
  MIN_PASSWORD_LENGTH,
  validateLogin,
  validateRegister,
} from '@/utils/authValidation';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { SESSION_EXPIRED_ERROR } from '@/providers/AxiosProvider';
import { AuthInput } from '@/components/AuthInput/AuthInput';

type Mode = 'login' | 'register';

const emptyValues: AuthFormValues = { name: '', email: '', password: '', confirm: '' };

const wrongPortalMessage: Record<Portal, string> = {
  user: 'Esta es una cuenta del equipo: ingresa por el portal de operaciones.',
  admin: 'Esta cuenta no tiene acceso al portal de operaciones.',
};

export const AuthForm = ({ portal }: { portal: Portal }) => {
  const router = useRouter();
  const { user, isReady, login, register, logout } = useAuth();
  const { showToast } = useToast();
  const theme = portalTheme[portal];
  const expectedRole = roleForPortal(portal);
  // Self-registration always creates a household account, so only the user portal offers it.
  const canRegister = portal === 'user';

  const [mode, setMode] = useState<Mode>('login');
  const [values, setValues] = useState<AuthFormValues>(emptyValues);
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Already signed in to this portal: skip the form.
  useEffect(() => {
    if (isReady && user?.role === expectedRole) {
      router.replace(homePathFor(portal));
    }
  }, [isReady, user, expectedRole, portal, router]);

  // Forced logout by the axios interceptor: explain why the user is back here.
  useEffect(() => {
    if (consumeSessionExpired()) showToast(SESSION_EXPIRED_ERROR, 'info');
  }, [showToast]);

  const setField = (field: keyof AuthFormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setValues((prev) => ({ ...prev, password: '', confirm: '' }));
  };

  const handleLogin = async () => {
    const signedIn = await login(values.email, values.password);

    if (signedIn.role !== expectedRole) {
      logout();
      showToast(wrongPortalMessage[portal], 'error');
      return;
    }

    showToast('Sesión iniciada', 'success');
    router.replace(homePathFor(portal));
  };

  const handleRegister = async () => {
    const result = await register({ name: values.name, email: values.email, password: values.password });

    if (result.needsConfirmation) {
      showToast('Te enviamos un correo para confirmar tu cuenta. Luego inicia sesión.', 'success');
      switchMode('login');
      return;
    }

    showToast('¡Tu cuenta está lista!', 'success');
    router.replace(homePathFor(portal));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const found = mode === 'login' ? validateLogin(values) : validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await (mode === 'login' ? handleLogin() : handleRegister());
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const tabClass = (tab: Mode) =>
    `flex-1 rounded-full py-2 text-xs font-semibold ${mode === tab ? 'bg-white shadow-sm' : 'text-neutral-500'}`;

  const submitLabel = submitting
    ? mode === 'login'
      ? 'Ingresando…'
      : 'Creando cuenta…'
    : mode === 'login'
      ? 'Iniciar sesión →'
      : 'Crear cuenta →';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-sm flex-col gap-4">
      {canRegister && (
        <div className="flex rounded-full bg-black/5 p-1">
          <button type="button" onClick={() => switchMode('login')} className={tabClass('login')}>
            Iniciar sesión
          </button>
          <button type="button" onClick={() => switchMode('register')} className={tabClass('register')}>
            Registrarme
          </button>
        </div>
      )}

      {mode === 'register' && (
        <AuthInput
          label="Nombre completo"
          placeholder="Valentina Ríos"
          autoComplete="name"
          value={values.name}
          onChange={setField('name')}
          error={errors.name}
          disabled={submitting}
        />
      )}
      <AuthInput
        label="Correo electrónico"
        type="email"
        placeholder="nombre@correo.com"
        autoComplete="email"
        value={values.email}
        onChange={setField('email')}
        error={errors.email}
        disabled={submitting}
      />
      <AuthInput
        label="Contraseña"
        type="password"
        placeholder={mode === 'register' ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres` : 'Tu contraseña'}
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        value={values.password}
        onChange={setField('password')}
        error={errors.password}
        disabled={submitting}
      />
      {mode === 'register' && (
        <AuthInput
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          value={values.confirm}
          onChange={setField('confirm')}
          error={errors.confirm}
          disabled={submitting}
        />
      )}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className={`rounded-lg py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 ${theme.submit}`}
      >
        {submitLabel}
      </button>

      {canRegister ? (
        <p className="text-center text-xs text-neutral-600">
          {mode === 'login' ? '¿Aún no tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className={`font-semibold ${theme.link}`}
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      ) : (
        <p className="rounded-lg bg-ops-soft px-3 py-2 text-xs">
          Las cuentas del equipo las crea un administrador de FreshTrack.
        </p>
      )}
    </form>
  );
};
