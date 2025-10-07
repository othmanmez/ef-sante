const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Servir les fichiers statiques
app.use(express.static('public'));
app.use(express.static('.'));

// Route pour servir l'index à la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour la page quiz
app.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

// Questions du quiz
const questions = [
    {
        id: 1,
        question: "Do you sleep at least 8 hours per night?",
        options: ["always", "sometimes", "never"]
    },
    {
        id: 2,
        question: "Do you eat fruits and vegetables every day?",
        options: ["always", "sometimes", "never"]
    },
    {
        id: 3,
        question: "Do you cook at home?",
        options: ["always", "sometimes", "never"]
    },
    {
        id: 4,
        question: "Do you practice any physical activity or sport?",
        options: ["always", "sometimes", "never"]
    },
    {
        id: 5,
        question: "Do you move regularly throughout the day?",
        options: ["always", "sometimes", "never"]
    },
    {
        id: 6,
        question: "Do you drink at least 1.5 liters of water per day?",
        options: ["always", "sometimes", "never"]
    },
    {
        id: 7,
        question: "Do you consume alcohol or tobacco?",
        options: ["always", "sometimes", "never"]
    },
    {
        id: 8,
        question: "Do you take time for yourself?",
        options: ["always", "sometimes", "never"]
    },
    {
        id: 9,
        question: "Do you often eat fast food?",
        options: ["always", "sometimes", "never"]
    }
];

// Route pour obtenir les questions
app.get('/api/questions', (req, res) => {
    res.json(questions);
});

// Fonction pour calculer le score
function calculateScore(answers) {
    let score = 0;
    
    answers.forEach((answer, index) => {
        const questionId = index + 1;
        
        switch(questionId) {
            case 1: // Sleep 8 hours
                if (answer === 'always') score += 3;
                else if (answer === 'sometimes') score += 2;
                break;
            case 2: // Fruits and vegetables
                if (answer === 'always') score += 3;
                else if (answer === 'sometimes') score += 2;
                break;
            case 3: // Cook at home
                if (answer === 'always') score += 3;
                else if (answer === 'sometimes') score += 2;
                break;
            case 4: // Physical activity
                if (answer === 'always') score += 3;
                else if (answer === 'sometimes') score += 2;
                break;
            case 5: // Move regularly
                if (answer === 'always') score += 3;
                else if (answer === 'sometimes') score += 2;
                break;
            case 6: // Drink water
                if (answer === 'always') score += 3;
                else if (answer === 'sometimes') score += 2;
                break;
            case 7: // Alcohol/tobacco (negative)
                if (answer === 'never') score += 3;
                else if (answer === 'sometimes') score += 1;
                break;
            case 8: // Time for yourself
                if (answer === 'always') score += 3;
                else if (answer === 'sometimes') score += 2;
                break;
            case 9: // Fast food (negative)
                if (answer === 'never') score += 3;
                else if (answer === 'sometimes') score += 1;
                break;
        }
    });
    
    return score;
}

// Stockage des parties et joueurs
const games = new Map();
const players = new Map();

// Socket.io
io.on('connection', (socket) => {
    console.log('✅ Client connecté:', socket.id);
    
    socket.on('create-game', (data) => {
        console.log('Création de partie:', data);
        
        // Créer une nouvelle partie
        const gameId = data.code;
        const game = {
            id: gameId,
            name: data.name,
            creator: data.creator,
            players: new Map(),
            status: 'waiting' // waiting, playing, finished
        };
        
        // Ajouter le créateur comme premier joueur
        const player = {
            id: socket.id,
            name: data.creator,
            socketId: socket.id,
            answers: [],
            score: 0
        };
        
        game.players.set(socket.id, player);
        players.set(socket.id, { gameId, player });
        games.set(gameId, game);
        
        socket.join(gameId);
        
        // Notifier le créateur
        socket.emit('game-created', { ...data, gameId });
        socket.emit('players-updated', Array.from(game.players.values()));
        
        console.log('Partie créée:', gameId, 'avec joueur:', data.creator);
    });
    
    socket.on('join-game', (data) => {
        console.log('Rejoindre partie:', data);
        
        const gameId = data.gameCode;
        const game = games.get(gameId);
        
        if (!game) {
            socket.emit('game-error', { message: 'Game not found' });
            return;
        }
        
        if (game.status !== 'waiting') {
            socket.emit('game-error', { message: 'Game already started or finished' });
            return;
        }
        
        // Ajouter le joueur à la partie
        const player = {
            id: socket.id,
            name: data.playerName,
            socketId: socket.id,
            answers: [],
            score: 0
        };
        
        game.players.set(socket.id, player);
        players.set(socket.id, { gameId, player });
        
        socket.join(gameId);
        
        // Notifier tous les joueurs de la partie
        io.to(gameId).emit('players-updated', Array.from(game.players.values()));
        socket.emit('game-joined', { ...data, gameId });
        
        // Envoyer les questions
        socket.emit('questions-loaded', questions);
        
        console.log('Joueur ajouté:', data.playerName, 'à la partie:', gameId);
    });
    
    socket.on('answer-question', (data) => {
        console.log('Réponse reçue:', data);
        
        const playerData = players.get(socket.id);
        if (playerData) {
            const game = games.get(playerData.gameId);
            const player = game.players.get(socket.id);
            
            if (player) {
                player.answers[data.questionId - 1] = data.answer;
                
                // Si c'est la dernière question, calculer le score
                if (data.questionId === questions.length) {
                    player.score = calculateScore(player.answers.map((answerIndex, questionIndex) => 
                        questions[questionIndex].options[answerIndex] || 'never'
                    ));
                    console.log('Score calculé pour', player.name, ':', player.score);
                }
                
                // Notifier tous les joueurs de la partie
                io.to(playerData.gameId).emit('players-updated', Array.from(game.players.values()));
            }
        }
        
        socket.emit('question-answered', { success: true });
    });
    
    socket.on('disconnect', () => {
        console.log('Client déconnecté:', socket.id);
        
        const playerData = players.get(socket.id);
        if (playerData) {
            const game = games.get(playerData.gameId);
            if (game) {
                game.players.delete(socket.id);
                players.delete(socket.id);
                
                // Notifier les joueurs restants
                io.to(playerData.gameId).emit('players-updated', Array.from(game.players.values()));
                
                // Si plus de joueurs, supprimer la partie
                if (game.players.size === 0) {
                    games.delete(playerData.gameId);
                    console.log('Partie supprimée:', playerData.gameId);
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3301;
server.listen(PORT, () => {
    console.log(`🚀 Serveur EF HEALTH démarré sur le port ${PORT}`);
    console.log(`📱 Accédez au site: http://localhost:${PORT}`);
});
