const express = require("express");

const app = express();

app.use("public");

const port = 3000;
app.listen(port, () => {
	console.log("Server Connected to port ", port);
});
