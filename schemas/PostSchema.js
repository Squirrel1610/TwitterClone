const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinned: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Post", PostSchema);
