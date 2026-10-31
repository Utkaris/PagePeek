import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register";
import { AuthProvider } from "../context/AuthContext";
import authService from "../services/authService";

vi.mock("../services/authService");

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders registration fields: name, email, password, confirm password", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Alice Smith" },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "differentpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(authService.register).not.toHaveBeenCalled();
  });

  it("shows error when password is less than 8 characters", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Alice Smith" },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "short" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("handles duplicate email registration (409 conflict)", async () => {
    authService.register.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { detail: "Email is already registered" },
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Bob" },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "validpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "validpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/email address is already registered/i)
      ).toBeInTheDocument();
    });
  });
});
