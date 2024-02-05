import express from 'express';
import Post from '../Models/PostModel.js';
import User from '../Models/UserModel.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const reviewData = req.body.reviewData;
    const newPost = new Post({
      userId: reviewData.userId,
      userName: reviewData.userName,
      review: reviewData.review,
      addReview: reviewData.addReview,
      grade: reviewData.grade,
      contentPosterImg: reviewData.contentPosterImg,
      contentBackdropImg: reviewData.contentBackdropImg,
      contentName: reviewData.contentName,
      contentId: reviewData.contentId,
      contentType: reviewData.contentType,
    });
    await newPost.save();
    await User.updateOne({ _id: reviewData.userId }, { $inc: { posts: 1 } });
    return res.status(200).json({ message: '게시글 생성 완료' });
  } catch (err) {
    console.log(err);
  }
});

router.delete('/delete', async (req, res) => {});

router.post('/review', async (req, res) => {
  const posts = await Post.find({
    contentId: req.body.contentId,
    contentType: req.body.contentType,
  }).sort({ createTime: -1 });
  return res.status(200).json({
    reviews: posts,
  });
});
//홈화면에 보여줄 리뷰
router.get('/review', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createTime: -1 }).limit(10);

    return res.status(200).json({
      reviews: posts,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/myreview/:userId', async (req, res) => {
  const userId = req.params.userId;
  const posts = await Post.find({ userId: userId });
  console.log('myPage Posts : ', posts);

  return res.status(200).json({
    reviews: posts.sort((a, b) => {
      return b.createTime - a.createTime;
    }),
  });
});

router.get('/review/:userId/:reviewId', async (req, res) => {
  console.log(req.params.reviewId);
  const reviewId = req.params.reviewId;
  const post = await Post.findById(reviewId).sort({ createTime: -1 }).limit(10);

  return res.status(200).json({ review: post });
});

router.get('/review/tv', async (req, res) => {
  const posts = await Post.find({ contentType: 'tv' }).sort({ createTime: -1 }).limit(10);

  return res.status(200).json({ tvContentReviews: posts });
});
router.get('/review/movie', async (req, res) => {
  const posts = await Post.find({ contentType: 'movie' }).sort({ createTime: -1 }).limit(10);

  return res.status(200).json({ movieContentReviews: posts });
});

export default router;
