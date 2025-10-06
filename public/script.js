// Variables globales
let socket;
let currentQuestion = 0;
let questions = [];
let playerName = '';
let gameCode = '';
let playerAnswers = [];
let isGameFinished = false;

// Éléments DOM
const loadingSection = document.getElementById('loadingSection');
const playersSection = document.getElementById('playersSection');
const quizSection = document.getElementById('quizSection');
const scoresSection = document.getElementById('scoresSection');
const gameFinishedSection = document.getElementById('gameFinishedSection');
const errorSection = document.getElementById('errorSection');

const playersList = document.getElementById('playersList');
const playersCount = document.getElementById('playersCount');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const questionNumber = document.getElementById('questionNumber');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const progressFill = document.getElementById('progressFill');
const scoresList = document.getElementById('scoresList');
const finalRanking = document.getElementById('finalRanking');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les données du localStorage
    playerName = localStorage.getItem('playerName');
    gameCode = localStorage.getItem('gameCode');
    
    if (!playerName || !gameCode) {
        showError('Données de connexion manquantes. Retour à l\'accueil.');
        return;
    }
    
    // Initialiser Socket.io
    socket = io();
    
    // Configurer les événements Socket.io
    setupSocketEvents();
    
    // Charger les questions
    loadQuestions();
    
    // Rejoindre la partie
    socket.emit('join-game', {
        playerName: playerName,
        gameCode: gameCode
    });
});

// Configuration des événements Socket.io
function setupSocketEvents() {
    // Mise à jour de la liste des joueurs
    socket.on('players-updated', function(players) {
        updatePlayersList(players);
    });
    
    // Mise à jour du statut de la partie
    socket.on('game-status', function(status) {
        updateGameStatus(status);
    });
    
    // Mise à jour des scores
    socket.on('scores-updated', function(scores) {
        updateScores(scores);
    });
    
    // Fin de partie
    socket.on('game-finished', function(finalScores) {
        showFinalResults(finalScores);
    });
    
    // Erreur de connexion
    socket.on('connect_error', function(error) {
        showError('Erreur de connexion au serveur.');
    });
    
    // Déconnexion
    socket.on('disconnect', function() {
        showError('Connexion perdue. Vérifiez votre connexion internet.');
    });
}

// Charger les questions depuis le serveur
async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        questions = await response.json();
        totalQuestionsSpan.textContent = questions.length;
    } catch (error) {
        console.error('Error loading questions:', error);
        showError('Unable to load quiz questions.');
    }
}

// Mettre à jour la liste des joueurs
function updatePlayersList(players) {
    playersCount.textContent = players.length;
    
    playersList.innerHTML = '';
    
    // Adapter la classe CSS selon le nombre de joueurs
    playersList.className = 'players-list';
    if (players.length === 1) {
        playersList.classList.add('single-player');
    } else if (players.length === 2) {
        playersList.classList.add('two-players');
    } else {
        playersList.classList.add('multiple-players');
    }
    
    players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        
        const statusClass = player.isFinished ? 'finished' : '';
        
        playerItem.innerHTML = `
            <div class="player-status ${statusClass}"></div>
            <span>${player.name}</span>
        `;
        
        playersList.appendChild(playerItem);
    });
    
    // Afficher la section des joueurs
    playersSection.style.display = 'block';
    
    // Ajuster la hauteur et l'espacement selon le nombre de joueurs
    if (players.length === 1) {
        playersSection.style.maxHeight = '100px';
        playersSection.style.padding = '10px 15px';
    } else if (players.length === 2) {
        playersSection.style.maxHeight = '120px';
        playersSection.style.padding = '12px 15px';
    } else if (players.length <= 4) {
        playersSection.style.maxHeight = '160px';
        playersSection.style.padding = '15px';
    } else {
        playersSection.style.maxHeight = '200px';
        playersSection.style.padding = '15px';
    }
}

// Mettre à jour le statut de la partie
function updateGameStatus(status) {
    currentQuestion = status.currentQuestion;
    currentQuestionSpan.textContent = currentQuestion + 1;
    
    // Mettre à jour la barre de progression
    const progress = ((currentQuestion + 1) / status.totalQuestions) * 100;
    progressFill.style.width = progress + '%';
    
    // Afficher la question actuelle
    if (currentQuestion < questions.length) {
        showQuestion(questions[currentQuestion]);
    }
    
    // Masquer le chargement et afficher le quiz
    loadingSection.style.display = 'none';
    quizSection.style.display = 'block';
}

// Afficher une question
function showQuestion(question) {
    // Animation de sortie
    const questionContent = document.querySelector('.question-content');
    questionContent.style.opacity = '0';
    questionContent.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        // Mettre à jour le contenu
        questionNumber.textContent = question.id;
        questionText.textContent = question.question;
        
        // Créer les options
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.textContent = option;
            optionBtn.onclick = () => selectAnswer(question.id, index);
            
            // Vérifier si cette réponse a déjà été sélectionnée
            if (playerAnswers[question.id - 1] === index) {
                optionBtn.classList.add('selected');
            }
            
            optionsContainer.appendChild(optionBtn);
        });
        
        // Animation d'entrée
        questionContent.style.opacity = '1';
        questionContent.style.transform = 'translateY(0)';
    }, 300);
}

