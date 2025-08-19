import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  createComment,
  deleteComment,
  editComment,
  getAllCommentsOnMyBlogs,
  getCommentsOfPost,
  likeComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

// Create a comment or reply (pass { content, parentId? } in body)
router.post('/:id/create', isAuthenticated, createComment);

// Delete / Edit
router.delete("/:id/delete", isAuthenticated, deleteComment);
router.put("/:id/edit", isAuthenticated, editComment);

// Fetch comments (returns top-level + nested replies)
router.get("/:id/comment/all", getCommentsOfPost);

// Like toggle for comment
router.get('/:id/like', isAuthenticated, likeComment);

// All comments across my blogs
router.get('/my-blogs/comments', isAuthenticated, getAllCommentsOnMyBlogs);

export default router;
