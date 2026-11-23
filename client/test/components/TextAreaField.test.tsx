import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { TextAreaField } from '@/components/TextAreaField/TextAreaField';

const props = { label: 'Pasos', placeholder: 'Escribe', value: '', onChange: vi.fn() };

test('shows the error with role alert', () => {
  render(<TextAreaField {...props} error="Escribe al menos un paso" />);

  expect(screen.getByRole('alert')).toHaveTextContent('Escribe al menos un paso');
});

test('marks the textarea invalid when there is an error', () => {
  render(<TextAreaField {...props} error="Mal" />);

  expect(screen.getByLabelText(/Pasos/)).toHaveAttribute('aria-invalid', 'true');
});

test('is not invalid without an error', () => {
  render(<TextAreaField {...props} />);

  expect(screen.getByLabelText(/Pasos/)).toHaveAttribute('aria-invalid', 'false');
});

test('can be disabled', () => {
  render(<TextAreaField {...props} disabled />);

  expect(screen.getByLabelText(/Pasos/)).toBeDisabled();
});
