var connected = false;

var socket = io("http://localhost:5003");

//su kien setup khi nguoi dung dang nhap
socket.emit("setup", userLoggedIn);

//khi nhan su kien ket noi
socket.on("connected", () => {
  connected = true;
});

socket.on("message received", (newMessage) => messageReceived(newMessage));

socket.on("notification received", () => {
  $.get("/api/notifications/latest", (notificationData) => {
    showNotificationPopup(notificationData);
    refreshNotificationBadge();
  });
});

function emitNotification(userId) {
  if (userId == userLoggedIn._id) return;

  socket.emit("notification received", userId);
}
