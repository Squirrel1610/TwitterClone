const router = require("express").Router();
const Message = require("../../schemas/MessageSchema");
const middleware = require("../../middleware");

router.get("/getAll", middleware.authAdmin, async (req, res) => {
  try {
    const messages = await Message.find({})
      .select("-readBy")
      .populate("sender");

    return res.json({
      status: 200,
      success: true,
      msg: "Get all messages successfully",
      data: messages,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get all messages",
    });
  }
});

router.get("/:messageId/info", async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const message = await Message.findById(messageId)
      .populate("sender")
      .populate("readBy");

    return res.json({
      status: 200,
      success: true,
      msg: "Get info message successfully",
      data: message,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get info message",
    });
  }
});

module.exports = router;
