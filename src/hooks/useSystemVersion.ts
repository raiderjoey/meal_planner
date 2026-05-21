import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSystemVersion() {
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchVersion() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('system_info')
          .select('current_version')
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (mounted && data) {
          setVersion(data.current_version);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch system version'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchVersion();

    const channel = supabase
      .channel('system_info_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_info',
          filter: 'id=eq.1'
        },
        (payload) => {
          if (mounted && payload.new) {
            setVersion(payload.new.current_version);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { version, loading, error };
}
