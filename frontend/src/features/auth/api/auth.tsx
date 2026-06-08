import axios from "./axios";

type ApiResponse = {
  ok: boolean;
  data: any;
};

export async function login(
  email: string,
  password: string,
  userType: "admin" | "employee" = "employee"
): Promise<ApiResponse> {
  try {
    // Backend expects OAuth2 form data (username + password)
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const endpoint = userType === "admin" ? "/admin/login" : "/employee/login";
    const res = await axios.post(endpoint, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return {
      ok: true,
      data: { success: true, token: res.data.access_token },
    };
  } catch (error: any) {
    const message =
      error.response?.data?.detail || "Network error. Please try again.";
    return {
      ok: false,
      data: { success: false, message },
    };
  }
}

export async function verify(
  token: string,
  userType: "admin" | "employee" = "employee"
): Promise<ApiResponse> {
  try {
    const endpoint =
      userType === "admin" ? "/admin/company_profile" : "/employee/profile";
    const res = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      ok: true,
      data: {
        success: true,
        user: {
          id: userType === "employee" ? res.data.id : undefined,
          name: userType === "admin" ? res.data.company_name : res.data.name,
          email: res.data.email,
        },
        roles: userType === "employee" ? (res.data.roles || []) : [],
      },
    };
  } catch (error) {
    return {
      ok: false,
      data: { success: false, message: "Invalid token" },
    };
  }
}
