console.log('🚀 Starting EF HEALTH server...');

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

console.log('✅ Dependencies loaded successfully');

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
app.use(express.static('.', { index: false })); // Éviter les conflits avec index.html

// Route pour servir l'index à la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour la page quiz
app.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

// Routes explicites pour les fichiers critiques
app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'style.css'));
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

// Fonction pour obtenir le message de score
function getScoreMessage(score) {
    if (score >= 24 && score <= 27) {
        return {
            level: "Excellent health!",
            emoji: "🌿",
            message: "Congratulations! You have excellent health habits that you maintain consistently. Your lifestyle choices show a strong commitment to your well-being.",
            advice: "Keep up the fantastic work! Continue maintaining these healthy habits and consider sharing your knowledge with others. You're a great example of healthy living."
        };
    } else if (score >= 18 && score <= 23) {
        return {
            level: "Good health, room for improvement.",
            emoji: "🙂",
            message: "You have a good foundation of healthy habits, but there's definitely room for improvement. You're on the right track!",
            advice: "Focus on the areas where you scored lower. Try to gradually improve one habit at a time. Small, consistent changes can make a big difference in your overall health."
        };
    } else if (score >= 9 && score <= 17) {
        return {
            level: "Health habits need improvement.",
            emoji: "⚠️",
            message: "Your health habits need significant improvement. Don't worry - it's never too late to start making positive changes!",
            advice: "Start with small, achievable goals. Focus on one or two habits at a time. Consider consulting with a healthcare professional for personalized advice on improving your lifestyle."
        };
    } else {
        return {
            level: "Critical health habits.",
            emoji: "🚨",
            message: "Your current health habits are concerning and need immediate attention. Your health is at risk.",
            advice: "Please consult with a healthcare professional immediately. Start making small changes today - even small improvements can have a significant impact on your health."
        };
    }
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
        console.log('Recherche de la partie:', gameId, 'Parties disponibles:', Array.from(games.keys()));
        const game = games.get(gameId);
        
        if (!game) {
            socket.emit('game-error', { message: 'Game not found' });
            return;
        }
        
        if (game.status === 'playing' || game.status === 'finished') {
            socket.emit('game-error', { message: 'Game already started or finished' });
            return;
        }
        
        // Réactiver la partie si elle était inactive
        if (game.status === 'inactive') {
            game.status = 'waiting';
            console.log('Partie réactivée:', gameId);
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
                    player.isFinished = true;
                    console.log('Score calculé pour', player.name, ':', player.score);
                    
                    // Vérifier si tous les joueurs ont fini
                    const allPlayers = Array.from(game.players.values());
                    const finishedPlayers = allPlayers.filter(p => p.isFinished);
                    
                    if (finishedPlayers.length === allPlayers.length) {
                        // Tous les joueurs ont fini, envoyer les résultats finaux
                        game.status = 'finished';
                        const finalScores = allPlayers.map(p => ({
                            name: p.name,
                            score: p.score,
                            answers: p.answers,
                            scoreMessage: getScoreMessage(p.score)
                        })).sort((a, b) => b.score - a.score);
                        
                        console.log('Tous les joueurs ont fini, envoi des résultats finaux');
                        io.to(playerData.gameId).emit('game-finished', finalScores);
                    }
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
                
                // Si plus de joueurs, marquer la partie comme inactive mais la garder un moment
                if (game.players.size === 0) {
                    game.status = 'inactive';
                    console.log('Partie marquée comme inactive:', playerData.gameId);
                    
                    // Supprimer la partie après 5 minutes d'inactivité
                    setTimeout(() => {
                        if (games.has(playerData.gameId) && games.get(playerData.gameId).players.size === 0) {
                            games.delete(playerData.gameId);
                            console.log('Partie supprimée après timeout:', playerData.gameId);
                        }
                    }, 5 * 60 * 1000); // 5 minutes
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3301;
console.log(`🔧 Attempting to start server on port ${PORT}`);

server.listen(PORT, () => {
    console.log(`🚀 Serveur EF HEALTH démarré sur le port ${PORT}`);
    console.log(`📱 Accédez au site: http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('❌ Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try a different port.`);
    }
});