// Sélectionner une réponse
function selectAnswer(questionId, answerIndex) {
    // Désélectionner toutes les options
    const options = optionsContainer.querySelectorAll('.option-btn');
    options.forEach(option => option.classList.remove('selected'));
    
    // Sélectionner l'option choisie
    options[answerIndex].classList.add('selected');
    
    // Enregistrer la réponse
    playerAnswers[questionId - 1] = answerIndex;
    
    // Envoyer la réponse au serveur
    socket.emit('answer-question', {
        questionId: questionId,
        answer: answerIndex
    });
    
    // Désactiver les boutons pour éviter les clics multiples
    options.forEach(option => {
        option.disabled = true;
        option.style.cursor = 'not-allowed';
    });
    
    // Passer automatiquement à la question suivante après un court délai
    setTimeout(() => {
        if (questionId < questions.length) {
            // Afficher un indicateur de transition
            showTransitionIndicator();
            
            // Passer à la question suivante après l'animation
            setTimeout(() => {
                currentQuestion = questionId;
                showQuestion(questions[currentQuestion]);
                
                // Mettre à jour l'affichage
                questionNumber.textContent = currentQuestion + 1;
                currentQuestionSpan.textContent = currentQuestion + 1;
                
                // Mettre à jour la barre de progression
                const progress = ((currentQuestion + 1) / questions.length) * 100;
                progressFill.style.width = progress + '%';
            }, 500);
        } else {
            // All questions are finished
            console.log('All questions are finished');
        }
    }, 1500); // Délai de 1.5 seconde pour voir la réponse sélectionnée
}

// Update scores (hidden during quiz)
function updateScores(scores) {
    // Scores are hidden during the quiz
    // They will only be displayed at the end
    console.log('Scores updated:', scores);
}

// Afficher les résultats finaux
function showFinalResults(finalScores) {
    isGameFinished = true;
    
    // Masquer toutes les autres sections
    loadingSection.style.display = 'none';
    playersSection.style.display = 'none';
    quizSection.style.display = 'none';
    scoresSection.style.display = 'none';
    errorSection.style.display = 'none';
    
    // Afficher la section de fin
    gameFinishedSection.style.display = 'block';
    
    // Créer le classement final
    finalRanking.innerHTML = '';
    finalScores.forEach((player, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        
        const position = index + 1;
        let positionClass = 'other';
        if (position === 1) positionClass = 'first';
        else if (position === 2) positionClass = 'second';
        else if (position === 3) positionClass = 'third';
        
        rankingItem.innerHTML = `
            <div class="ranking-position ${positionClass}">${position}</div>
            <div class="ranking-info">
                <div class="ranking-name">${player.name}</div>
                <div class="ranking-score">${player.score} points</div>
                <div class="ranking-message" style="color: ${player.message.color}">
                    ${player.message.emoji} ${player.message.message}
                </div>
                <div class="ranking-advice" style="color: ${player.message.color}">
                    💡 ${player.message.advice}
                </div>
            </div>
        `;
        
        finalRanking.appendChild(rankingItem);
    });
    
    // Animation d'entrée
    setTimeout(() => {
        const items = finalRanking.querySelectorAll('.ranking-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 200);
        });
    }, 100);
}

// Show an error
function showError(message) {
    // Hide all other sections
    loadingSection.style.display = 'none';
    playersSection.style.display = 'none';
    quizSection.style.display = 'none';
    scoresSection.style.display = 'none';
    gameFinishedSection.style.display = 'none';
    
    // Show error section
    errorSection.style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

// Fonction utilitaire pour formater le temps
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Global error handling
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
    if (!isGameFinished) {
        showError('An unexpected error occurred.');
    }
});

// Gestion de la fermeture de la page
window.addEventListener('beforeunload', function() {
    if (socket) {
        socket.disconnect();
    }
});

// Fonction pour redémarrer une partie
function restartGame() {
    // Nettoyer le localStorage
    localStorage.removeItem('playerName');
    localStorage.removeItem('gameCode');
    
    // Rediriger vers l'accueil
    window.location.href = '/';
}

// Function to share results
function shareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'EF HEALTH - My Results',
            text: `I completed the EF HEALTH quiz! Discover your health score too!`,
            url: window.location.origin
        });
    } else {
        // Fallback for browsers that don't support the Share API
        const text = `I completed the EF HEALTH quiz! Discover your health score too: ${window.location.origin}`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// Afficher un indicateur de transition
function showTransitionIndicator() {
    // Créer l'indicateur s'il n'existe pas
    let indicator = document.getElementById('transitionIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'transitionIndicator';
        indicator.className = 'transition-indicator';
        indicator.innerHTML = `
            <div class="transition-content">
                <div class="transition-spinner"></div>
                <p>Next question...</p>
            </div>
        `;
        document.querySelector('.question-container').appendChild(indicator);
    }
    
    // Afficher l'indicateur
    indicator.style.display = 'flex';
    indicator.style.opacity = '0';
    indicator.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        indicator.style.opacity = '1';
        indicator.style.transform = 'scale(1)';
    }, 50);
    
    // Masquer l'indicateur après l'animation
    setTimeout(() => {
        indicator.style.opacity = '0';
        indicator.style.transform = 'scale(0.8)';
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 300);
    }, 400);
}
