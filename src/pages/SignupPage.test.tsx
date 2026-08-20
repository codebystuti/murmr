import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import type { User } from '@/types';
import SignupPage from './SignupPage';

vi.mock('@/lib/api', () => {
  const resolvedUser: User = {
    id: 'u-new',
    name: 'Test User',
    email: 'user@example.com',
    role: 'user',
    joinedAt: new Date().toISOString(),
    postCount: 0,
    upvoteCount: 0,
    commentCount: 0,
  };
  return {
    authApi: {
      signup: vi.fn().mockResolvedValue(resolvedUser),
      login: vi.fn(),
    },
  };
});

function renderSignup() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  );
}

describe('SignupPage — form validation', () => {
  it('shows a validation error when email is empty on submit', async () => {
    renderSignup();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    });
  });

  it('shows a validation error for an invalid email format', async () => {
    renderSignup();
    await userEvent.type(screen.getByPlaceholderText('Maya Chen'), 'Test User');
    // fireEvent.change bypasses jsdom's per-keystroke email-input sanitization
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'not-an-email' } });
    await userEvent.type(screen.getByPlaceholderText('Min. 8 characters'), 'ValidPass1!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    });
  });

  it('shows a validation error when the password is below the minimum length', async () => {
    renderSignup();
    await userEvent.type(screen.getByPlaceholderText('Maya Chen'), 'Test User');
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('Min. 8 characters'), 'short');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('shows no validation errors when all inputs are valid', async () => {
    renderSignup();
    await userEvent.type(screen.getByPlaceholderText('Maya Chen'), 'Test User');
    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('Min. 8 characters'), 'StrongPass1!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    // Zod validated successfully — no field-level error messages should appear
    await waitFor(() => {
      expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
      expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument();
      expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument();
    });
  });
});
