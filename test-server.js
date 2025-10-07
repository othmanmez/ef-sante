const express = require('express');
const path = require('path');

const app = express();

// Servir les fichiers statiques
app.use(express.static('public'));

// Route pour servir l'index à la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Test serveur démarré sur le port ${PORT}`);
});
