import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { SettingsCard } from '@/components/SettingsCard/SettingsCard';

test('SettingsCard shows title and description', () => {
  render(<SettingsCard title="Alertas" description="Configura los avisos de vencimiento." />);

  expect(screen.getByRole('heading', { name: 'Alertas' })).toBeInTheDocument();
  expect(screen.getByText('Configura los avisos de vencimiento.')).toBeInTheDocument();
});

test('SettingsCard renders no button', () => {
  render(<SettingsCard title="Alertas" description="Configura los avisos de vencimiento." />);

  expect(screen.queryAllByRole('button')).toHaveLength(0);
});
