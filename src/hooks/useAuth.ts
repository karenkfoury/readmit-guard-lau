import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  role: 'patient' | 'doctor';
  full_name: string;
  email: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
}

const PROFILE_RETRY_DELAYS = [0, 150, 400, 800];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildFallbackProfile(user: User): Profile {
  const role = user.user_metadata?.role === 'doctor' ? 'doctor' : 'patient';
  const fullName = typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim().length > 0
    ? user.user_metadata.full_name
    : user.email?.split('@')[0] ?? '';

  return {
    id: user.id,
    role,
    full_name: fullName,
    email: user.email ?? '',
    date_of_birth: null,
    gender: null,
    phone: null,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchProfile = useCallback(async (authUser: User): Promise<Profile> => {
    const fallbackProfile = buildFallbackProfile(authUser);

    for (const delay of PROFILE_RETRY_DELAYS) {
      if (delay > 0) {
        await wait(delay);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (data) {
        return data as Profile;
      }

      if (error && error.code !== 'PGRST116') {
        console.warn('Unable to load profile during auth sync', error.message);
      }
    }

    return fallbackProfile;
  }, []);

  const syncAuthState = useCallback((nextUser: User | null) => {
    const requestId = ++requestIdRef.current;

    setUser(nextUser);

    if (!nextUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    void fetchProfile(nextUser)
      .then((nextProfile) => {
        if (requestId !== requestIdRef.current) return;
        setProfile(nextProfile);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setProfile(buildFallbackProfile(nextUser));
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, [fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = (nextUser: User | null) => {
      if (!isMounted) return;
      syncAuthState(nextUser);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session?.user ?? null);
    });

    void supabase.auth.getSession()
      .then(({ data: { session } }) => {
        handleAuthChange(session?.user ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
      requestIdRef.current += 1;
      subscription.unsubscribe();
    };
  }, [syncAuthState]);

  const signUp = async (email: string, password: string, fullName: string, role: 'patient' | 'doctor') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signUp, signIn, signOut };
}
