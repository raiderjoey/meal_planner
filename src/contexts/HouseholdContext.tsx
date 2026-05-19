import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Household, Profile } from '../types/database';

interface HouseholdContextType {
  household: Household | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const HouseholdProvider = ({ children }: { children: React.ReactNode }) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, households(*)')
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;
          
          if (profileData) {
            const { households, ...profileRest } = profileData;
            setProfile(profileRest as Profile);
            setHousehold(households as Household);
          }
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSession();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <HouseholdContext.Provider value={{ household, profile, loading, error }}>
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};
