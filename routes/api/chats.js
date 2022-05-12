const express = require("express");
const router = express.Router();
const User = require("../../schemas/UserSchema");
const Chat = require("../../schemas/ChatSchema");

//create room chat
router.post("/", async (req, res, next) => {
  if (!req.body.users) {
    console.log("Users param not send with request");
    return res.sendStatus(400);
  }

  var users = JSON.parse(req.body.users);

  if (users.length == 0) {
    console.log("Users array is empty");
    return res.sendStatus(400);
  }

  users.push(req.session.user);

  var chatData = {
    users: users,
    isGroupChat: true,
  };

  await Chat.create(chatData)
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

//get chat list
router.get("/", async (req, res, next) => {
  await Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
    .populate("users")
    .sort({ updatedAt: -1 })
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

//change chat name
router.put("/:chatId", async (req, res, next) => {
  await Chat.findByIdAndUpdate(req.params.chatId, req.body)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

router.get("/:chatId", async (req, res, next) => {
  await Chat.findOne({
    _id: req.params.chatId,
    users: { $elemMatch: { $eq: req.session.user._id } },
  })
    .populate("users")
    .then((results) => {
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

module.exports = router;
