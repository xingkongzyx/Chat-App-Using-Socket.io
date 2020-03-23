// 用于发送信息到另一端的方程
const generateMessage = (username, text) => {
	return {
        username,
		text,
		// 得到创建信息时的时间印记
		createdAt: new Date().getTime()
	};
};

// 用于发送location信息到另一端的方程
const generateLocationMessage = (username,url) => {
	return { username, url, createdAt: new Date().getTime() };
};
module.exports = { generateMessage, generateLocationMessage };
