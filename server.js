// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var DATABASE_URL = 'postgres://zzvwibhgnedgne:zF2X2QzoIN0MxshBTG-msAwfP_@ec2-54-235-151-252.compute-1.amazonaws.com:5432/davspgo10uhqnb?ssl=true'
var db_url = process.env.DATABASE_URL || DATABASE_URL;


var wolfram = require('wolfram').createClient("KXK5UH-4889P8PXHH");

// wolfram.query("integrate 2x", function(err, result) {
//   if(err) throw err
//   console.log("Result: %j", result)
// });

/*var pg = require('pg');

pg.connect(db_url, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
      .query('SELECT table_schema,table_name FROM information_schema.tables;')
      .on('row', function(row) {
        console.log(JSON.stringify(row));
      });
});*/

server.listen(port, function () {
  console.log('Server listening at http://localhost:%d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));


// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;
io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'

    wolfram.query(data, function(err, result) {
        if(err) throw err
        socket.emit('search', {
          username: 'Alexa',
          message:  result
        });
        //console.log("Result: %j", result)
      });
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data 
    });

    
  });

  socket.on('new message by bot', function (data) {
    //we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: "Alexa",
      message:  data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    if(!usernames[username]){
        usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers

    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
    }
  
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
