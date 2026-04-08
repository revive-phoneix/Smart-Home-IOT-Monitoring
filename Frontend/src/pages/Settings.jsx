import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  KeyRound,
  LogOut,
  Mail,
  Shield,
  User,
} from "lucide-react";
import {
  getProfile,
  getUserSettings,
  updateProfile,
  updateUserSettings,
} from "../services/api";
import "../styles/Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", email: "", profilePhoto: "" });
  const [identity, setIdentity] = useState({ userId: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const storedUser = JSON.parse(localStorage.getItem("smarthome_user") || "{}");
      const lookup = {
        userId: storedUser.id || "",
        email: storedUser.email || "",
      };
      setIdentity(lookup);

      const params = lookup.userId ? { userId: lookup.userId } : { email: lookup.email };
      const [profileRes] = await Promise.all([
        getProfile(params),
        getUserSettings(params),
      ]);

      const loadedProfile = profileRes.data || {};
      setProfile({
        name: loadedProfile.name || "",
        email: loadedProfile.email || "",
        profilePhoto: loadedProfile.profilePhoto || "",
      });

      if (loadedProfile.id && loadedProfile.email) {
        const freshUser = {
          id: loadedProfile.id,
          name: loadedProfile.name || "",
          email: loadedProfile.email,
          profilePhoto: loadedProfile.profilePhoto || "",
        };
        localStorage.setItem("smarthome_user", JSON.stringify(freshUser));
        setIdentity({ userId: freshUser.id, email: freshUser.email });
      }
    } catch {
      setStatusMessage("Unable to load settings from backend. Showing defaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const requestIdentity = identity.userId
    ? { userId: identity.userId }
    : { email: identity.email || profile.email };

  const saveAccount = async () => {
    setSaving(true);
    setStatusMessage("");
    try {
      const profileRes = await updateProfile({
        ...requestIdentity,
        name: profile.name,
        email: profile.email,
        profilePhoto: profile.profilePhoto || "",
      });

      await updateUserSettings({
        ...requestIdentity,
        settings: {},
      });

      const user = profileRes.data?.user;
      if (user) {
        localStorage.setItem("smarthome_user", JSON.stringify(user));
        setIdentity({ userId: user.id, email: user.email });
      }

      setStatusMessage("Account settings saved.");
    } catch (error) {
      setStatusMessage(error.response?.data?.message || "Failed to save account settings.");
    } finally {
      setSaving(false);
    }
  };

  const accountInitials = useMemo(() => {
    const source = (profile.name || "JD").trim();
    const parts = source.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [profile.name]);

  const onPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png") {
      setStatusMessage("Only .png images are allowed.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        profilePhoto: typeof reader.result === "string" ? reader.result : "",
      }));
      setStatusMessage("Profile photo selected. Save changes to persist.");
    };
    reader.readAsDataURL(file);
  };

  const onChangePassword = () => {
    const confirmChange = window.confirm("Are you sure you want to change your password?");
    if (confirmChange) {
      navigate("/change-password");
    }
  };

  const onLogoutAll = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("smarthome_user");
    navigate("/");
  };

  const accountPanel = (
    <div className="settings-main-pane">
      <div className="settings-head">
        <h1>Account & Profile Settings</h1>
        <p>Core user identity and access control</p>
      </div>

      <section className="settings-panel-card">
        <h3><User size={17} /> Profile Information</h3>
        <p className="label-top">Profile Picture</p>
        <div className="profile-row">
          <div className="avatar-chip">
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt="Profile" className="avatar-image" />
            ) : (
              accountInitials
            )}
          </div>
          <label className="btn-soft" htmlFor="profile-photo-input">Change Photo</label>
          <input
            id="profile-photo-input"
            type="file"
            accept=".png,image/png"
            onChange={onPhotoSelect}
            className="hidden-file-input"
          />
        </div>

        <div className="field-group">
          <label htmlFor="settings-name">Name</label>
          <input
            id="settings-name"
            value={profile.name}
            onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="field-group">
          <label htmlFor="settings-email"><Mail size={14} /> Email Address</label>
          <input
            id="settings-email"
            value={profile.email}
            onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </section>

      <section className="settings-panel-card">
        <h3><Shield size={17} /> Security</h3>
        <div className="row-split">
          <div>
            <h4><KeyRound size={14} /> Change Password</h4>
            <p>Update your password to keep your account secure</p>
          </div>
          <button type="button" className="btn-muted" onClick={onChangePassword}>Update</button>
        </div>
      </section>

      <section className="settings-panel-card">
        <h3><LogOut size={17} /> Session Management</h3>
        <div className="row-split">
          <div>
            <h4>Logout All</h4>
            <p>End all active sessions except this one</p>
          </div>
          <button type="button" className="btn-danger-soft" onClick={onLogoutAll}>Logout All</button>
        </div>
      </section>

      <div className="settings-footer-actions">
        <button type="button" className="btn-muted" onClick={loadSettings}>Cancel</button>
        <button type="button" className="btn-primary" onClick={saveAccount} disabled={saving}>Save Changes</button>
      </div>
    </div>
  );

  return (
    <div className="settings-page-wrap">
      <main className="settings-content-wrap">
        {loading && <p className="status-note">Loading settings...</p>}
        {statusMessage && <p className="status-note">{statusMessage}</p>}
        {accountPanel}
      </main>
    </div>
  );
};

export default Settings;
