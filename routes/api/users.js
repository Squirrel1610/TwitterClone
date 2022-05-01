const express = require("express");
const router = express.Router();
const Post = require("../../schemas/PostSchema");
const User = require("../../schemas/UserSchema");

//follow user
router.put("/:userId/follow", async (req, res, next) => {
  var userId = req.params.userId;

  var user = await User.findById(userId);

  if (user == null) {
    return res.sendStatus(404);
  }

  var isFollowing =
    user.followers && user.followers.includes(req.session.user._id);

  var option = isFollowing ? "$pull" : "$addToSet";

  //following of current user
  req.session.user = await User.findByIdAndUpdate(
    req.session.user._id,
    { [option]: { following: userId } },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });

  //followers of the following user
  await User.findByIdAndUpdate(
    userId,
    { [option]: { followers: req.session.user._id } },
    { new: true }
  ).catch((err) => {
    console.log(err);
    res.sendStatus(400);
  });

  res.status(200).send(req.session.user);
});

router.get("/:userId/following", async (req, res, next) => {
  await User.findById(req.params.userId)
    .populate("following")
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

router.get("/:userId/followers", async (req, res, next) => {
  await User.findById(req.params.userId)
    .populate("followers")
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

module.exports = router;