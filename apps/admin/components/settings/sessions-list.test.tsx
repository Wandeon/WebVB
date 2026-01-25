import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SessionsList } from './sessions-list';

const listSessionsMock = vi.fn();
const revokeSessionMock = vi.fn();
const revokeOtherSessionsMock = vi.fn();
const useSessionMock = vi.fn();

vi.mock('@/lib/auth-client', () => ({
  listSessions: () => listSessionsMock() as unknown,
  revokeSession: (payload: { token: string }) =>
    revokeSessionMock(payload) as unknown,
  revokeOtherSessions: () => revokeOtherSessionsMock() as unknown,
  useSession: () => useSessionMock() as unknown,
}));

describe('SessionsList', () => {
  it('renders current session and labels revocation actions for other sessions', async () => {
    useSessionMock.mockReturnValue({
      data: { session: { token: 'current-token' } },
    });
    listSessionsMock.mockResolvedValue({
      data: [
        {
          token: 'current-token',
          createdAt: new Date().toISOString(),
          expiresAt: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        {
          token: 'other-token',
          createdAt: new Date().toISOString(),
          expiresAt: new Date().toISOString(),
          ipAddress: '10.0.0.1',
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        },
      ],
    });

    render(<SessionsList />);

    await waitFor(() => {
      expect(screen.getByText('Trenutna sesija')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Opozovi sesiju za Safari')
    ).toBeInTheDocument();
  });
});
