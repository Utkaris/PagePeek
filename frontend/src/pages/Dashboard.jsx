import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  Search,
  Zap,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PreviewGrid from "../components/PreviewGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import previewService from "../services/previewService";

const SUGGESTED_URLS = [
  { label: "GitHub", url: "https://github.com" },
  { label: "Hacker News", url: "https://news.ycombinator.com" },
  { label: "Wikipedia", url: "https://wikipedia.org" },
  { label: "Stripe", url: "https://stripe.com" },
];

export default function Dashboard() {
  const { user } = useAuth();

  const [urlInput, setUrlInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previews, setPreviews] = useState([]);
  const [previewsLoading, setPreviewsLoading] = useState(true);
  const [previewsError, setPreviewsError] = useState(null);

  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchPreviews = useCallback(async () => {
    setPreviewsLoading(true);
    setPreviewsError(null);
    try {
      const data = await previewService.getPreviews();
      setPreviews(data);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Could not load your saved previews. Please try again.";
      setPreviewsError(message);
    } finally {
      setPreviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreviews();
  }, [fetchPreviews]);

  const handleGeneratePreview = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    let targetUrl = urlInput.trim();
    if (!targetUrl) {
      setFormError("Please enter a valid website URL.");
      return;
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    setGenerating(true);

    try {
      const newPreview = await previewService.createPreview(targetUrl);
      setPreviews((prev) => [newPreview, ...prev]);
      setUrlInput("");
      setFormSuccess(`Preview captured and added to your library!`);
      setTimeout(() => setFormSuccess(""), 5000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 400) {
        setFormError(
          detail ||
            "Invalid or restricted URL. Ensure it is a valid public HTTP or HTTPS web address."
        );
      } else if (err.response?.status === 422) {
        setFormError("Invalid URL syntax. Please enter a valid URL.");
      } else if (err.code === "ECONNABORTED" || !err.response) {
        setFormError(
          "Request timed out. Capturing the website screenshot took too long."
        );
      } else {
        setFormError(
          detail ||
            "Unable to capture website screenshot. The site may be down, slow, or blocking automated browsers."
        );
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePreview = async (previewId) => {
    try {
      await previewService.deletePreview(previewId);
      setPreviews((prev) => prev.filter((p) => p.id !== previewId));
    } catch (err) {
      const message =
        err.response?.data?.detail || "Failed to delete preview. Please try again.";
      alert(message);
      throw err;
    }
  };

  const filteredPreviews = useMemo(() => {
    if (!searchQuery.trim()) return previews;
    const q = searchQuery.toLowerCase().trim();
    return previews.filter((p) => p.url.toLowerCase().includes(q));
  }, [previews, searchQuery]);

  return (
    <div className="dashboard-layout">
      <Navbar previewCount={previews.length} />

      <main className="dashboard-main">
        <div className="dashboard-container">
          <section className="dashboard-hero">
            <div className="hero-content">
              <div className="hero-pill">
                <span className="hero-pill-dot" />
                <span>Welcome back{user?.name ? `, ${user.name}` : ""}</span>
              </div>
              <h1 className="hero-title">
                Website Previews, <span className="highlight-text">Captured with Precision</span>
              </h1>
              <p className="hero-subtitle">
                Enter any public website URL to capture high-resolution desktop screenshots, organize visual bookmarks, and access them anytime.
              </p>
            </div>

            <div className="generator-card">
              {formError && (
                <div className="alert alert-error" role="alert">
                  <AlertCircle size={18} className="alert-icon" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="alert alert-success" role="alert">
                  <CheckCircle2 size={18} className="alert-icon" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleGeneratePreview} className="generator-form">
                <div className="generator-input-wrapper">
                  <Globe size={20} className="generator-input-icon" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (formError) setFormError("");
                    }}
                    placeholder="Enter website URL (e.g., https://github.com)"
                    disabled={generating}
                    className="generator-input"
                    aria-label="Website URL"
                  />
                  <button
                    type="submit"
                    disabled={generating || !urlInput.trim()}
                    className="btn btn-primary generator-btn"
                  >
                    {generating ? (
                      <LoadingSpinner
                        size={18}
                        label="Capturing screenshot..."
                      />
                    ) : (
                      <>
                        <span>Generate Preview</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                <div className="generator-suggestions">
                  <span className="suggestions-label">Try quick samples:</span>
                  <div className="suggestions-chips">
                    {SUGGESTED_URLS.map((sample) => (
                      <button
                        key={sample.url}
                        type="button"
                        onClick={() => {
                          setUrlInput(sample.url);
                          if (formError) setFormError("");
                        }}
                        disabled={generating}
                        className="suggestion-chip"
                      >
                        <span>{sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="generator-footer-badges">
                <span className="footer-badge">
                  <ShieldCheck size={14} className="text-success" /> SSRF Protected
                </span>
                <span className="footer-badge">
                  <Zap size={14} className="text-accent" /> 1440×900 Viewport
                </span>
                <span className="footer-badge">
                  <Clock size={14} className="text-muted" /> Instant Capture
                </span>
              </div>
            </div>
          </section>

          <section className="previews-section">
            <div className="previews-header">
              <div className="previews-heading-group">
                <div className="previews-icon-wrapper">
                  <Layers size={20} />
                </div>
                <div>
                  <h2 className="previews-title">Your Saved Previews</h2>
                  <p className="previews-subtitle">
                    {previews.length === 1
                      ? "1 website screenshot archived"
                      : `${previews.length} website screenshots archived`}
                  </p>
                </div>
              </div>

              <div className="previews-toolbar-actions">
                {previews.length > 2 && (
                  <div className="search-input-wrapper">
                    <Search size={15} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Filter by URL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </div>
                )}

                <button
                  onClick={fetchPreviews}
                  disabled={previewsLoading || generating}
                  className="btn btn-outline btn-sm refresh-btn"
                  title="Reload previews from database"
                >
                  <RefreshCw
                    size={14}
                    className={previewsLoading ? "animate-spin" : ""}
                  />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <PreviewGrid
              previews={filteredPreviews}
              loading={previewsLoading}
              error={previewsError}
              onRefresh={fetchPreviews}
              onDelete={handleDeletePreview}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
