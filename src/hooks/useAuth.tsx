import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  loading: true,
  session: null,
  user: null,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    supabase
      .rpc("has_role", { _user_id: uid, _role: "admin" })
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(data === true);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      isAdmin,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, session, isAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
