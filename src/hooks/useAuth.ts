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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildFallbackProfile(user: User): Profile {
  const role = user.user_metadata?.role === 'doctor' ? 'doctor' : 'patient';
  const fullName =
    typeof user.user_metadata?.full_name === 'string' &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name
      : (user.email?.split('@')[0] ?? '');

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

async function fetchProfileOnce(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data as Profile | null;
}

async function fetchProfileWithRetry(user: User): Promise<Profile> {
  const profile = await fetchProfileOnce(user.id);
  if (profile) return profile;

  // One retry after 300ms (covers signup trigger delay)
  await wait(300);
  const retry = await fetchProfileOnce(user.id);
  return retry ?? buildFallbackProfile(user);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const syncUser = useCallback(async (authUser: User | null, requestId: number) => {
    setUser(authUser);

    if (!authUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const p = await fetchProfileWithRetry(authUser);
      if (requestIdRef.current !== requestId) return;
      setProfile(p);
    } catch {
      if (requestIdRef.current !== requestId) return;
      setProfile(buildFallbackProfile(authUser));
    } finally {
      if (requestIdRef.current !== requestId) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Restore session first
    const rid = ++requestIdRef.current;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      syncUser(session?.user ?? null, rid);
    }).catch(() => {
      if (!mounted) return;
      setLoading(false);
    });

    // 2. Listen for subsequent auth changes, skip INITIAL_SESSION
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'INITIAL_SESSION') return; // already handled by getSession
      const newRid = ++requestIdRef.current;
      syncUser(session?.user ?? null, newRid);
    });

    return () => {
      mounted = false;
      requestIdRef.current++;
      subscription.unsubscribe();
    };
  }, [syncUser]);

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
