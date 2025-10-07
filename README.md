# EF HEALTH - Multiplayer Health Quiz

A real-time multiplayer health quiz application built with Node.js, Express, and Socket.io.

## Features

- 🏥 Multiplayer health quiz
- 📱 Real-time synchronization
- 🎯 9 health-related questions
- 🏆 Dynamic scoring system
- 📊 Final ranking with podium

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and go to `http://localhost:3301`

## Deployment

### Heroku
1. Create a new Heroku app
2. Connect your GitHub repository
3. Deploy automatically

### Other Platforms
The app includes:
- `Procfile` for process management
- `package.json` with start script
- Static file serving configuration

## File Structure

```
ef-sante/
├── server.js          # Main server file
├── package.json       # Dependencies
├── Procfile           # Heroku process file
├── index.html         # Main application page (root)
└── public/            # Static files
    ├── quiz.html      # Quiz page
    ├── script.js      # Client-side JavaScript
    └── style.css      # Styles
```

## API Endpoints

- `GET /` - Main application page
- `GET /quiz` - Quiz page
- `GET /api/questions` - Get quiz questions
- WebSocket events for real-time communication

## Technologies Used

- Node.js
- Express.js
- Socket.io
- HTML5/CSS3/JavaScript