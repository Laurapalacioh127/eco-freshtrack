import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { RecipeReviewPanel } from '@/components/RecipeReviewPanel/RecipeReviewPanel';
import type { Recipe } from '@/types';

const recipe = {
  id: 'r1', title: 'Sopa', author: 'Ana', minutes: 30, difficulty: 'Fácil', servings: 2,
  ingredientsAvailable: 2, ingredientsTotal: 2, status: 'pending', ingredients: ['Papa'], steps: ['Hervir'],
} as Recipe;

test('shows Aprobando and disables approve while approving', () => {
  render(<RecipeReviewPanel recipe={recipe} onApprove={vi.fn()} onReject={vi.fn()} pendingDecision="approved" />);

  expect(screen.getByRole('button', { name: 'Aprobando…' })).toBeDisabled();
});

test('disables the reject button while approving', () => {
  render(<RecipeReviewPanel recipe={recipe} onApprove={vi.fn()} onReject={vi.fn()} pendingDecision="approved" />);

  expect(screen.getByRole('button', { name: 'Rechazar con observaciones' })).toBeDisabled();
});

test('shows Rechazando while rejecting', () => {
  render(<RecipeReviewPanel recipe={recipe} onApprove={vi.fn()} onReject={vi.fn()} pendingDecision="rejected" />);

  expect(screen.getByRole('button', { name: 'Rechazando…' })).toHaveAttribute('aria-busy', 'true');
});

test('calls onApprove once when nothing is pending', async () => {
  const onApprove = vi.fn();
  const user = userEvent.setup();
  render(<RecipeReviewPanel recipe={recipe} onApprove={onApprove} onReject={vi.fn()} pendingDecision={null} />);

  await user.click(screen.getByRole('button', { name: 'Aprobar receta ✓' }));

  expect(onApprove).toHaveBeenCalledTimes(1);
});
