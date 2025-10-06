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

// Stockage des parties et joueurs
const games = new Map();
const players = new Map();

// Questions du quiz santé
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

// Fonction pour calculer le score
function calculateScore(answers) {
  let score = 0;
  answers.forEach((answer, index) => {
    if (index === 6 || index === 8) { // Questions 7 (alcohol/tobacco) et 9 (fast food) - habitudes négatives
      // Moins c'est fréquent, plus de points
      if (answer === 0) score += 1; // Always (mauvais)
      else if (answer === 1) score += 2; // Sometimes (moyen)
      else score += 3; // Never (excellent)
    } else { // Questions 1-6, 8 - habitudes positives
      // Plus c'est fréquent, plus de points
      if (answer === 0) score += 3; // Always (excellent)
      else if (answer === 1) score += 2; // Sometimes (moyen)
      else score += 1; // Never (à améliorer)
    }
  });
  return score;
}

// Fonction pour obtenir le message selon le score
function getScoreMessage(score) {
  if (score >= 24) {
    return { 
      emoji: "🌿", 
      message: "Excellent health! You have outstanding lifestyle habits that promote long-term wellness. Keep up the great work with your consistent healthy choices!",
      advice: "Continue maintaining your excellent habits: prioritize sleep, stay hydrated, keep moving regularly, and maintain your balanced diet. You're setting a great example for others!",
      color: "#4CAF50" 
    };
  } else if (score >= 18) {
    return { 
      emoji: "🙂", 
      message: "Good health foundation! You're on the right track with many positive habits, but there's room for improvement in some areas.",
      advice: "Focus on the areas where you answered 'sometimes' or 'never'. Try to make small, consistent changes: add more fruits/vegetables to your meals, establish a regular sleep schedule, or find an activity you enjoy. Remember, small steps lead to big improvements!",
      color: "#FF9800" 
    };
  } else {
    return { 
      emoji: "⚠", 
      message: "Your health habits need significant improvement. This is a great opportunity to make positive changes for your long-term wellbeing.",
      advice: "Start with one habit at a time: aim for 7-8 hours of sleep, drink more water throughout the day, add 30 minutes of movement daily, and reduce processed foods. Consider consulting a healthcare professional for personalized guidance. Remember, every positive change counts!",
      color: "#F44336" 
    };
  }
}

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log('Nouveau joueur connecté:', socket.id);

  // Créer une nouvelle partie
  socket.on('create-game', (data) => {
    const { code, name, creator } = data;
    
    if (!games.has(code)) {
      games.set(code, {
        code: code,
        name: name,
        creator: creator,
        players: new Map(),
        currentQuestion: 0,
        isActive: true,
        startTime: Date.now(),
        createdAt: new Date().toISOString()
      });
      
      console.log(`Nouvelle partie créée: ${code} par ${creator}`);
      
      // Confirmer la création
      socket.emit('game-created', {
        code: code,
        name: name,
        creator: creator
      });
    } else {
      socket.emit('game-error', {
        message: 'Ce code de partie existe déjà'
      });
    }
  });

  // Rejoindre une partie
  socket.on('join-game', (data) => {
    const { playerName, gameCode } = data;
    
    if (!games.has(gameCode)) {
      games.set(gameCode, {
        code: gameCode,
        players: new Map(),
        currentQuestion: 0,
        isActive: true,
        startTime: Date.now()
      });
    }

    const game = games.get(gameCode);
    const player = {
      id: socket.id,
      name: playerName,
      answers: [],
      score: 0,
      isFinished: false
    };

    game.players.set(socket.id, player);
    players.set(socket.id, { gameCode, playerName });

    socket.join(gameCode);
    
    // Envoyer la liste des joueurs à tous les participants
    const playersList = Array.from(game.players.values()).map(p => ({
      name: p.name,
      isFinished: p.isFinished
    }));
    
    io.to(gameCode).emit('players-updated', playersList);
    io.to(gameCode).emit('game-status', {
      currentQuestion: game.currentQuestion,
      totalQuestions: questions.length,
      isActive: game.isActive
    });

    console.log(`${playerName} a rejoint la partie ${gameCode}`);
  });

  // Répondre à une question
  socket.on('answer-question', (data) => {
    const { questionId, answer } = data;
    const playerData = players.get(socket.id);
    
    if (!playerData) return;
    
    const game = games.get(playerData.gameCode);
    if (!game) return;

    const player = game.players.get(socket.id);
    if (!player) return;

    // Enregistrer la réponse
    player.answers[questionId - 1] = answer;
    
    // Calculer le score actuel
    player.score = calculateScore(player.answers);
    
    // Vérifier si le joueur a terminé
    if (player.answers.length === questions.length) {
      player.isFinished = true;
      
      // Vérifier si tous les joueurs ont terminé
      const allFinished = Array.from(game.players.values()).every(p => p.isFinished);
      
      if (allFinished) {
        // Calculer les scores finaux et classement
        const finalScores = Array.from(game.players.values()).map(p => ({
          name: p.name,
          score: p.score,
          message: getScoreMessage(p.score)
        })).sort((a, b) => b.score - a.score);
        
        io.to(playerData.gameCode).emit('game-finished', finalScores);
        game.isActive = false;
      }
    }

    // Envoyer la mise à jour des scores
    const playersList = Array.from(game.players.values()).map(p => ({
      name: p.name,
      score: p.score,
      isFinished: p.isFinished
    }));
    
    io.to(playerData.gameCode).emit('scores-updated', playersList);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const game = games.get(playerData.gameCode);
      if (game) {
        game.players.delete(socket.id);
        
        // Envoyer la liste mise à jour des joueurs
        const playersList = Array.from(game.players.values()).map(p => ({
          name: p.name,
          isFinished: p.isFinished
        }));
        
        io.to(playerData.gameCode).emit('players-updated', playersList);
        
        // Supprimer la partie si plus de joueurs
        if (game.players.size === 0) {
          games.delete(playerData.gameCode);
        }
      }
      players.delete(socket.id);
    }
    console.log('Joueur déconnecté:', socket.id);
  });
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour la page du quiz
app.get('/quiz', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

// Route pour obtenir les questions
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Serveur EF HEALTH démarré sur le port ${PORT}`);
  console.log(`📱 Accédez au site: http://localhost:${PORT}`);
});
