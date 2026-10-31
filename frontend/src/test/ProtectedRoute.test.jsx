import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthContext } from "../context/AuthContext";

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner when auth status is resolving", () => {
    render(
      <AuthContext.Provider
        value={{
          isAuthenticated: false,
          loading: true,
          user: null,
        }}
      >
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Secret Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/verifying your session/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected secret content/i)).not.toBeInTheDocument();
  });

  it("redirects to /login when user is not authenticated", () => {
    render(
      <AuthContext.Provider
        value={{
          isAuthenticated: false,
          loading: false,
          user: null,
        }}
      >
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Secret Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page Form</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/login page form/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected secret content/i)).not.toBeInTheDocument();
  });

  it("renders protected content when user is authenticated", () => {
    render(
      <AuthContext.Provider
        value={{
          isAuthenticated: true,
          loading: false,
          user: { id: 1, name: "Alice", email: "alice@example.com" },
        }}
      >
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Secret Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/protected secret content/i)).toBeInTheDocument();
  });
});
