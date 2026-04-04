import axios from "./axios";

type ApiResponse = {
  ok: boolean;
  data: any;
};

export async function login(
  email: string,
  password: string
): Promise<ApiResponse> {
  try {
    // Backend expects OAuth2 form data (username + password)
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await axios.post("/admin/login", formData, {
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

export async function verify(token: string): Promise<ApiResponse> {
  try {
    const res = await axios.get("/admin/company_profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      ok: true,
      data: {
        success: true,
        user: {
          name: res.data.company_name,
          email: res.data.email,
        },
      },
    };
  } catch (error) {
    return {
      ok: false,
      data: { success: false, message: "Invalid token" },
    };
  }
}
