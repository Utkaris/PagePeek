import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar({ previewCount = null }) {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <Logo size={32} />
          <div className="brand-text">
            <span className="brand-title">PagePeek</span>
            <span className="brand-pill">Workspace</span>
          </div>
        </Link>

        {user && (
          <div className="navbar-user-actions">
            {previewCount !== null && (
              <div className="preview-count-chip" title="Total previews saved">
                <span className="count-dot" />
                <span className="count-number">{previewCount}</span>
                <span className="count-label">
                  {previewCount === 1 ? "capture" : "captures"}
                </span>
              </div>
            )}

            <div className="user-profile-badge">
              <div className="user-avatar-initials" title={user.email}>
                {getInitials(user.name)}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-outline btn-sm logout-btn"
              title="Log out of PagePeek"
              aria-label="Log out"
            >
              <LogOut size={14} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
