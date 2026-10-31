import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
  size = 24,
  label = "",
  fullScreen = false,
  className = "",
}) {
  const content = (
    <div
      className={`loading-spinner-wrapper ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2
        size={size}
        className="spinner-icon animate-spin"
        aria-hidden="true"
      />
      {label && <span className="spinner-label">{label}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return <div className="fullscreen-spinner-container">{content}</div>;
  }

  return content;
}
