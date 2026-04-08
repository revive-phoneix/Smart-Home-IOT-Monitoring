import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, KeyRound, LogOut, User } from "lucide-react";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("smarthome_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const onOutsideClick = useCallback((event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [onOutsideClick]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2>Smart Home Monitor</h2>
      </div>

      <div className="navbar-right">
        <div className="topbar-icons">
          <div className="icon-wrapper" onClick={() => navigate("/alerts")}>
            <Bell size={18} className="bell-icon" />
            <span className="notification-dot"></span>
          </div>

          <div className="profile-wrapper">
            <div className="profile-container" ref={profileRef}>
              <div
                className="profile-trigger"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <div className="profile-icon">
                  <User size={19} />
                </div>
                <ChevronDown
                  size={16}
                  className={`profile-caret ${dropdownOpen ? "open" : ""}`}
                />
              </div>

              {dropdownOpen && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <p>{storedUser?.name || "Smart Home Monitor"}</p>
                    <span>{storedUser?.email || "user@smarthome.local"}</span>
                  </div>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      if (window.confirm("Change password?")) {
                        setDropdownOpen(false);
                        navigate("/change-password");
                      }
                    }}
                  >
                    <KeyRound size={15} />
                    <span>Change Password</span>
                  </button>

                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Navbar);