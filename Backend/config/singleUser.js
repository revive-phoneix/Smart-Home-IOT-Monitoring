import bcrypt from "bcryptjs";
import User from "../models/User.js";

const SINGLE_USER_EMAIL = process.env.SINGLE_USER_EMAIL;
const SINGLE_USER_PASSWORD = process.env.SINGLE_USER_PASSWORD;

// Ensure single-user account exists. When SINGLE_USER is enabled we require
// both SINGLE_USER_EMAIL and SINGLE_USER_PASSWORD to be set (no defaults).
export const ensureSingleUser = async () => {
  if (process.env.SINGLE_USER !== "true") return null;

  if (!SINGLE_USER_EMAIL || !SINGLE_USER_PASSWORD) {
    throw new Error('SINGLE_USER is enabled but SINGLE_USER_EMAIL or SINGLE_USER_PASSWORD is not set. Please set both environment variables.');
  }

  let user = await User.findOne({ email: SINGLE_USER_EMAIL });
  if (user) return user;

  const hashed = await bcrypt.hash(SINGLE_USER_PASSWORD, 10);
  user = new User({ name: "Administrator", email: SINGLE_USER_EMAIL, password: hashed });
  await user.save();
  console.log("Single-user account created:", SINGLE_USER_EMAIL);
  return user;
};

export const getSingleUserByEmail = async () => {
  if (!SINGLE_USER_EMAIL) return null;
  return User.findOne({ email: SINGLE_USER_EMAIL });
};
