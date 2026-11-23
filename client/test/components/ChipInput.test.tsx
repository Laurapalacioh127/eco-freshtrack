import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import { ChipInput } from '@/components/ChipInput/ChipInput';

const Harness = ({ initial = [], disabled = false }: { initial?: string[]; disabled?: boolean }) => {
  const [values, setValues] = useState<string[]>(initial);
  return <ChipInput label="Ingredientes" placeholder="Ej. Papa" values={values} onChange={setValues} disabled={disabled} />;
};

test('adds a chip when pressing Enter without submitting the surrounding form', async () => {
  const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
  const user = userEvent.setup();
  render(<form onSubmit={onSubmit}><Harness /></form>);

  await user.type(screen.getByLabelText('Ingredientes'), 'Papa{Enter}');

  expect(screen.getByText('Papa')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

test('adds a chip when clicking Agregar', async () => {
  const user = userEvent.setup();
  render(<Harness />);

  await user.type(screen.getByLabelText('Ingredientes'), 'Cebolla');
  await user.click(screen.getByRole('button', { name: 'Agregar' }));

  expect(screen.getByText('Cebolla')).toBeInTheDocument();
});

test('clears the input after adding a chip', async () => {
  const user = userEvent.setup();
  render(<Harness />);

  await user.type(screen.getByLabelText('Ingredientes'), 'Papa{Enter}');

  expect(screen.getByLabelText('Ingredientes')).toHaveValue('');
});

test('ignores a blank value', async () => {
  const user = userEvent.setup();
  render(<Harness />);

  await user.type(screen.getByLabelText('Ingredientes'), '   {Enter}');

  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

test('ignores a case-insensitive duplicate', async () => {
  const user = userEvent.setup();
  render(<Harness initial={['Papa']} />);

  await user.type(screen.getByLabelText('Ingredientes'), 'papa{Enter}');

  expect(screen.getAllByRole('listitem')).toHaveLength(1);
});

test('removes a chip with its Quitar button', async () => {
  const user = userEvent.setup();
  render(<Harness initial={['Papa', 'Sal']} />);

  await user.click(screen.getByRole('button', { name: 'Quitar Papa' }));

  expect(screen.queryByText('Papa')).not.toBeInTheDocument();
});

test('disables the input and the buttons when disabled', () => {
  render(<Harness initial={['Papa']} disabled />);

  expect(screen.getByLabelText('Ingredientes')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Quitar Papa' })).toBeDisabled();
});

test('does not add chips beyond maxItems', async () => {
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<ChipInput label="M" placeholder="p" values={['a']} onChange={onChange} maxItems={1} />);

  await user.type(screen.getByLabelText('M'), 'b{Enter}');

  expect(onChange).not.toHaveBeenCalled();
});

test('shows the error as an alert', () => {
  render(<ChipInput label="L" placeholder="p" values={[]} onChange={vi.fn()} error="Falta algo" />);

  expect(screen.getByRole('alert')).toHaveTextContent('Falta algo');
});
