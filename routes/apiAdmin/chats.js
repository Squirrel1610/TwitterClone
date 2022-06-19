const router = require("express").Router();
const Chat = require("../../schemas/ChatSchema");
const middleware = require("../../middleware");

//lấy ra toàn bộ cuộc trò chuyện
router.get("/getAll", middleware.authAdmin, async (req, res) => {
  try {
    const chats = await Chat.find({})
      .select("-chatName -users")
      .populate("latestMessage");

    return res.json({
      status: 200,
      success: true,
      msg: "Get all chats successfully",
      data: chats,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get all chats",
    });
  }
});

//lấy ra thông tin cuộc trò chuyện
router.get("/:chatId/info", middleware.authAdmin, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId })
      .select("-latestMessage")
      .populate("users");

    return res.json({
      status: 200,
      success: true,
      msg: "Get info chat successfully",
      data: chat,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get info chat",
    });
  }
});

module.exports = router;
