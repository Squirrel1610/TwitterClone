const router = require("express").Router();
const User = require("../../schemas/UserSchema");
const Post = require("../../schemas/PostSchema");
const Chat = require("../../schemas/ChatSchema");
const middleware = require("../../middleware");

//các lượt đăng ký tài khoản gần đây
router.get(
  "/registeredUser/recently",
  middleware.authAdmin,
  async (req, res) => {
    try {
      const now = new Date();

      var users = await User.find({ role: false }).select(
        "-likes -retweets -following -followers -password"
      );

      var data = [];

      for (let i = 0; i < users.length; i++) {
        var days = get_day_of_time(users[i].createdAt, now);

        if (days <= 3) {
          data.push(users[i]);
        }
      }

      return res.json({
        status: 200,
        success: true,
        msg: "Statistics recently registered users",
        data,
      });
    } catch (error) {
      console.log(error.message);
      return res.json({
        status: 400,
        success: false,
        msg: "Failed to statistics recently registered users",
      });
    }
  }
);

//thống kê số lượng người tham gia vào mạng xã hội từng tháng trong năm hiện tại
router.get(
  "/registeredUser/monthly",
  middleware.authAdmin,
  async (req, res) => {
    try {
      const monthly = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const year_now = new Date().getFullYear();

      var statistics = await User.aggregate([
        {
          $project: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
        },
        {
          $match: {
            month: { $in: monthly },
            year: { $eq: year_now },
          },
        },
        {
          $group: {
            _id: "$month",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      for (let i = 0; i < statistics.length; i++) {
        if (monthly.includes(statistics[i]._id)) {
          var index = monthly.indexOf(statistics[i]._id);
          monthly.splice(index, 1);
        }
      }

      var missing_statistics = [];
      for (let i = 0; i < monthly.length; i++) {
        missing_statistics.push({
          _id: monthly[i],
          count: 0,
        });
      }

      var monthlyRegisteredUsers = statistics.concat(missing_statistics);

      monthlyRegisteredUsers.sort((a, b) => a._id - b._id);

      return res.json({
        status: 200,
        success: true,
        msg: "Statistics monthly registered users successfully",
        data: monthlyRegisteredUsers,
      });
    } catch (error) {
      console.log(error.message);
      return res.json({
        status: 400,
        success: false,
        msg: "Failed to statistics monthly registered users",
      });
    }
  }
);

//lấy ra tổng số lượng người tham gia mạng xã hội, tổng bài đăng và tổng cuộc trò chuyện
router.get("/sum/user_post_chat", middleware.authAdmin, async (req, res) => {
  try {
    var sum_of_users = await User.aggregate([
      { $match: { role: false } },
      { $group: { _id: "sum_of_users", count: { $sum: 1 } } },
    ]);

    var sum_of_posts = await Post.aggregate([
      { $group: { _id: "sum_of_posts", count: { $sum: 1 } } },
    ]);

    var sum_of_chats = await Chat.aggregate([
      { $group: { _id: "sum_of_chats", count: { $sum: 1 } } },
    ]);

    return res.json({
      status: 200,
      success: true,
      msg: "Get sum of users, posts, chats successfully",
      data: { users: sum_of_users, posts: sum_of_posts, chats: sum_of_chats },
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get sum of users, posts, chats",
    });
  }
});

//Lấy ra danh sách những người dùng đăng trên 5 bài tweet trong 1 tuần và sắp xếp
router.get("/listTotalPostsOfEachUserInAWeek/", async (req, res, next) => {
  try {
    const now = new Date();
    var listTotalPostsOfEachUser = await Post.aggregate([
      {
        $project: {
          postedBy: 1,
          // range: get_day_of_time("$createdAt", now),
        },
      },
      // {
      //   $match: {
      //     range: { $lte: 7 },
      //   },
      // },
      {
        $group: {
          _id: "$postedBy",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
    ]);

    return res.json({
      status: 200,
      success: true,
      msg: "Get list total posts of each user in a week",
      data: listTotalPostsOfEachUser,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get list total posts of each user in a week",
    });
  }
});

const get_day_of_time = (d1, d2) => {
  let ms1 = d1.getTime();
  let ms2 = d2.getTime();
  return Math.ceil((ms2 - ms1) / (24 * 60 * 60 * 1000));
};

module.exports = router;
