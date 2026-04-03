import { createContext, useState, useEffect, ReactNode } from "react";
import { login, verify } from "../features/auth/api/auth";

export type AppUser = {
  name: string;
  email: string;
};

export const VerifyContext = createContext<{
  user: AppUser | null;
  authCheckLoading: boolean;
  superAdmin: boolean;
  setUser: (user: AppUser | null) => void;
  loginUser: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
}>({
  user: null,
  setUser: () => {},
  superAdmin: false,
  loginUser: async () => ({ success: false }),
  authCheckLoading: false,
});

export const VerifyContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);

  // Single-admin system: any logged-in user is the admin
  const superAdmin = user !== null;

  const loginUser = async (email: string, password: string) => {
    const { ok, data } = await login(email, password);
    if (ok && data.success) {
      localStorage.setItem("token", data.token);

      // Fetch user profile using the token
      const profileResult = await verify(data.token);
      if (profileResult.ok && profileResult.data.success) {
        setUser(profileResult.data.user);
        return { success: true };
      }

      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        const { ok, data } = await verify(token);
        if (ok && data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }

      setAuthCheckLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <VerifyContext.Provider
      value={{ user, setUser, loginUser, superAdmin, authCheckLoading }}
    >
      {children}
    </VerifyContext.Provider>
  );
};
