const router = require("express").Router();
const User = require("../../schemas/UserSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const middleware = require("../../middleware");

//đăng ký tài khoản admin
router.post("/register", async (req, res) => {
  try {
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password.trim();

    if (firstName && lastName && username && email && password) {
      var user = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });

      if (user == null) {
        var hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          firstName,
          lastName,
          username,
          email,
          password: hashedPassword,
          role: true,
        });

        await newUser.save();

        return res.json({
          status: 200,
          success: true,
          msg: "Register admin account successfully",
        });
      } else {
        if (email == user.email) {
          return res.json({
            status: 400,
            success: false,
            msg: "Email already in use",
          });
        }

        if (username == user.username) {
          return res.json({
            status: 400,
            success: false,
            msg: "Username already in use",
          });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to register ",
    });
  }
});

//đăng nhập tài khoản admin
router.post("/login", async (req, res) => {
  try {
    var { email, password } = req.body;

    if (req.body.email && req.body.password) {
      var user = await User.findOne({
        $or: [{ username: email }, { email: email }],
      });
      //neu co email hay username thi kiem tra phan quyen
      if (user) {
        if (user.role == true) {
          var isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.json({
              status: 400,
              success: false,
              msg: "Incorrect password.",
            });
          }

          var accessToken = createAccessToken({ id: user._id, role: true });
          var refreshToken = createRefreshToken({ id: user._id, role: true });

          //lưu vào cookie
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, //7d
          });

          return res.json({
            status: 200,
            success: true,
            accessToken,
            msg: "Login successfully",
          });
        } else {
          return res.json({
            status: 400,
            success: false,
            msg: "Wrong email or username",
          });
        }
      } else {
        return res.json({
          status: 400,
          success: false,
          msg: "User does not exist.",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to login",
    });
  }
});

//đăng xuất tài khoản admin
router.delete("/logout", async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      path: "/",
    });

    return res.json({
      status: 200,
      success: true,
      msg: "Logged out success",
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      msg: "Failed to log out",
    });
  }
});

//refresh token
router.get("/refreshToken", async (req, res) => {
  try {
    const rf_token = req.cookies.refreshToken;
    if (!rf_token) {
      console.log(rf_token);
      return res.json({
        status: 400,
        success: false,
        msg: "Please Login or Register",
      });
    }

    jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.json({
          status: 400,
          success: false,
          msg: "Please Login or Register",
        });
      }

      const accessToken = createAccessToken({ id: user.id, role: user.role });

      res.json({
        status: 200,
        success: true,
        msg: "Login Successfully",
        accessToken,
      });
    });
  } catch (err) {
    console.log(err.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to refresh token",
    });
  }
});

//Lấy ra toàn bộ người dùng twitter trừ admin
router.get("/getAllCustomer", middleware.authAdmin, async (req, res, next) => {
  try {
    const users = await User.find({
      role: false,
    }).select("-password -likes -following -followers -retweets");

    return res.json({
      status: 200,
      success: true,
      msg: "Get all users use Twitter successfully",
      data: users,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get all users",
    });
  }
});

//Lấy ra thông tin người dùng
router.get("/:userId/info", middleware.authAdmin, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    var user = await User.findOne({ _id: userId }).select(
      "-password -likes -following -followers -retweets"
    );

    return res.json({
      status: 200,
      success: true,
      msg: "Get info of user with id " + userId + " successfully",
      data: user,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get info",
    });
  }
});

//lấy ra danh sách following của người dùng
router.get("/:userId/followingList", middleware.authAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    var user = await User.findOne({ _id: userId }).select("following");

    var followingList = user.following;

    var list = [];

    for (let i = 0; i < followingList.length; i++) {
      var infoUser = await User.findOne({ _id: user.following[i] }).select(
        "-password -likes -following -followers -retweets"
      );
      list.push(infoUser);
    }

    return res.json({
      status: 200,
      success: true,
      msg: "Get list following of user successfully",
      data: list,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get list following",
    });
  }
});

//lấy ra danh sách followers của người dùng
router.get("/:userId/followersList", middleware.authAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    var user = await User.findOne({ _id: userId }).select("followers");

    var followersList = user.followers;

    var list = [];

    for (let i = 0; i < followersList.length; i++) {
      var infoUser = await User.findOne({ _id: user.followers[i] }).select(
        "-password -likes -following -followers -retweets"
      );
      list.push(infoUser);
    }

    return res.json({
      status: 200,
      success: true,
      msg: "Get list followers of user successfully",
      data: list,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      msg: "Failed to get list followers",
    });
  }
});

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = router;
