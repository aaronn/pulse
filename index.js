var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 3000));
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

		// Verify ALL values or risk random injections.
		if (hexToRgb(obj.color) === null){
			return;
		}
		if (isNaN(obj.uniqueTimestamp)){
			return;
		}
		if (obj.userID.length > 5){
			return;
		}
		if (isNaN(obj.x) || isNaN(obj.y)){
			return;
		}
		
		io.emit('click', obj);
	});
	socket.on('disconnect', function(){
		connectedUsers--;
		console.log("User disconnected. Total users:"+connectedUsers);
		io.emit('users', connectedUsers);
	});
});

http.listen(app.get('port'), function(){
	console.log('listening on port ' + app.get('port'));
});

/* These mostly exist to check againsat injections */

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}