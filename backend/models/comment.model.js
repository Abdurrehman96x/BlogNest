import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // replies
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    numberOfLikes: { type: Number, default: 0 },
    editedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// helpful for queries
commentSchema.index({ postId: 1, parentId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
