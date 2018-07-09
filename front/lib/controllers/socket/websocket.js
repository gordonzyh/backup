/**
 * Created by Administrator on 2015/7/31.
 */
//redis
var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var fs = require("fs");
var objConfig = JSON.parse(fs.readFileSync(basePath + "/config/config.json", "utf8"));
var port = "8080";//默认为8080
var client = require(basePath + '/config/rdb');
//log
var log = require(basePath + "/config/logHelper").helper;
var http = require("http");
var io = require("socket.io");
var hanzi = require("hanzi");
const config = require(basePath + "/config/config.json");
const palo = require(basePath + '/config/palo');
hanzi.start();
var dataManageDetail = require('../dataManageUpload');
var socketRoutes = require(basePath + "/lib/controllers/socket/socketRoutes.js");
var index = require(basePath + "/lib/controllers/index.js");

if (objConfig.socket != null) {
    port = objConfig.socket.PORT;
}
var server = http.createServer(function (request, response) {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("WebSocket Start~~~~~~~~~~~~");
    response.end("");
}).listen(port);

var socket = io.listen(server);


//服务器监控socket
socket.on("connection", function (cli) {
    socketRoutes.socketRoutes(cli)
});
