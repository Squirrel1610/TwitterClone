const express = require("express");
const port = 3000;
const app = express();

//template engine
app.set("view engine", "pug");
app.set("views", "views");

//middleware
const middleware = require("./middleware");

//routes
const loginRoute = require("./routes/loginRoutes");

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
