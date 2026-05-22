import User from "../models/User.js";
import { authenticator } from "otplib";
import qrcode from "qrcode";

export const setup2FA = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Generate a secret for the user
    const secret = authenticator.generateSecret();
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Build OTPAuth URL for QR provisioning
    const otpauth = authenticator.keyuri(user.email, "SmartHomeIOT", secret);
    const qrDataUrl = await qrcode.toDataURL(otpauth);

    // Temporarily store secret in user's settings until verified
    user.settings = user.settings || {};
    user.settings.security = user.settings.security || {};
    user.settings.security.twoFactorSecret = secret;
    await user.save();

    return res.json({ otpauth, qrDataUrl });
  } catch (err) {
    return res.status(500).json({ message: "Failed to setup 2FA" });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { token } = req.body || {};
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!token) return res.status(400).json({ message: "Missing token" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = user.settings?.security?.twoFactorSecret;
    if (!secret) return res.status(400).json({ message: "2FA not initiated" });

    const isValid = authenticator.verify({ token, secret });
    if (!isValid) return res.status(400).json({ message: "Invalid token" });

    // Mark 2FA enabled
    user.settings.security.twoFactorEnabled = true;
    await user.save();

    return res.json({ message: "2FA enabled" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to verify 2FA" });
  }
};
