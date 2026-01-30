// import ProfileImg from "assets/images/profileimg.jpg";
// import axios from "./axios";
// Define User interface to fix type mismatch error
interface User {
  name: string;
  email: string;
  password: string;
}

// interface Employee {
//   uniqueId: string;
//   image: string;
//   name: string;
//   employeeId: string | number;
//   mySelectField?: string;
//   email?: string;
//   password?: string | number;
//   date?: string | number | Date;
//   employeeInformation?: string;
// }

// // auth.ts

// export async function login(email: string, password: string) {
//   try {
//     const res = await axios.post("api/login", { email, password });
//     const data = res.data;
//     return { ok: res.status >= 200 && res.status < 300, data };
//   } catch (error) {
//     console.error("Login error:", error);
//     return { ok: false, data: { message: "Network error. Please try again." } };
//   }
// }

// export async function signup(name: string, email: string, password: string) {
//   try {
//     const res = await axios.post("api/signup", { name, email, password });
//     const data = res.data;
//     return { ok: res.status >= 200 && res.status < 300, data };
//   } catch (err) {
//     console.error("Signup error:", err);
//     return { ok: false, data: { message: "Network error. Please try again." } };
//   }
// }

// export async function verify(token: string) {
//   try {
//     const res = await axios("api/verify", {
//       headers: { Authorization: "Bearer " + token },
//     });
//     const data = res.data;
//     return { ok: res.status >= 200 && res.status < 300, data };
//   } catch (error) {
//     console.error("Verify error:", error);
//     return { ok: false, data: { message: "Network error. Please try again." } };
//   }
// }

type ApiResponse = {
  ok: boolean;
  data: any;
};

const dummyUsers: User[] = [
  {
    name: "Anas",
    email: "anas@test.com",
    password: "12345",
  },
  {
    name: "Celestial",
    email: "celestial@test.com",
    password: "54321",
  },
];
export async function login(
  email: string,
  password: string
): Promise<ApiResponse> {
  const user = dummyUsers.find(
    (u) => u.email === email && u.password === password
  );
  if (user?.name !== "Celestial" && user) {
    return {
      ok: true,
      data: { success: true, token: "dummy-token-123", user },
    };
  } else if (user?.name === "Celestial" && user) {
    return {
      ok: true,
      data: { success: true, token: "admin-123", user },
    };
  } else {
    return {
      ok: false,
      data: { success: false, message: "Invalid email or password" },
    };
  }
}
// export async function login(
//   email: string,
//   password: string,
//   employee: Employee[]
// ): Promise<ApiResponse> {
//   const user =
//     employee.find((e) => e.email === email && e.password === password) ||
//     dummyUsers.find((u) => u.email === email && u.password === password);
//   if (user) {
//     if (user.name === "Celestial") {
//       return {
//         ok: true,
//         data: { success: true, token: "admin-123", user },
//       };
//     } else {
//       return {
//         ok: true,
//         data: { success: true, token: "dummy-token-123", user },
//       };
//     }
//   } else {
//     return {
//       ok: false,
//       data: { success: false, message: "Invalid email or password" },
//     };
//   }
// }

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<ApiResponse> {
  const exists = dummyUsers.find((u) => u.email === email);
  if (exists) {
    return {
      ok: false,
      data: { success: false, message: "Email already exists" },
    };
  } else {
    const newUser: User = {
      name,
      email,
      password,
    };
    dummyUsers.push(newUser);
    return {
      ok: true,
      data: { success: true, token: "dummy-token-456", user: newUser },
    };
  }
}

export async function verify(token: string): Promise<ApiResponse> {
  if (token.startsWith("dummy-token")) {
    return {
      ok: true,
      data: {
        success: true,
        user: dummyUsers[0],
      },
    };
  } else if (token.startsWith("admin")) {
    return {
      ok: true,
      data: {
        success: true,
        user: dummyUsers[1],
      },
    };
  } else {
    return {
      ok: false,
      data: { success: false, message: "Invalid token" },
    };
  }
}
