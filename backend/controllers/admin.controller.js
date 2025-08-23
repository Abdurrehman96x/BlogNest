import { User } from "../models/user.model.js";
import { Blog } from "../models/blog.model.js";
import Comment from "../models/comment.model.js";
import mongoose from "mongoose";

// GET /api/v1/admin/users?search=&page=1&limit=10&sortBy=createdAt&sortOrder=desc
export const getUsersWithStats = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const search = (req.query.search || "").trim();
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const match = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName:  { $regex: search, $options: "i" } },
            { email:     { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "blogs",
          let: { uid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$author", "$$uid"] } } },
            { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
          ],
          as: "blogs",
        },
      },
      {
        $addFields: {
          blogCount: { $size: "$blogs" },
          totalBlogLikes: { $sum: "$blogs.likesCount" },
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { uid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$uid"] } } },
            { $count: "count" },
          ],
          as: "commentsWritten",
        },
      },
      { $addFields: { commentsWritten: { $ifNull: [{ $arrayElemAt: ["$commentsWritten.count", 0] }, 0] } } },
      // comments on their blogs
      {
        $addFields: { blogIds: "$blogs._id" }
      },
      {
        $lookup: {
          from: "comments",
          let: { bids: "$blogIds" },
          pipeline: [
            { $match: { $expr: { $in: ["$postId", { $ifNull: ["$$bids", []] }] } } },
            { $count: "count" },
          ],
          as: "commentsOnBlogs",
        },
      },
      { $addFields: { commentsOnBlogs: { $ifNull: [{ $arrayElemAt: ["$commentsOnBlogs.count", 0] }, 0] } } },
      {
        $project: {
          firstName: 1, lastName: 1, email: 1, photoUrl: 1, occupation: 1, createdAt: 1,
          isAdmin: 1, isBlocked: 1,
          blogCount: 1, commentsWritten: 1, commentsOnBlogs: 1, totalBlogLikes: 1,
        },
      },
      { $sort: { [sortBy]: sortOrder } },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
    ];

    const result = await User.aggregate(pipeline);
    const users = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// PATCH /api/v1/admin/users/:id/block  body: { value: true|false }
export const blockUnblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const value = !!req.body.value;

    if (String(req.id) === String(id)) {
      return res.status(400).json({ success: false, message: "You cannot block/unblock yourself" });
    }

    const user = await User.findByIdAndUpdate(id, { isBlocked: value }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: value ? "User blocked" : "User unblocked",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};

// GET /api/v1/admin/stats
export const getPlatformStats = async (req, res) => {
  try {
    const [userCounts] = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          blockedUsers: { $sum: { $cond: ["$isBlocked", 1, 0] } },
          adminUsers: { $sum: { $cond: ["$isAdmin", 1, 0] } },
        },
      },
    ]);

    const [blogCounts] = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: { $sum: { $cond: ["$isPublished", 1, 0] } },
          unpublishedBlogs: { $sum: { $cond: [{ $not: ["$isPublished"] }, 1, 0] } },
          totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
        },
      },
    ]);

    const [commentCounts] = await Comment.aggregate([
      { $group: { _id: null, totalComments: { $sum: 1 } } },
    ]);

    // Top authors by blog count (top 5)
    const topAuthors = await Blog.aggregate([
      { $group: { _id: "$author", blogCount: { $sum: 1 }, likeSum: { $sum: { $size: { $ifNull: ["$likes", []] } } } } },
      { $sort: { blogCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 0,
          userId: "$author._id",
          firstName: "$author.firstName",
          lastName: "$author.lastName",
          email: "$author.email",
          blogCount: 1,
          likeSum: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      users: {
        totalUsers: userCounts?.totalUsers || 0,
        blockedUsers: userCounts?.blockedUsers || 0,
        adminUsers: userCounts?.adminUsers || 0,
      },
      blogs: {
        totalBlogs: blogCounts?.totalBlogs || 0,
        publishedBlogs: blogCounts?.publishedBlogs || 0,
        unpublishedBlogs: blogCounts?.unpublishedBlogs || 0,
        totalLikes: blogCounts?.totalLikes || 0,
      },
      comments: {
        totalComments: commentCounts?.totalComments || 0,
      },
      topAuthors,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch platform stats" });
  }
};

// GET /api/v1/admin/users/:id
export const getSingleUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const [blogAgg] = await Blog.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          blogCount: { $sum: 1 },
          published: { $sum: { $cond: ["$isPublished", 1, 0] } },
          totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
        },
      },
    ]);

    const [commentsWrittenAgg] = await Comment.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, commentsWritten: { $sum: 1 } } },
    ]);

    const blogIds = (await Blog.find({ author: user._id }).select("_id")).map(b => b._id);
    const [commentsOnBlogsAgg] = blogIds.length
      ? await Comment.aggregate([{ $match: { postId: { $in: blogIds } } }, { $group: { _id: null, commentsOnBlogs: { $sum: 1 } } }])
      : [{ commentsOnBlogs: 0 }];

    return res.status(200).json({
      success: true,
      user,
      stats: {
        blogCount: blogAgg?.blogCount || 0,
        published: blogAgg?.published || 0,
        totalLikes: blogAgg?.totalLikes || 0,
        commentsWritten: commentsWrittenAgg?.commentsWritten || 0,
        commentsOnBlogs: commentsOnBlogsAgg?.commentsOnBlogs || 0,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch user stats" });
  }
};
