const express = require("express");
const port = 3000;
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

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

app.use("/register", registerRoute);
app.use("/login", loginRoute);

app.get("/", middleware.requireLogin, (req, res) => {
  var payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
  };

  res.status(200).render("home", payload);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
