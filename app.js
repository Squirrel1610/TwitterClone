const express = require("express");
const { dirname } = require("path");
const port = 3000;
const app = express();
const path = require("path");

//template engine
app.set("view engine", "pug");
app.set("views", "views");

//static file
app.use(express.static(path.resolve(__dirname, "public")));

//middleware
const middleware = require("./middleware");

//routes
const registerRoute = require("./routes/registerRoutes");
const loginRoute = require("./routes/loginRoutes");

app.use("/register", registerRoute);
app.use("/login", loginRoute);

app.get("/", middleware.requireLogin, (req, res) => {
  var payload = {
    pageTitle: "Home",
  };

  res.status(200).render("home", payload);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
