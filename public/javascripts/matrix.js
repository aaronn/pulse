/*
By Aaron Ng in 2014
http://aaron.ng;
http://www.twitter.com/aaronykng;

Do whatever you want with these files, would be nice if you linked back to me or let me know though!
*/

$(document).ready(function() {
    var socket = io();
    var currentUserID = makeid();
    var circles = {};
    var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    $('.colored').css('color', randomColor);

    $(document).click(function(e) {
        var x = e.clientX - 10;
        var y = e.clientY - 10;

        var uniqueTimestamp = (new Date).getTime();

        //Emit!
        socket.emit('click', {
            'userID': currentUserID,
            'x': x,
            'y': y,
            'uniqueTimestamp': uniqueTimestamp,
            'color': randomColor
        });
    });

    // On receive
    socket.on('click', function(obj) {
        addCircle(obj.userID, obj.x, obj.y, obj.uniqueTimestamp, obj.color);
    });

    socket.on('users', function(number) {
        setOnlineText(number);
    });

    function makeid() {
        /* via 
				http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
				*/

        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    function setOnlineText(number) {
        if (number === 1) {
            $('h2').text('There is ' + number + ' person online.');
        } else {
            $('h2').text('There are ' + number + ' people online.');
        }
    }

    function addCircle(userID, x, y, uniqueTimestamp, color) {
        // Using the userID allows us to make sure two users clicking at the same time don't cause any problems.
        $('.wrapper').append('<div id="c-' + uniqueTimestamp + '-' + userID + '" class="circle" style="left:' + x + 'px; top:' + y + 'px; background-color:' + color + '"></div><div id="p-' + uniqueTimestamp + '-' + userID + '" class="pulse" style="left:' + x + 'px; top:' + y + 'px; border: 2px solid' + color + ';"></div>');

        var circle = $("#c-" + uniqueTimestamp + "-" + userID);
        var userCircleArray = circles[userID];
        var oldCircle = null;

        if (userCircleArray && userCircleArray.length > 0) {
            oldCircle = userCircleArray[userCircleArray.length - 1];
            triggerLineDraw(oldCircle, circle, uniqueTimestamp, userID);
        }

        // Create an array of circles made by this user if one doesn't already exist.
        if (typeof circles[userID] == 'undefined') {
            circles[userID] = [];
        }

        circles[userID].push(circle);

        // Trigger our pulse after our 50ms fadeIn.
        circle.animate({
            opacity: 1
        }, 50, function() {
            triggerPulse(uniqueTimestamp, userID);
        });

    }

    function triggerLineDraw(oldCircle, newCircle, uniqueTimestamp, userID) {
        var oldCircleX = parseInt(oldCircle.css('left'), 0);
        var oldCircleY = parseInt(oldCircle.css('top'), 0);
        var newCircleX = parseInt(newCircle.css('left'), 0);
        var newCircleY = parseInt(newCircle.css('top'), 0);
        var color = oldCircle.css('background-color');

        var a = newCircleX - oldCircleX;
        var b = newCircleY - oldCircleY;
        var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

        var midPointX = oldCircleX + a;
        var midPointY = oldCircleY + b;

        var radians = Math.atan2(b, a);
        var degrees = radians * (180 / Math.PI);

        $('.wrapper').append('<div id="l-' + uniqueTimestamp + '-' + userID + '" class="line" style="left:' + (oldCircleX + 10) + 'px; top:' + (oldCircleY + 10) + 'px; background-color:' + color + '; width:0px; -ms-transform: rotate(' + degrees + 'deg); -webkit-transform: rotate(' + degrees + 'deg); transform: rotate(' + degrees + 'deg);"><div id="lf-' + uniqueTimestamp + '-' + userID + '" class="line-fill"></div></div>');

        var line = $("#l-" + uniqueTimestamp + "-" + userID);
        line.animate({
            width: c
        }, 10, function() {});
    }

    function triggerPulse(uniqueTimestamp, userID) {
        var circle = $("#c-" + uniqueTimestamp + "-" + userID);
        var pulse = $("#p-" + uniqueTimestamp + "-" + userID);
        var line = $("#l-" + uniqueTimestamp + "-" + userID);
        var lineFill = $("#lf-" + uniqueTimestamp + "-" + userID);
        lineFill.delay(500).animate({
            width: "100%",
            height: "100%"
        }, 200, function() {
            line.remove();
            lineFill.remove();
        });
        circle.delay(500).fadeOut(function() {
            // Cleanup our circles.
            circle.remove();
            pulse.remove();
            circles[userID].shift();
        });
    }
});