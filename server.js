const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const players = {};

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on('connection', (socket) => {
  console.log('user connected');
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
  };
  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', players[socket.id]);
  socket.on('disconnect', () => {
    delete players[socket.id];

    io.emit('disconnect', socket.id);
    console.log('user disconnected');
  });
  socket.on('playerMovement', (playerInfo) => {
    players[socket.id].y = playerInfo.y;
    players[socket.id].x = playerInfo.x;
    players[socket.id].rotation = playerInfo.rotation;
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
});


server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});
