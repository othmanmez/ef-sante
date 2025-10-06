const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('Client connecté:', socket.id);
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
