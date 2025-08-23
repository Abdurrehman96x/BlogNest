import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getUsersWithStats,
  blockUnblockUser,
  getPlatformStats,
  getSingleUserStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get("/users", getUsersWithStats);
router.patch("/users/:id/block", blockUnblockUser);
router.get("/stats", getPlatformStats);
router.get("/users/:id", getSingleUserStats);

export default router;
