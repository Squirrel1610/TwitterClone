const express = require("express");
const router = express.Router();
const User = require("../../schemas/UserSchema");
const Chat = require("../../schemas/ChatSchema");
const Message = require("../../schemas/MessageSchema");

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
  Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
    .populate("users")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      if (
        req.query.unreadOnly !== undefined &&
        req.query.unreadOnly == "true"
      ) {
        results = results.filter((r) => {
          if (r.latestMessage !== undefined)
            return !r.latestMessage.readBy.includes(req.session.user._id);
        });
      }

      results = await User.populate(results, { path: "latestMessage.sender" });
      res.status(200).send(results);
    })
    .catch((error) => {
      console.log(error);
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

router.get("/:chatId/messages", async (req, res, next) => {
  await Message.find({ chat: req.params.chatId })
    .populate("sender")
    .then((results) => res.status(200).send(results))
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

module.exports = router;
