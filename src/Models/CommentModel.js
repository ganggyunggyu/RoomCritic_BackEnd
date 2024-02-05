import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  PostId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Post',
  },
  comment: {
    type: String,
    require: true,
  },
  createTime: {
    type: Date,
    default: Date.now,
  },
});

const Comment = new mongoose.Schema('Comment', commentSchema);

export default Comment;
