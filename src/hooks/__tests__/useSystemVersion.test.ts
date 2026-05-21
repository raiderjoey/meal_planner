import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSystemVersion } from '../useSystemVersion';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn()
  }
}));

describe('useSystemVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches version on mount', async () => {
    const mockData = { current_version: '1.2.3' };
    const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle
        })
      })
    } as any);

    vi.mocked(supabase.channel).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    } as any);

    const { result } = renderHook(() => useSystemVersion());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.version).toBe('1.2.3');
    expect(supabase.from).toHaveBeenCalledWith('system_info');
  });

  it('handles fetch error', async () => {
    const error = new Error('Fetch failed');
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle
        })
      })
    } as any);

    vi.mocked(supabase.channel).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    } as any);

    const { result } = renderHook(() => useSystemVersion());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
  });

  it('subscribes to real-time updates', async () => {
    const mockData = { current_version: '1.2.3' };
    const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
    
    let callback: (payload: any) => void = () => {};
    const mockOn = vi.fn().mockImplementation((_event, _filter, cb) => {
      callback = cb;
      return { subscribe: vi.fn().mockReturnThis() };
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle
        })
      })
    } as any);

    vi.mocked(supabase.channel).mockReturnValue({
      on: mockOn
    } as any);

    const { result } = renderHook(() => useSystemVersion());

    await waitFor(() => {
      expect(result.current.version).toBe('1.2.3');
    });

    // Simulate real-time update
    await act(async () => {
      callback({ new: { current_version: '1.2.4' } });
    });

    expect(result.current.version).toBe('1.2.4');
  });

  it('unsubscribes on unmount', async () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    };
    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);
    
    const mockSingle = vi.fn().mockResolvedValue({ data: { current_version: '1.2.3' }, error: null });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle
        })
      })
    } as any);

    const { unmount } = renderHook(() => useSystemVersion());
    
    await waitFor(() => {
      expect(mockSingle).toHaveBeenCalled();
    });

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
