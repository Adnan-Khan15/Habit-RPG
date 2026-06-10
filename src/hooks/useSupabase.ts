import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export function useSupabase() {
  const { setSession, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ? { access_token: session.access_token, refresh_token: session.refresh_token } : null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as Profile);
          });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ? { access_token: session.access_token, refresh_token: session.refresh_token } : null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as Profile);
          });
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setProfile, setLoading]);
}
