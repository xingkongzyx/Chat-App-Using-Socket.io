// 由于在html文件配置了socketio js
const socket = io();

socket.on("message", message => {
	console.log(message);
});

const $messageForm = document.querySelector("#messageForm");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");

// set up event listener for form submission
$messageForm.addEventListener("submit", event => {
	const messageInput = event.target.elements.message.value;
    event.preventDefault();
    // 当信息发送过程中不允许继续发送下一条信息
    $messageFormButton.setAttribute("disabled", "disabled")
	// Emit sendMessage event && set up the client acknowledgement function
	socket.emit("sendMessage", messageInput, error => {
        // 当确认event被acknowledged，enable the button
        $messageFormButton.removeAttribute("disabled");
        // 清除input的值，并使焦点重新聚集到input上
        $messageFormInput.value = ""
        $messageFormInput.focus();

		if (error) {
			return console.log(error);
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
		socket.emit("sendLocation", { latitude, longitude }, () => {
            console.log("location shared!");
            // 在进入到acknowledge callback之后启动button
            $sendLocationButton.removeAttribute("disabled")
		});
	});
});
