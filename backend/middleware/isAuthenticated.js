import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "User not authenticated", success: false });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({ message: "Invalid token", success: false });
    }

    const user = await User.findById(decode.userId).select("_id isAdmin isBlocked");
    if (!user) {
      return res.status(401).json({ message: "User not found", success: false });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked. Contact admin.", success: false });
    }

    req.id = String(user._id);
    req.user = user;
    req.isAdmin = user.isAdmin || user.role === "admin";

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Authentication failed", success: false });
  }
};
