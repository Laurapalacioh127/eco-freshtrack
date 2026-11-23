import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { CategorySelect } from '@/components/CategorySelect/CategorySelect';

test('lists the placeholder plus the nine categories', () => {
  render(<CategorySelect value="" onChange={vi.fn()} />);

  expect(screen.getAllByRole('option')).toHaveLength(10);
});

test('calls onChange with the chosen category', async () => {
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<CategorySelect value="" onChange={onChange} />);

  await user.selectOptions(screen.getByLabelText('Categoría'), 'Granos');

  expect(onChange).toHaveBeenCalledWith('Granos');
});

test('shows the error as an alert', () => {
  render(<CategorySelect value="" onChange={vi.fn()} error="Elige una categoría" />);

  expect(screen.getByRole('alert')).toHaveTextContent('Elige una categoría');
});

test('is disabled when disabled', () => {
  render(<CategorySelect value="" onChange={vi.fn()} disabled />);

  expect(screen.getByLabelText('Categoría')).toBeDisabled();
});
