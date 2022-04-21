const mongoose = require("mongoose");

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(process.env.MONGODB_URL)
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
