import React, { createContext, useContext, useEffect, useState } from 'react';
import { logoutUser, getSessionUser } from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'inkspace_token'; // legacy key, scrubbed on boot
const USER_KEY  = 'inkspace_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /*
   * The session JWT lives in an httpOnly cookie (the server sets it on login),
   * so page scripts never hold the token. On boot: scrub any token left by
   * older builds and, when there's no cached user, try to hydrate the session
   * from the cookie.
   */
  useEffect(() => {
    localStorage.removeItem(TOKEN_KEY);
    if (user) return;
    let cancelled = false;
    getSessionUser().then((fetched) => {
      if (!cancelled && fetched) {
        localStorage.setItem(USER_KEY, JSON.stringify(fetched));
        setUser(fetched);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on boot
  }, []);

  /**
   * Call this after a successful login.
   * The token argument is kept for backwards compatibility with callers —
   * the actual session is the httpOnly cookie set by the server.
   */
  function login(_token, newUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }

  /** Call this on logout — clears the server cookie as well. */
  function logout() {
    logoutUser();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  /** Merge profile fields and keep localStorage in sync */
  function updateUser(patch) {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }

  const value = { user, login, logout, updateUser, isAuthenticated: !!user };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook: const { user, login, logout, isAuthenticated } = useAuth() */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
