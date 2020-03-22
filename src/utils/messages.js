// 用于发送信息到另一端的方程
const generateMessage = text => {
	return {
		text,
		// 得到创建信息时的时间印记
		createdAt: new Date().getTime()
	};
};

module.exports = { generateMessage };
