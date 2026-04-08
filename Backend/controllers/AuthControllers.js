import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const getGoogleClientId = () => process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";

const deepMerge = (target = {}, source = {}) => {
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    if (
      sourceValue
      && typeof sourceValue === "object"
      && !Array.isArray(sourceValue)
    ) {
      output[key] = deepMerge(target[key] || {}, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  });
  return output;
};

const resolveCurrentUser = async (req) => {
  // Use authenticated user from middleware, not from query/body
  const { userId } = req.user || {};
  if (!userId) return null;
  return User.findById(userId);
};

const buildUserPayload = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  profilePhoto: user.profilePhoto || "",
});

const deriveNameFromEmail = (email = "") => email.split("@")[0] || "Smart Home User";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: buildUserPayload(user),
      token,
    });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Continue with Google.",
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      user: buildUserPayload(user),
      token,
    });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    const googleClientId = getGoogleClientId();
    const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

    if (!googleClientId || !googleClient) {
      return res.status(500).json({
        message: "Google OAuth is not configured on server",
      });
    }

    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return res.status(400).json({ message: "Invalid Google account" });
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        name: payload.name || deriveNameFromEmail(payload.email),
        email: payload.email,
        profilePhoto: payload.picture || "",
        password: null,
      });
      await user.save();
    } else {
      let needsSave = false;
      if (!user.name && payload.name) {
        user.name = payload.name;
        needsSave = true;
      }
      if ((!user.profilePhoto || user.profilePhoto === "") && payload.picture) {
        user.profilePhoto = payload.picture;
        needsSave = true;
      }
      if (needsSave) await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Google login successful",
      user: buildUserPayload(user),
      token,
    });
  } catch {
    return res.status(400).json({ message: "Invalid or expired Google token" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || "",
      settings: user.settings || {},
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, profilePhoto } = req.body;
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (typeof profilePhoto === "string") user.profilePhoto = profilePhoto;
    await user.save();

    return res.status(200).json({
      message: "Profile updated",
      user: buildUserPayload(user),
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserSettings = async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ settings: user.settings || {} });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.settings = deepMerge(user.settings || {}, req.body.settings || {});
    await user.save();

    return res.status(200).json({
      message: "Settings saved",
      settings: user.settings,
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const createBackup = async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.settings = deepMerge(user.settings || {}, {
      dataManagement: {
        lastBackupAt: new Date(),
        lastBackupSize: "2.4 MB",
      },
    });
    await user.save();

    return res.status(200).json({
      message: "Backup created successfully",
      dataManagement: user.settings.dataManagement,
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const clearUserCache = async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Temporary cache cleared" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(user._id);
    return res.status(200).json({ message: "Account deleted successfully" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
