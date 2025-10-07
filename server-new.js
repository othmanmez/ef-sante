const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir les fichiers statiques
app.use(express.static('public'));

// Route pour servir l'index à la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour la page quiz
app.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

// Socket.io
io.on('connection', (socket) => {
    console.log('Client connecté:', socket.id);
    
    socket.on('create-game', (data) => {
        console.log('Création de partie:', data);
        socket.emit('game-created', data);
    });
    
    socket.on('join-game', (data) => {
        console.log('Rejoindre partie:', data);
        socket.emit('game-joined', data);
    });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`🚀 Serveur EF HEALTH démarré sur le port ${PORT}`);
    console.log(`📱 Accédez au site: http://localhost:${PORT}`);
});
