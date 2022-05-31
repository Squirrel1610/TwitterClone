const router = require("express").Router();

const User = require("../../schemas/UserSchema");
const Chat = require("../../schemas/ChatSchema");
const Message = require("../../schemas/MessageSchema");
const Notification = require("../../schemas/NotificationSchema");

router.get("/", async (req, res, next) => {
  await Notification.find({
    userTo: req.session.user._id,
    notificationType: { $ne: "newMessage" },
  })
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 })
    .then((results) => res.status(200).send(results))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

//chinh thanh thong bao da duoc doc
router.put("/:id/markAsOpened", async (req, res, next) => {
  await Notification.findByIdAndUpdate(req.params.id, { opened: true })
    .then(() => res.sendStatus(204))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

//chinh tat ca thong bao da duoc doc
router.put("/markAsOpened", async (req, res, next) => {
  await Notification.updateMany(
    { userTo: req.session.user._id },
    { opened: true }
  )
    .then(() => res.sendStatus(204))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

module.exports = router;
