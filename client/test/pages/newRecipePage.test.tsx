import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import NewRecipePage from '@/app/user/recipes/new/page';

const submitRecipe = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/providers/RecipesProvider', () => ({ useRecipes: () => ({ submitRecipe }) }));
vi.mock('@/providers/ToastProvider', () => ({ useToast: () => ({ showToast: vi.fn() }) }));

test('new recipe page has no cover photo dropzone', () => {
  render(<NewRecipePage />);

  expect(screen.queryByText(/agregar foto de portada/i)).not.toBeInTheDocument();
});

test('submitting the empty recipe form shows validation errors', async () => {
  const user = userEvent.setup();
  render(<NewRecipePage />);

  await user.click(screen.getByRole('button', { name: /publicar receta/i }));

  expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
});

test('submitting the empty recipe form does not call submitRecipe', async () => {
  const user = userEvent.setup();
  submitRecipe.mockClear();
  render(<NewRecipePage />);

  await user.click(screen.getByRole('button', { name: /publicar receta/i }));

  expect(submitRecipe).not.toHaveBeenCalled();
});
