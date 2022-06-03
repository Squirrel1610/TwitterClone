const router = require("express").Router();

const User = require("../../schemas/UserSchema");
const Chat = require("../../schemas/ChatSchema");
const Message = require("../../schemas/MessageSchema");
const Notification = require("../../schemas/NotificationSchema");

router.post("/", async (req, res, next) => {
  if (!req.body.content || !req.body.chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.session.user._id,
    content: req.body.content,
    chat: req.body.chatId,
  };

  await Message.create(newMessage)
    .then(async (message) => {
      message = await message.populate("sender");
      message = await message.populate("chat");
      message = await User.populate(message, { path: "chat.users" });

      var chat = await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      }).catch((err) => console.log(err));

      insertNotifications(chat, message);

      res.status(201).send(message);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

function insertNotifications(chat, message) {
  chat.users.forEach((userId) => {
    if (userId == message.sender._id.toString()) return;

    Notification.insertNotification(
      userId,
      message.sender._id,
      "newMessage",
      message.chat._id
    );
  });
}

//xoa het tin nhan
router.delete("/deleteAll", async (req, res) => {
  await Message.deleteMany({});
  res.status(200).json("successfully");
});

module.exports = router;
