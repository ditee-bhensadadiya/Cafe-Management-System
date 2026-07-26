import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("cafe_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cafe_access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    // Validate the stored token is still good and refresh the user profile
    authApi
      .me()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("cafe_user", JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem("cafe_access_token");
        localStorage.removeItem("cafe_user");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistSession = (data) => {
    localStorage.setItem("cafe_access_token", data.access_token);
    localStorage.setItem("cafe_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    persistSession(data);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    persistSession(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("cafe_access_token");
    localStorage.removeItem("cafe_user");
    setUser(null);
  };

  const refreshUser = (updatedUser) => {
    localStorage.setItem("cafe_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
