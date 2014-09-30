var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));
app.use(express.static('files'));

app.get('/', function(request, response){
	response.sendFile(__dirname + '/public/index.html');
});


var connectedUsers = 0;

io.on('connection', function(socket){
	console.log('User connected.');
	connectedUsers++;
	io.emit('users', connectedUsers);
	socket.on('click', function(obj){
		console.log("User " + obj.userID + " clicked the canvas at x:" + obj.x + ", y:" + obj.y + " color: " + obj.color + " and an ID of:" + obj.uniqueTimestamp);
		io.emit('click', obj);
	});
	socket.on('disconnect', function(){
		connectedUsers--;
		console.log("User disconnected. Total users:"+connectedUsers);
		io.emit('users', connectedUsers);
	});
});

http.listen(3000, function(){
	console.log('listening on port 3000');
});