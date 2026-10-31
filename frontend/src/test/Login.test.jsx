import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import { AuthProvider } from "../context/AuthContext";
import authService from "../services/authService";

vi.mock("../services/authService");

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders login form with email, password fields and sign in button", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create an account/i })).toBeInTheDocument();
  });

  it("submits the form successfully with valid credentials", async () => {
    authService.login.mockResolvedValueOnce({
      access_token: "mock-jwt-token",
      token_type: "bearer",
    });
    authService.getMe.mockResolvedValueOnce({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "secret1234",
      });
    });
  });

  it("displays error message when login fails with 401", async () => {
    authService.login.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: "Incorrect email or password" },
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email or password/i)
      ).toBeInTheDocument();
    });
  });
});
