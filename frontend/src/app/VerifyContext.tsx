import { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
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
  canAccessEmployeeEvaluation: boolean;
}>({
  user: null,
  setUser: () => {},
  superAdmin: false,
  authUserType: "employee",
  loginUser: async () => ({ success: false }),
  authCheckLoading: false,
  canAccessEmployees: false,
  canAccessEmployeeEvaluation: false,
});

export const VerifyContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);
  const [authUserType, setAuthUserType] = useState<"admin" | "employee">(() => {
    const raw = localStorage.getItem("authUserType");
    return raw === "admin" || raw === "employee" ? raw : "employee";
  });

  // Single-admin system: any logged-in user is the admin
  const superAdmin = user !== null && authUserType === "admin";
  const employeeRoles = user?.roles || [];
  const canAccessEmployees =
    superAdmin ||
    employeeRoles.includes("HR") ||
    employeeRoles.includes("Team Lead") ||
    employeeRoles.includes("Technical Manager");
  const canAccessEmployeeEvaluation =
    superAdmin ||
    employeeRoles.includes("HR") ||
    employeeRoles.includes("Team Lead");

  const loginUser = useCallback(async (
    email: string,
    password: string,
    userType: "admin" | "employee" = "employee"
  ) => {
    const { ok, data } = await login(email, password, userType);
    if (!ok || !data.success) {
      return { success: false, message: data.message };
    }

    // Only persist after confirmed login success
    localStorage.setItem("token", data.token);
    localStorage.setItem("authUserType", userType);
    setAuthUserType(userType);

    const profileResult = await verify(data.token, userType);
    if (!profileResult.ok || !profileResult.data.success) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUserType");
      return { success: false, message: "Could not load profile. Please try again." };
    }

    setUser({
      ...profileResult.data.user,
      roles: profileResult.data.roles || [],
    });
    return { success: true };
  }, []);

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

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      loginUser,
      superAdmin,
      authUserType,
      authCheckLoading,
      canAccessEmployees,
      canAccessEmployeeEvaluation,
    }),
    [
      user,
      loginUser,
      superAdmin,
      authUserType,
      authCheckLoading,
      canAccessEmployees,
      canAccessEmployeeEvaluation,
    ]
  );

  return (
    <VerifyContext.Provider value={contextValue}>
      {children}
    </VerifyContext.Provider>
  );
};
