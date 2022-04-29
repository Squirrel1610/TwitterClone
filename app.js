const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

const port = process.env.PORT;

//connect mongodb
const mongoose = require("./database");

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

app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/logout", logoutRoute);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);

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

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
