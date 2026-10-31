import { Globe, RefreshCw, AlertCircle } from "lucide-react";
import PreviewCard from "./PreviewCard";
import LoadingSpinner from "./LoadingSpinner";

export default function PreviewGrid({
  previews = [],
  loading = false,
  error = null,
  onRefresh,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="preview-loading-state" role="status">
        <LoadingSpinner size={32} label="Fetching your saved previews..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="preview-error-card" role="alert">
        <AlertCircle size={32} className="error-icon" />
        <h3>Failed to load previews</h3>
        <p>{error}</p>
        {onRefresh && (
          <button onClick={onRefresh} className="btn btn-secondary btn-sm mt-3">
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (previews.length === 0) {
    return (
      <div className="preview-empty-state">
        <div className="empty-icon-circle">
          <Globe size={40} className="empty-icon" />
        </div>
        <h3>No previews captured yet</h3>
        <p>
          Enter a public website URL in the box above to generate and save your
          first high-resolution preview screenshot.
        </p>
      </div>
    );
  }

  return (
    <div className="previews-grid" data-testid="previews-grid">
      {previews.map((preview) => (
        <PreviewCard
          key={preview.id}
          preview={preview}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
