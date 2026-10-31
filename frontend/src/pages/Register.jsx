import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Logo from "../components/Logo";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }
    if (formData.name.trim().length < 2) {
      return "Full name must be at least 2 characters.";
    }
    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return "Please provide a valid email address.";
    }
    if (!formData.password) {
      return "Please enter a password.";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );

      navigate("/login", {
        replace: true,
        state: {
          message: "Registration successful! You can now log in with your credentials.",
        },
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setError(
          "This email address is already registered. Please sign in or use another email."
        );
      } else if (err.response?.status === 422) {
        const details = err.response.data?.detail;
        if (Array.isArray(details)) {
          setError(details.map((d) => d.msg).join(", "));
        } else {
          setError("Validation failed. Please verify your form fields.");
        }
      } else if (err.code === "ECONNABORTED" || !err.response) {
        setError("Unable to connect to the PagePeek server. Check connection.");
      } else {
        setError(
          err.response?.data?.detail || "Registration failed. Please try again."
        );
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
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Generate and archive high-resolution website screenshots
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Work Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="jane@company.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full submit-btn"
          >
            {loading ? (
              <LoadingSpinner size={18} label="Creating account..." />
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
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
