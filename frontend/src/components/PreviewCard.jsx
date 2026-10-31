import { useState, useEffect } from "react";
import {
  ExternalLink,
  Trash2,
  Calendar,
  Globe,
  AlertCircle,
  Copy,
  Check,
  Maximize2,
  X,
} from "lucide-react";
import previewService from "../services/previewService";
import LoadingSpinner from "./LoadingSpinner";

export default function PreviewCard({ preview, onDelete }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    setImageLoading(true);
    setImageError(false);

    previewService
      .fetchPreviewImageBlob(preview.id)
      .then((url) => {
        if (active) {
          objectUrl = url;
          setImageUrl(url);
          setImageLoading(false);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (active) {
          setImageError(true);
          setImageLoading(false);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [preview.id]);

  const handleCopyUrl = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(preview.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(preview.id);
    } catch {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const getDomain = (rawUrl) => {
    try {
      return new URL(rawUrl).hostname.replace(/^www\./, "");
    } catch {
      return rawUrl;
    }
  };

  return (
    <>
      <article
        className="preview-card"
        data-testid={`preview-card-${preview.id}`}
      >
        <div className="browser-header">
          <div className="browser-dots">
            <span className="dot dot-close" />
            <span className="dot dot-minimize" />
            <span className="dot dot-maximize" />
          </div>

          <div className="browser-address-bar" title={preview.url}>
            <Globe size={11} className="browser-globe-icon" />
            <span className="browser-url-text">{getDomain(preview.url)}</span>
          </div>

          <button
            onClick={handleCopyUrl}
            className="browser-copy-btn"
            title={copied ? "Copied to clipboard!" : "Copy URL"}
            aria-label="Copy URL"
          >
            {copied ? (
              <Check size={12} className="text-success" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>

        <div
          className="preview-image-container"
          onClick={() => imageUrl && !imageError && setIsModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" && imageUrl) setIsModalOpen(true);
          }}
          title="Click to view full screenshot"
        >
          {imageLoading && (
            <div className="image-skeleton">
              <LoadingSpinner size={24} label="Loading snapshot..." />
            </div>
          )}

          {imageError && (
            <div className="image-error-fallback">
              <AlertCircle size={26} className="text-warning" />
              <p>Screenshot unavailable</p>
            </div>
          )}

          {imageUrl && !imageError && (
            <>
              <img
                src={imageUrl}
                alt={`Preview of ${preview.url}`}
                className={`preview-image ${
                  imageLoading ? "image-hidden" : "image-visible"
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              <div className="image-hover-overlay">
                <span className="overlay-pill">
                  <Maximize2 size={13} /> View Fullscreen
                </span>
              </div>
            </>
          )}
        </div>

        <div className="preview-card-body">
          <div className="preview-info-row">
            <h3 className="preview-url-title" title={preview.url}>
              {preview.url}
            </h3>
            <span className="preview-resolution-badge">1440 × 900</span>
          </div>

          <div className="preview-meta">
            <span className="preview-date">
              <Calendar size={13} />
              {formatDate(preview.created_at)}
            </span>
          </div>

          <div className="preview-actions">
            <a
              href={preview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm action-link"
              title="Open original website"
            >
              <ExternalLink size={14} />
              <span>Visit Site</span>
            </a>

            {showConfirm ? (
              <div className="delete-confirm-group">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn btn-danger btn-sm"
                  title="Confirm permanent deletion"
                  aria-label="Confirm delete"
                >
                  {isDeleting ? <LoadingSpinner size={13} /> : "Confirm Delete"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="btn btn-ghost-danger btn-sm"
                title="Delete preview"
                aria-label="Delete"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {isModalOpen && imageUrl && (
        <div
          className="modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Globe size={16} />
                <span className="modal-title">{preview.url}</span>
              </div>
              <div className="modal-actions">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={14} /> Open Site
                </a>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="modal-close-btn"
                  aria-label="Close fullscreen modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="modal-image-wrapper">
              <img
                src={imageUrl}
                alt={`Full preview of ${preview.url}`}
                className="modal-image"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
