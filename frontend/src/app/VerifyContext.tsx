import { createContext, useState, useEffect, ReactNode } from "react";
import { login, verify } from "../features/auth/api/auth";

export type AppUser = {
  id?: number;
  name: string;
  email: string;
  roles?: string[];
};

export const VerifyContext = createContext<{
  user: AppUser | null;
  authCheckLoading: boolean;
  superAdmin: boolean;
  authUserType: "admin" | "employee";
  setUser: (user: AppUser | null) => void;
  loginUser: (
    email: string,
    password: string,
    userType?: "admin" | "employee"
  ) => Promise<{ success: boolean; message?: string }>;
  canAccessEmployees: boolean;
}>({
  user: null,
  setUser: () => {},
  superAdmin: false,
  authUserType: "employee",
  loginUser: async () => ({ success: false }),
  authCheckLoading: false,
  canAccessEmployees: false,
});

export const VerifyContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);
  const [authUserType, setAuthUserType] = useState<"admin" | "employee">(
    (localStorage.getItem("authUserType") as "admin" | "employee") || "employee"
  );

  // Single-admin system: any logged-in user is the admin
  const superAdmin = user !== null && authUserType === "admin";
  const employeeRoles = user?.roles || [];
  const canAccessEmployees =
    superAdmin ||
    employeeRoles.includes("HR") ||
    employeeRoles.includes("Team Lead") ||
    employeeRoles.includes("Technical Manager");

  const loginUser = async (
    email: string,
    password: string,
    userType: "admin" | "employee" = "employee"
  ) => {
    setAuthUserType(userType);
    localStorage.setItem("authUserType", userType);

    const { ok, data } = await login(email, password, userType);
    if (ok && data.success) {
      localStorage.setItem("token", data.token);

      // Fetch user profile using the token
      const profileResult = await verify(data.token, userType);
      if (profileResult.ok && profileResult.data.success) {
        setUser({
          ...profileResult.data.user,
          roles: profileResult.data.roles || [],
        });
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
        const storedType =
          (localStorage.getItem("authUserType") as "admin" | "employee") ||
          "employee";
        setAuthUserType(storedType);
        const { ok, data } = await verify(token, storedType);
        if (ok && data.success) {
          setUser({ ...data.user, roles: data.roles || [] });
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("authUserType");
          setUser(null);
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("authUserType");
        setUser(null);
      }

      setAuthCheckLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <VerifyContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        superAdmin,
        authUserType,
        authCheckLoading,
        canAccessEmployees,
      }}
    >
      {children}
    </VerifyContext.Provider>
  );
};
