import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { api, ApiError, resetUnauthorizedGuard, setUnauthorizedHandler } from "@/lib/api";

export type AuthUser = {
  id: string;
  name?: string | null;
  role?: string | null;
  email?: string | null;
  active?: boolean;
  [key: string]: unknown;
};

export type AuthSession = {
  user_id: string;
  role: string;
  tenant_id: string | null;
};

export type AuthTenant = {
  id: string;
  name?: string;
};

type AuthPayload = {
  user: AuthUser;
  session: AuthSession;
  tenants: AuthTenant[];
  needsTenant?: boolean;
  mustChangePassword?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  session: AuthSession | null;
  tenants: AuthTenant[];
  loading: boolean;
  needsTenant: boolean;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthPayload>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setTenant: (tenantId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applyPayload(
  payload: AuthPayload,
  setters: {
    setUser: (u: AuthUser | null) => void;
    setSession: (s: AuthSession | null) => void;
    setTenants: (t: AuthTenant[]) => void;
    setNeedsTenant: (v: boolean) => void;
    setMustChangePassword: (v: boolean) => void;
  },
) {
  setters.setUser(payload.user);
  setters.setSession(payload.session);
  setters.setTenants(payload.tenants ?? []);
  setters.setNeedsTenant(Boolean(payload.needsTenant || !payload.session?.tenant_id));
  setters.setMustChangePassword(Boolean(payload.mustChangePassword));
}

function clearAuthState(setters: {
  setUser: (u: AuthUser | null) => void;
  setSession: (s: AuthSession | null) => void;
  setTenants: (t: AuthTenant[]) => void;
  setNeedsTenant: (v: boolean) => void;
  setMustChangePassword: (v: boolean) => void;
}) {
  setters.setUser(null);
  setters.setSession(null);
  setters.setTenants([]);
  setters.setNeedsTenant(false);
  setters.setMustChangePassword(false);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [tenants, setTenants] = useState<AuthTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsTenant, setNeedsTenant] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const setters = useMemo(
    () => ({ setUser, setSession, setTenants, setNeedsTenant, setMustChangePassword }),
    [],
  );

  const refreshSession = useCallback(async () => {
    try {
      const data = await api.get<AuthPayload & { status: string }>("/a/auth/session");
      applyPayload(data, setters);
      resetUnauthorizedGuard();
    } catch (err) {
      clearAuthState(setters);
      if (!(err instanceof ApiError && err.status === 401)) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [setters]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthState(setters);
      setLoading(false);
      toast.info("Session expired. Please sign in again.");
    });
    return () => setUnauthorizedHandler(null);
  }, [setters]);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await api.post<AuthPayload & { status: string }>("/a/auth/login", {
        username,
        password,
      });
      applyPayload(data, setters);
      resetUnauthorizedGuard();
      setLoading(false);
      return data;
    },
    [setters],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/a/auth/logout");
    } catch {
      // still clear local session
    }
    clearAuthState(setters);
    toast.success("Logged out successfully");
  }, [setters]);

  const setTenant = useCallback(
    async (tenantId: string) => {
      const data = await api.post<AuthPayload & { status: string }>("/a/auth/tenant", {
        tenant_id: tenantId,
      });
      applyPayload(data, setters);
      resetUnauthorizedGuard();
    },
    [setters],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      tenants,
      loading,
      needsTenant,
      mustChangePassword,
      isAuthenticated: Boolean(user && session),
      login,
      logout,
      refreshSession,
      setTenant,
    }),
    [
      user,
      session,
      tenants,
      loading,
      needsTenant,
      mustChangePassword,
      login,
      logout,
      refreshSession,
      setTenant,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function getUserInitials(user: AuthUser | null | undefined) {
  if (!user) return "?";
  const source = (user.name || user.id || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
