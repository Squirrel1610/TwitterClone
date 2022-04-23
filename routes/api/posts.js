const express = require("express");
const router = express.Router();
const Post = require("../../schemas/PostSchema");
const UserSchema = require("../../schemas/UserSchema");
const User = require("../../schemas/UserSchema");
const mongoose = require("mongoose");

//select all tweet
router.get("/", async (req, res, next) => {
  Post.find({})
    .populate("postedBy")
    .sort({ createdAt: -1 })
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

//post tweet
router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    console.log("Content param not sent with request");
    return res.sendStatus(400);
  }

  var postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  Post.create(postData)
    .then(async (newPost) => {
      newPost = await User.populate(newPost, { path: "postedBy" });
      res.status(201).send(newPost);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

//like tweet
router.put("/:id/like", async (req, res, next) => {
  var postId = req.params.id;
  var userId = req.session.user._id;

  var isLiked =
    req.session.user.likes && req.session.user.likes.includes(postId);

  var option = isLiked ? "$pull" : "$addToSet";

  //insert post like
  var post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { likes: userId } },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });

  //insert user like
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { likes: postId } },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });

  res.status(200).send(post);
});

//retweet
router.post("/:id/retweet", async (req, res, next) => {
  var postId = req.params.id;
  var userId = req.session.user._id;

  //try and delete retweet
  var deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  }).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });

  var option = deletedPost != null ? "$pull" : "$addToSet";

  var repost = deletedPost;
  if (repost == null) {
    repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(
      (err) => {
        console.log(err);
        res.sendStatus(400);
      }
    );
  }

  //insert post retweet
  var post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { retweetUsers: userId } },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });

  //insert user retweet
  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { retweets: repost._id } },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });

  res.status(200).send(post);
});

module.exports = router;
