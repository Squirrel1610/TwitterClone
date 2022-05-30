const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notificationType: String,
    opened: {
      type: Boolean,
      default: false,
    },
    entityId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

NotificationSchema.statics.insertNotification = async (
  userTo,
  userFrom,
  notificationType,
  entityId
) => {
  var data = {
    userTo,
    userFrom,
    notificationType,
    entityId,
  };

  await Notification.deleteOne(data).catch((err) => console.log(err));
  return Notification.create(data).catch((err) => console.log(err));
};

var Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
