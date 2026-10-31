import api from "./api";

export const authService = {
  async register({ name, email, password }) {
    const response = await api.post("/api/auth/register", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  },

  async login({ email, password }) {
    const response = await api.post("/api/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  },

  async getMe() {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

export default authService;
