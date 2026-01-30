import { createContext, useState, useEffect, ReactNode } from "react";
import { login, verify } from "../features/auth/api/auth";

interface BaseUser {
  name: string;
  email: string;
}

interface Employee {
  uniqueId: string;
  image: string;
  name: string;
  employeeId: string | number;
  mySelectField?: string;
  password?: string | number;
  date?: string | number | Date;
  employeeInformation?: string;
}

export type AppUser = BaseUser &
  Partial<Employee> & {
    companyId?: string | number;
    department?: string;
  };

export const VerifyContext = createContext<{
  user: AppUser | null;
  authCheckLoading: boolean;
  superAdmin: boolean;
  setUser: (user: AppUser | null) => void;
  loginUser: (
    email: string,
    password: string,
    employee?: Employee[]
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

  const superAdmin = user?.name === "Celestial";

  const loginUser = async (
    email: string,
    password: string,
    employee?: Employee[]
  ) => {
    const { ok, data } = await login(email, password);
    if (ok && data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
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
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
