const router = require("express").Router();
const Post = require("../../schemas/PostSchema");
const middleware = require("../../middleware");

//lấy ra danh sách bài tweet không phải reply to hay retweet từ bài tweet
router.get("/getAll", middleware.authAdmin, async (req, res) => {
  try {
    const allTweets = await Post.find({})
      .populate("postedBy")
      .select("-likes -retweetUsers -pinned");

    var tweets = [];

    for (let i = 0; i < allTweets.length; i++) {
      if (!allTweets[i].replyTo && !allTweets[i].retweetData) {
        tweets.push(allTweets[i]);
      }
    }

    return res.json({
      status: 200,
      success: true,
      msg: "Get all tweets successfully",
      data: tweets,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get all tweets",
    });
  }
});

//lấy ra thông tin bài tweet
router.get("/:postId/info", middleware.authAdmin, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findOne({ _id: postId })
      .populate("postedBy")
      .populate("likes")
      .populate("retweetUsers");

    return res.json({
      status: 200,
      success: true,
      msg: `Get tweet with id ${postId} successfully`,
      data: post,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get info tweet",
    });
  }
});

//Lấy ra những bài tweet replyTo
router.get("/replyTo/get", middleware.authAdmin, async (req, res) => {
  try {
    const allTweets = await Post.find({})
      .populate("postedBy")
      .select("-likes -retweetUsers -pinned");

    var tweets = [];

    for (let i = 0; i < allTweets.length; i++) {
      if (allTweets[i].replyTo) {
        tweets.push(allTweets[i]);
      }
    }

    return res.json({
      status: 200,
      success: true,
      msg: "Get all tweets reply successfully",
      data: tweets,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get all tweets reply",
    });
  }
});

//Lấy ra những bài tweet retweetData
router.get("/retweetData/get", middleware.authAdmin, async (req, res) => {
  try {
    const allTweets = await Post.find({})
      .populate("postedBy")
      .select("-likes -retweetUsers -pinned");

    var tweets = [];

    for (let i = 0; i < allTweets.length; i++) {
      if (allTweets[i].retweetData) {
        tweets.push(allTweets[i]);
      }
    }

    return res.json({
      status: 200,
      success: true,
      msg: "Get all tweets have retweetData successfully",
      data: tweets,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get all tweets have retweetData",
    });
  }
});

module.exports = router;
