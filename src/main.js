// import * as b from "./serial2.js";
// Fix mentioned in http://tangiblejs.com/posts/nw-js-johnny-five-arduino-wicked-trio
//nw.require("nwjs-j5-fix").fix();
const server = require("./services/api.handlers.js");
const boardManager = require("./models/board.js");


server.startServer(boardManager);






