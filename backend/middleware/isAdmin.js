import { User } from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    if (req?.user?.role === "admin" || req?.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only.", success: false });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Admin check failed", success: false });
  }
};
