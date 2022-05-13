const router = require("express").Router();

const User = require("../../schemas/UserSchema");
const Chat = require("../../schemas/ChatSchema");
const Message = require("../../schemas/MessageSchema");

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

      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      }).catch((err) => console.log(err));
      res.status(201).send(message);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

module.exports = router;
