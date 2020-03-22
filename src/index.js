const path = require("path");
const http = require("http");
const express = require("express");
// require时实际返回了一个function
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");

const app = express();
const server = http.createServer(app);
// 使用socketio function to configure socketio to work with a given server
// 注意这里的socketio只能接收http server所以我们上面使用http module创建server
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

// print a message when a new client connects
io.on("connection", socket => {
	console.log("server connection!");
	socket.emit("message", generateMessage("Welcome!"));
	socket.broadcast.emit("message", generateMessage("A new user joined"));

	// Server listen for sendMessage event
	socket.on("sendMessage", (messageInput, callback) => {
		const filter = new Filter();
		if (filter.isProfane(messageInput)) {
			// setup the server to send back acknowledgement and will not emit message event because of the error
			return callback("Profanity is not allowed!");
		}

		// send messages to all connected client
		io.emit("message", generateMessage(messageInput));

		// setup the server to send back acknowledgement
		callback();
	});

	// listen for sendLocation event
	socket.on("sendLocation", ({ latitude, longitude }, callback) => {
		// When fired, send an event with url to all connected clients
		io.emit(
			"locationMessage",
			`https://google.com/maps?q=${latitude},${longitude}`
		);
		// setup the server to send back acknowledgement
		callback();
	});

	// send a message when a client get disconnected
	socket.on("disconnect", () => {
		io.emit("message", generateMessage("A user has left"));
	});
});

server.listen(port, () => {
	console.log("Server Connected to port ", port);
});
