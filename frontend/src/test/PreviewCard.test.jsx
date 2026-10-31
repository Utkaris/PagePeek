import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PreviewCard from "../components/PreviewCard";
import previewService from "../services/previewService";

vi.mock("../services/previewService");

const mockPreview = {
  id: 42,
  url: "https://stripe.com",
  screenshot_url: "/api/previews/42/image",
  created_at: "2026-10-31T12:00:00Z",
};

describe("PreviewCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    previewService.fetchPreviewImageBlob.mockResolvedValue("blob:http://localhost/stripe-img");
  });

  it("renders card with site URL, domain badge, and external visit link", async () => {
    await act(async () => {
      render(<PreviewCard preview={mockPreview} onDelete={vi.fn()} />);
    });

    expect(screen.getByText("https://stripe.com")).toBeInTheDocument();
    expect(screen.getByText("stripe.com")).toBeInTheDocument();
    const visitLink = screen.getByRole("link", { name: /visit site/i });
    expect(visitLink).toHaveAttribute("href", "https://stripe.com");
    expect(visitLink).toHaveAttribute("target", "_blank");
  });

  it("handles delete flow with confirmation step", async () => {
    const onDeleteMock = vi.fn().mockResolvedValue(true);
    await act(async () => {
      render(<PreviewCard preview={mockPreview} onDelete={onDeleteMock} />);
    });

    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole("button", { name: /confirm delete/i });
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    expect(confirmBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(confirmBtn);
    });
    await waitFor(() => {
      expect(onDeleteMock).toHaveBeenCalledWith(42);
    });
  });
});
