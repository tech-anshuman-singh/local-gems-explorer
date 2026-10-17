import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface AuthUser {
  _id: string;
  email: string;
  display_name?: string;
  role: "admin" | "moderator" | "user";
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, display_name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAdmin: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      api.get("/auth/me", storedToken)
        .then(({ user }) => {
          setUser(user);
          setToken(storedToken);
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const { token, user } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
  };

  const signUp = async (email: string, password: string, display_name: string) => {
    const { token, user } = await api.post("/auth/signup", { email, password, display_name });
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAdmin: user?.role === "admin",
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
