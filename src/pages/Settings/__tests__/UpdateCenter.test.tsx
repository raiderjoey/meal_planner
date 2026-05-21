import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UpdateCenter from '../UpdateCenter';
import * as HouseholdContext from '../../../contexts/HouseholdContext';
import * as SystemVersionHook from '../../../hooks/useSystemVersion';
import * as SupabaseLib from '../../../lib/supabase';

// Mock HouseholdContext
vi.mock('../../../contexts/HouseholdContext', () => ({
  useHousehold: vi.fn(),
}));

// Mock useSystemVersion
vi.mock('../../../hooks/useSystemVersion', () => ({
  useSystemVersion: vi.fn(),
}));

// Mock Supabase Lib
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: { current_version: '0.1.0' }, error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    })),
  },
  checkForUpdates: vi.fn(),
  applyUpdate: vi.fn(),
  getLatestUpdateStatus: vi.fn(),
}));

describe('UpdateCenter Page', () => {
  const mockAdminProfile = { id: 'user-1', role: 'admin' };
  const mockMemberProfile = { id: 'user-2', role: 'member' };

  beforeEach(() => {
    vi.clearAllMocks();
    (SupabaseLib.getLatestUpdateStatus as any).mockResolvedValue(null);
    (SystemVersionHook.useSystemVersion as any).mockReturnValue({
      version: '0.1.0',
      loading: false,
      error: null,
    });
  });

  it('renders current version and check button', async () => {
    (HouseholdContext.useHousehold as any).mockReturnValue({
      profile: mockMemberProfile,
      loading: false,
    });

    render(<UpdateCenter />);

    await waitFor(() => {
      expect(screen.getByText('0.1.0')).toBeInTheDocument();
    });

    expect(screen.getByText('Check for Updates')).toBeInTheDocument();
  });

  it('shows Apply Update button for admins when update is available', async () => {
    (HouseholdContext.useHousehold as any).mockReturnValue({
      profile: mockAdminProfile,
      loading: false,
    });

    (SupabaseLib.checkForUpdates as any).mockResolvedValue({
      currentVersion: '0.1.0',
      latestVersion: '0.2.0',
      updateAvailable: true,
    });

    render(<UpdateCenter />);

    const checkButton = screen.getByText('Check for Updates');
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText('0.2.0')).toBeInTheDocument();
      expect(screen.getByText('Apply Update 0.2.0')).toBeInTheDocument();
    });
  });

  it('does NOT show Apply Update button for members even if update is available', async () => {
    (HouseholdContext.useHousehold as any).mockReturnValue({
      profile: mockMemberProfile,
      loading: false,
    });

    (SupabaseLib.checkForUpdates as any).mockResolvedValue({
      currentVersion: '0.1.0',
      latestVersion: '0.2.0',
      updateAvailable: true,
    });

    render(<UpdateCenter />);

    const checkButton = screen.getByText('Check for Updates');
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText('0.2.0')).toBeInTheDocument();
      expect(screen.queryByText('Apply Update 0.2.0')).not.toBeInTheDocument();
      expect(screen.getByText(/Please contact an administrator to apply it/i)).toBeInTheDocument();
    });
  });

  it('calls applyUpdate when admin clicks the button', async () => {
    (HouseholdContext.useHousehold as any).mockReturnValue({
      profile: mockAdminProfile,
      loading: false,
    });

    (SupabaseLib.checkForUpdates as any).mockResolvedValue({
      currentVersion: '0.1.0',
      latestVersion: '0.2.0',
      updateAvailable: true,
    });

    render(<UpdateCenter />);

    fireEvent.click(screen.getByText('Check for Updates'));

    await waitFor(() => {
      expect(screen.getByText('Apply Update 0.2.0')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Update 0.2.0'));

    expect(SupabaseLib.applyUpdate).toHaveBeenCalledWith('0.2.0', 'user-1');
  });

  it('displays latest update status if available', async () => {
    (HouseholdContext.useHousehold as any).mockReturnValue({
      profile: mockAdminProfile,
      loading: false,
    });

    const mockUpdate = {
      id: 'update-1',
      target_version: '0.2.0',
      status: 'in_progress',
      created_at: new Date().toISOString(),
      log_output: 'Starting update...',
    };

    (SupabaseLib.getLatestUpdateStatus as any).mockResolvedValue(mockUpdate);

    render(<UpdateCenter />);

    await waitFor(() => {
      expect(screen.getByText('Latest Update Status')).toBeInTheDocument();
      expect(screen.getByText('in progress')).toBeInTheDocument();
      expect(screen.getByText('Target: 0.2.0')).toBeInTheDocument();
      expect(screen.getByText('Starting update...')).toBeInTheDocument();
    });
  });
});
