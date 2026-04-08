import API from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../services/api";
import "../styles/Authentication.css";

const Authentication = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const isGoogleSignInEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (isSignup) {
      // 🔥 Signup API call
      const res = await API.post("/auth/signup", formData);

      alert(res.data.message);

      if (res.data.user) {
        const userData = { ...res.data.user, token: res.data.token };
        localStorage.setItem("smarthome_user", JSON.stringify(userData));
      }

      // Redirect after successful signup
      navigate("/dashboard");

    } else {
      // 🔥 Login API call
      const res = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      alert(res.data.message);

      if (res.data.user) {
        const userData = { ...res.data.user, token: res.data.token };
        localStorage.setItem("smarthome_user", JSON.stringify(userData));
      }

      navigate("/dashboard");
    }

  } catch (error) {
    // 🔥 Proper error handling
    alert(error.response?.data?.message || "Something went wrong");
  }
};

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        setGoogleError("Google login failed. Try again.");
        return;
      }

      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.data.user) {
        const userData = { ...res.data.user, token: res.data.token };
        localStorage.setItem("smarthome_user", JSON.stringify(userData));
      }
      navigate("/dashboard");
    } catch (error) {
      setGoogleError(error.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isSignup ? "Signup Form" : "Login Form"}</h2>

        <div className="toggle-buttons">
          <button
            className={!isSignup ? "active" : ""}
            onClick={() => {
              setIsSignup(false);
              setGoogleError("");
            }}
          >
            Login
          </button>
          <button
            className={isSignup ? "active" : ""}
            onClick={() => {
              setIsSignup(true);
              setGoogleError("");
            }}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {!isSignup && (
            <p className="forgot">Forgot password?</p>
          )}

          <button type="submit" className="submit-btn">
            {isSignup ? "Signup" : "Login"}
          </button>
        </form>

        {!isSignup && (
          <>
            <div className="auth-divider">or continue with</div>
            {isGoogleSignInEnabled ? (
              <div className="google-login-wrap">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setGoogleError("Google Sign-In popup was closed or blocked")}
                />
              </div>
            ) : (
              <p className="google-setup-note">
                Google Sign-In is not configured yet. Add VITE_GOOGLE_CLIENT_ID in Frontend/.env and restart Vite.
              </p>
            )}
          </>
        )}

        {googleError && <p className="google-error">{googleError}</p>}

        <p className="bottom-text">
          {isSignup ? "Already have an account?" : "Not a member?"}
          <span
            onClick={() => {
              setIsSignup(!isSignup);
              setGoogleError("");
            }}
          >
            {isSignup ? " Login now" : " Signup now"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Authentication;