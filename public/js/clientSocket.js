var connected = false;

var socket = io("http://localhost:3000");

//su kien setup khi nguoi dung dang nhap
socket.emit("setup", userLoggedIn);

//khi nhan su kien ket noi
socket.on("connected", () => {
  connected = true;
});

socket.on("message received", (newMessage) => messageReceived(newMessage))
