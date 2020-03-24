const $messageForm = document.querySelector("#messageForm");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
// 由于在html文件配置了socketio js
const socket = io();

const autoscroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild;

	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = $messages.offsetHeight;

	// Height of messages container
	const containerHeight = $messages.scrollHeight;

	// How far have I scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

// parse从表格传递过来的query string,并将其变为object形式,由key:value组成
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
});

socket.on("message", message => {
	console.log(message);
	// Compile the template with data
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		// 接收的是message object, 包含 message === {text:String,createdAt:timeStamp}
		createdAt: moment(message.createdAt).format(
			"dddd, MMMM Do YYYY, h:mm:ss a"
		)
	});
	// add html to document
	$messages.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

// client listen for locationMessage event
socket.on("locationMessage", message => {
	// 接收的是url object, 包含 url === {url:String,createdAt:timeStamp}
	console.log(message);
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		locationURL: message.url,
		createdAt: moment(message.createdAt).format(
			"dddd, MMMM Do YYYY, h:mm:ss a"
		)
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

socket.on("roomData", ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	});
	document.querySelector("#sidebar").innerHTML = html;
});

// set up event listener for form submission
$messageForm.addEventListener("submit", event => {
	const messageInput = event.target.elements.message.value;
	event.preventDefault();
	// 当信息发送过程中不允许继续发送下一条信息
	$messageFormButton.setAttribute("disabled", "disabled");
	// Emit sendMessage event && set up the client acknowledgement function
	socket.emit("sendMessage", messageInput, error => {
		// 当确认event被acknowledged，enable the button
		$messageFormButton.removeAttribute("disabled");
		// 清除input的值，并使焦点重新聚集到input上
		$messageFormInput.value = "";
		$messageFormInput.focus();

		if (error) {
			return alert(error);
		}
		// Console log when acknowledged
		console.log("The message was delivered!");
	});
});

$sendLocationButton.addEventListener("click", () => {
	// 如果使用的browser不支持此项服务
	if (!navigator.geolocation) {
		return alert(
			"Do not have location service, please change another browser"
		);
	}
	// 在获取到位置之前disable the button
	$sendLocationButton.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition(position => {
		const { latitude, longitude } = position.coords;
		// Client emit snedLocation event && set up the client acknowledgement function
		socket.emit("sendLocation", { latitude, longitude }, error => {
			if (error) {
				return alert(error);
			}
			console.log("location shared!");
			// 在进入到acknowledge callback之后启动button
			$sendLocationButton.removeAttribute("disabled");
		});
	});
});

// 从client向server发送event伴随username和room, 第三个参数是acknowledge callback
socket.emit("join", { username, room }, error => {
	if (error) {
		alert(error);
		// 返回首页
		location.href = "/";
	}
});
