const SocketServer = require("ws").Server;
const app = require('./Modules');
const swaggerSetup = require('./swagger'); // Path to the swagger.js file
const WebsocketHandler = require('./Websocket');
require('dotenv').config();

/******************* Express HTTP server open ***********************/

swaggerSetup(app);

var Server = app.listen(8080, () => {
  console.log("Server started on port 8080");
});


const wss = new SocketServer({ server: Server, });

wss.on("connection", WebsocketHandler)
