const express = require("express");
const router = express.Router();
const Chat = require("../schemas/ChatSchema");
const UserSchema = require("../schemas/UserSchema");
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
  res.status(200).render("inboxPage", {
    pageTitle: "Inbox",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  });
});

router.get("/new", (req, res, next) => {
  res.status(200).render("newMessage", {
    pageTitle: "New Message",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  });
});

router.get("/:chatId", async (req, res, next) => {
  var userId = req.session.user._id;
  var chatId = req.params.chatId;

  var isValidId = mongoose.isValidObjectId(chatId);

  var payload = {
    pageTitle: "Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  if (!isValidId) {
    payload.errorMessage =
      "This chat id does not exist or you do not have permission to view it";

    return res.status(200).render("chatPage", payload);
  }

  var chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  }).populate("users");

  if (chat == null) {
    //check if chat id is really user id
    var userFound = await UserSchema.findById(chatId);

    if (userFound != null) {
      chat = await getChatByUserId(userId, userFound._id);
    }
  }

  if (chat == null) {
    payload.errorMessage =
      "This chat id does not exist or you do not have permission to view it";
  } else {
    payload.chat = chat;
  }

  res.status(200).render("chatPage", payload);
});

function getChatByUserId(userLoggedInId, otherUserId) {
  return Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
          { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
        ],
      },
    },
    {
      //if not found it will insert
      $setOnInsert: {
        users: [userLoggedInId, otherUserId],
      },
    },
    {
      //show the chat just updated
      new: true,
      //when not found to update then insert
      upsert: true,
    }
  ).populate("users");
}

module.exports = router;
