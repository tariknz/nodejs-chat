var app = require('http').createServer(handler)
   , io = require('socket.io').listen(app)
   , fs = require('fs');

app.listen(3000);

//this is for hosting the client page
function handler (req, res) {
  fs.readFile(__dirname + '/chat.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading chat.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

//store number of connections
var connections = 0;

io.sockets.on('connection', function (socket) {
  connections++;

  //after connect, show number of users connected. this is broadcasted to everyone (io.sockets.emit)
  io.sockets.emit('m', 'user connected - number of users = ' + connections);

  socket.on('disconnect', function () {
    connections--;
    //on disconnect, broadcast everyone (except the socket disconnected, socket.broadcast.emit) the new number of users connected
    socket.broadcast.emit('m', 'user disconnected - number of users = ' + connections);
  });

  //when user joins, set the nickname to their socket
  socket.on('login', function(nickname){
    //set name
    socket.nickname = nickname;

    //tell the client (only the person newly connected) that they logged in succesfully
    socket.emit('logged-in',true);
  });


  //recieve chat messages, broadcast message to everyone.
  socket.on('message', function (msg) {
    io.sockets.emit('update', { nickname: socket.nickname, message: msg });
  });
});

