const express = require("express");
const { route } = require("../registerRoutes");
const router = express.Router();

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    console.log("Content param not sent with request");
    return res.sendStatus(400);
  }
  res.status(200).send("It worked");
});

module.exports = router;
