const mongoose = require("mongoose");

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(
        "mongodb+srv://thinh:dthinh1610@cluster0.w5y8m.mongodb.net/twitter_clone"
      )
      .then(() => {
        console.log("MongoDB connected successfully");
      })
      .catch((err) => {
        console.log("Failed to connect to MongoDB");
        console.log(err);
      });
  }
}

module.exports = new Database();
