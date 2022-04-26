const express = require("express");
const router = express.Router();

router.get("/:id", async (req, res, next) => {
  var payload = {
    pageTitle: "View Post",
    userLoggedIn: req.session.user,
    userLoggedInJS: JSON.stringify(req.session.user),
    postId: req.params.id,
  };

  res.status(200).render("postPage", payload);
});

module.exports = router;
