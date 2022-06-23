const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const port = process.env.PORT;

//connect mongodb
const mongoose = require("./database");

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

//socket io
const io = require("socket.io")(server, { pingTimeout: 60000 });

//template engine
app.set("view engine", "pug");
app.set("views", "views");

//static file
app.use(express.static(path.resolve(__dirname, "public")));

//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "mysecret",
    resave: true,
    saveUninitialized: false,
  })
);
const middleware = require("./middleware");

//routes
const registerRoute = require("./routes/registerRoutes");
const loginRoute = require("./routes/loginRoutes");
const logoutRoute = require("./routes/logoutRoutes");
const postRoute = require("./routes/postRoutes");
const profileRoute = require("./routes/profileRoutes");
const uploadRoute = require("./routes/uploadRoutes");
const searchRoute = require("./routes/searchRoutes");
const messagesRoute = require("./routes/messagesRoutes");
const notificationsRoute = require("./routes/notificationRoutes");

app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/logout", logoutRoute);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/uploads", uploadRoute);
app.use("/search", middleware.requireLogin, searchRoute);
app.use("/messages", middleware.requireLogin, messagesRoute);
app.use("/notifications", middleware.requireLogin, notificationsRoute);

app.get("/", middleware.requireLogin, (req, res) => {
  var payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.status(200).render("home", payload);
});

//api route
const postsApiRoute = require("./routes/api/posts");
app.use("/api/posts", postsApiRoute);
const userApiRoute = require("./routes/api/users");
app.use("/api/users/", userApiRoute);
const chatsApiRoute = require("./routes/api/chats");
app.use("/api/chats", chatsApiRoute);
const messagesApiRoute = require("./routes/api/messages");
app.use("/api/messages", messagesApiRoute);
const notificationApiRoute = require("./routes/api/notifications");
app.use("/api/notifications", notificationApiRoute);

//api admin
const userApiAdminRoute = require("./routes/apiAdmin/users");
app.use("/api/admin/user/", userApiAdminRoute);
const postApiAdminRoute = require("./routes/apiAdmin/posts");
app.use("/api/admin/post/", postApiAdminRoute);
const chatApiAdminRoute = require("./routes/apiAdmin/chats");
app.use("/api/admin/chat", chatApiAdminRoute);
const messageApiAdminRoute = require("./routes/apiAdmin/messages");
app.use("/api/admin/message", messageApiAdminRoute);
const statisticsApiAdminRoute = require("./routes/apiAdmin/statistics");
app.use("/api/admin/statistics", statisticsApiAdminRoute);

//socket io
io.on("connection", (socket) => {
  //khi nguoi dung nao dang nhap
  socket.on("setup", (userData) => {
    //join vao room cua chinh minh
    socket.join(userData._id);
    //phat su kien da ket noi
    socket.emit("connected");
  });

  //server nhan su kien join cuoc tro chuyen co ma la chatID
  socket.on("join room", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("notification received", (userId) =>
    socket.in(userId).emit("notification received")
  );

  socket.on("new message", (newMessage) => {
    var chat = newMessage.chat;

    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;
      socket.in(user._id).emit("message received", newMessage);
    });
  });
});
