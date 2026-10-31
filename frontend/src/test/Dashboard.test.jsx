import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import { AuthProvider } from "../context/AuthContext";
import previewService from "../services/previewService";
import authService from "../services/authService";

vi.mock("../services/previewService");
vi.mock("../services/authService");

const mockUser = {
  id: 1,
  name: "Sarah Connor",
  email: "sarah@example.com",
};

const mockPreviews = [
  {
    id: 101,
    url: "https://example.com",
    screenshot_url: "/api/previews/101/image",
    created_at: "2026-10-31T10:00:00Z",
  },
];

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("access_token", "fake-token");
    authService.getMe.mockResolvedValue(mockUser);
    previewService.getPreviews.mockResolvedValue(mockPreviews);
    previewService.fetchPreviewImageBlob.mockResolvedValue("blob:http://localhost/fake-image");
  });

  it("renders welcome header and saved previews", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByText("https://example.com")).toBeInTheDocument();
    });
  });

  it("submits URL and adds newly generated preview to the grid", async () => {
    const newPreview = {
      id: 102,
      url: "https://github.com",
      screenshot_url: "/api/previews/102/image",
      created_at: "2026-10-31T10:05:00Z",
    };

    previewService.createPreview.mockResolvedValueOnce(newPreview);

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("https://example.com")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/enter website url/i);
    fireEvent.change(input, { target: { value: "https://github.com" } });

    const submitBtn = screen.getByRole("button", { name: /generate preview/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(previewService.createPreview).toHaveBeenCalledWith("https://github.com");
      expect(screen.getByText("https://github.com")).toBeInTheDocument();
    });
  });

  it("displays error message when URL generation fails (e.g. invalid URL or private IP)", async () => {
    previewService.createPreview.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          detail: "URLs pointing to private or reserved IP addresses are not allowed.",
        },
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/enter website url/i);
    fireEvent.change(input, { target: { value: "http://127.0.0.1" } });

    const submitBtn = screen.getByRole("button", { name: /generate preview/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/private or reserved IP addresses are not allowed/i)
      ).toBeInTheDocument();
    });
  });
});
