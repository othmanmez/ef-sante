# EF HEALTH - Quiz Santé Multijoueur

Un site web de quiz santé multijoueur moderne et interactif, développé avec Node.js, Express et Socket.io.

## 🌟 Fonctionnalités

- **Mode multijoueur en temps réel** : Plusieurs joueurs peuvent jouer ensemble via un code d'accès
- **8 questions santé** : Questions sur les habitudes de vie et la santé
- **Système de scoring intelligent** : Chaque réponse donne des points selon l'impact sur la santé
- **Interface moderne** : Design bleu/rose pastel inspiré du bien-être
- **Responsive** : Compatible mobile et ordinateur
- **Synchronisation temps réel** : Mise à jour instantanée des scores et du statut

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 14 ou supérieure)
- npm

### Installation
```bash
# Cloner ou télécharger le projet
cd ef-sante

# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

### Accès
Ouvrez votre navigateur et allez sur : `http://localhost:3000`

## 🎮 Comment jouer

1. **Rejoindre une partie** :
   - Entrez votre prénom
   - Entrez le code de la partie (partagé par l'organisateur)
   - Cliquez sur "Rejoindre la partie"

2. **Répondre aux questions** :
   - 8 questions sur vos habitudes de vie
   - Répondez à votre rythme
   - Chaque réponse est sauvegardée automatiquement

3. **Découvrir votre score** :
   - Score calculé en temps réel
   - Classement avec les autres joueurs
   - Message personnalisé selon votre score

## 📊 Système de Scoring

### Questions (1-4) - Habitudes positives
- **Toujours** : 3 points
- **Parfois** : 2 points  
- **Jamais** : 1 point

### Questions (5-8) - Habitudes négatives
- **Toujours** : 1 point (mauvais)
- **Parfois** : 2 points
- **Jamais** : 3 points (bon)

### Messages selon le score
- **20-24 points** : 🌿 "Très bonne santé !"
- **14-19 points** : 🙂 "Santé moyenne, peut mieux faire."
- **Moins de 14 points** : ⚠ "Habitudes à améliorer."

## 🛠️ Structure du Projet

```
ef-health/
├── public/
│   ├── index.html        # Page d'accueil
│   ├── quiz.html         # Page du quiz
│   ├── style.css         # Styles CSS
│   └── script.js         # Logique JavaScript
├── server.js             # Serveur Node.js
├── package.json          # Configuration npm
└── README.md            # Documentation
```

## 🎨 Design

- **Couleurs** : Bleu (#5AA9E6) et Rose (#FF99C8) pastel
- **Police** : Poppins
- **Style** : Moderne, minimaliste, inspiré du bien-être
- **Responsive** : Adapté mobile et desktop

## 🔧 Technologies Utilisées

- **Backend** : Node.js, Express
- **Temps réel** : Socket.io
- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Design** : CSS Grid, Flexbox, Animations CSS

## 📱 Compatibilité

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile (iOS, Android)
- ✅ Tablette
- ✅ Desktop

## 🚀 Déploiement

Pour déployer en production :

1. Configurez les variables d'environnement
2. Utilisez un process manager comme PM2
3. Configurez un reverse proxy (Nginx)
4. Utilisez HTTPS pour la sécurité

## 📝 Questions du Quiz

1. Manges-tu des fruits et légumes chaque jour ?
2. Bois-tu assez d'eau ?
3. Dors-tu au moins 8 heures par nuit ?
4. Fais-tu du sport chaque semaine ?
5. Manges-tu souvent du fast-food ou des sucreries ?
6. Bois-tu des boissons gazeuses ou sucrées ?
7. Prends-tu un petit-déjeuner chaque matin ?
8. Te laves-tu les mains avant de manger ?

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Ajouter de nouvelles fonctionnalités

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

---

**EF HEALTH** - Quiz Santé Multijoueur 🏥💚
