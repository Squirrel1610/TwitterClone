const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/images/" });
const Post = require("../../schemas/PostSchema");
const User = require("../../schemas/UserSchema");
const Notification = require("../../schemas/NotificationSchema");
const path = require("path");
const fs = require("fs");

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

  if (!isFollowing) {
    await Notification.insertNotification(
      userId,
      req.session.user._id,
      "follow",
      req.session.user._id
    );
  }

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

//upload profile picture
router.post(
  "/profilePicture",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("No file uploaded with ajax request");
      return res.sendStatus(400);
    }
    console.log(req.file);

    // var extFile = req.file.originalname
    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error != null) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { profilePic: filePath },
        { new: true }
      );
      res.sendStatus(200);
    });
  }
);

//upload cover photo
router.post(
  "/coverPhoto",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("No file uploaded with ajax request");
      return res.sendStatus(400);
    }

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error != null) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { coverPhoto: filePath },
        { new: true }
      );
      res.sendStatus(200);
    });
  }
);

//search user
router.get("/", async (req, res, next) => {
  var searchObj = req.query;
  if (searchObj.search !== undefined) {
    searchObj = {
      role: false,
      $or: [
        { firstName: { $regex: searchObj.search, $options: "i" } },
        { lastName: { $regex: searchObj.search, $options: "i" } },
        { username: { $regex: searchObj.search, $options: "i" } },
        { email: { $regex: searchObj.search, $options: "i" } },
      ],
    };
  }

  await User.find(searchObj)
    .then((results) => res.status(200).send(results))
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

module.exports = router;
