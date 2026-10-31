import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Logo from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        (typeof err.response?.data === "string" ? err.response.data : null);

      if (err.response?.status === 401) {
        setError("Invalid email or password. Please verify your credentials.");
      } else if (err.code === "ECONNABORTED" || !err.response) {
        setError("Unable to connect to PagePeek server. Please check your backend.");
      } else {
        setError(detail || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper">
        <div className="auth-brand-header">
          <div className="auth-brand-logo-container">
            <Logo size={46} />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your PagePeek workspace</p>
        </div>

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password" className="form-label">
                Password
              </label>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-trailing-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full submit-btn"
          >
            {loading ? (
              <LoadingSpinner size={18} label="Signing in..." />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>

          <div className="auth-security-badge">
            <Shield size={13} />
            <span>Encrypted credentials & secure session management</span>
          </div>
        </div>
      </div>
    </div>
  );
}
