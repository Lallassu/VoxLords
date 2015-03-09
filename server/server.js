//======================================================
// File: server.js
// Descr: Nodejs test server for VoxLords
// 
// Author: Magnus Persson
// Date: 2014-01-31
//======================================================
//======================================================
// Configuration
//======================================================
var version = "0.1";
var port = 8081;

//======================================================
// Initialization
//======================================================
var server = require("http");

server = server.createServer(Handler);
var io = require("socket.io").listen(server); 
io = io.sockets.on("connection", SocketHandler);
var fs = require("fs");
var path = require("path");
var logger = require('util');
var sys = require('sys');
server.listen(port);

console.log("===================================");
console.log("Server for VoxLords");
console.log("Author: nergal");
console.log("Version: "+version);
console.log("===================================");
logger.log("Started server on port "+port);

//PlayerSync();


//======================================================
//
// Server only stuff
//
//======================================================
// Socket handler
function SocketHandler(socket, data) {
    var ip = socket.handshake.address;
    logger.log("Incoming connection from "+ip.address+":"+ip.port);
}

//======================================================
//
// Handler for web requests (webserver)
//
//======================================================
function Handler(req, res)
{                     
//console.log("REQUEST: "+req.url);
    var file = ".." + req.url;
    if(file === "../") {
	file = "../index.html";
    }
    var name = path.extname(file);
    var contentType;
    switch(name) {
    case '.html':
    case '.htm':
	contentType = 'text/html';
	break;
    case '.js':
	contentType = 'text/javascript';
	break;
    case '.css':
	contentType = 'text/css';
	break;
    case '.png':
	contentType = 'image/png';
	break;
    case '.jpg':
	contentType = 'image/jpg';
	break;
    }
    fs.exists(file, function(exists) {
	if(exists) {
	    fs.readFile(file,function(err,data) {
		res.writeHead(200, {'Content-Type': contentType});
		res.end(data);
	    });
	} else {
	    res.writeHead(404, {'Content-Type': contentType});
	    res.end("Wizard killed the requested file with a Fireball! R.I.P "+file);
	}
    });
}
