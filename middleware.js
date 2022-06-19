const User = require("./schemas/UserSchema");
const jwt = require("jsonwebtoken");

exports.requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

exports.authAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      console.log("Not found access token");
      return res.json({
        status: 400,
        success: false,
        msg: "Invalid Authentication",
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        console.log("Verify token fail");
        return res.json({
          status: 400,
          success: false,
          msg: "Invalid Authentication",
        });
      }
      var existUser = await User.findOne({
        _id: user.id,
      });
      if (existUser.role == false) {
        return res.json({
          status: 400,
          success: false,
          msg: "Only admin can access this resourse",
        });
      } else {
        req.user = user;
        next();
      }
    });
  } catch (error) {
    return res.json({
      status: 400,
      success: false,
      msg: err.message,
    });
  }
};
