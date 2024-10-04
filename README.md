# Chess Game Backend

This repository contains the backend implementation of a real-time multiplayer chess game. The backend is built using Node.js and utilizes WebSocket for real-time communication between players. The game supports various formats (Bullet, Blitz, Rapid, and Classical) and includes features such as move validation, game timers, and user management.

## Features

- **Real-time Gameplay**: Players can make moves, offer draws, and resign via WebSocket connections.
- **Multiple Game Formats**: Supports Bullet, Blitz, Rapid, and Classical game formats with adjustable time controls.
- **Game State Management**: Tracks game history, current state, and provides notifications for game events (checkmate, stalemate, etc.).
- **User Management**: Handles user authentication and session management using JWT tokens.
- **Game History Storage**: Saves completed game data in a database for future reference.
- **Social Features**: Users can follow each other, send messages, and view friend lists.
- **Settings Management**: Users can customize game settings, including board appearance, time controls, and notifications.
- **Tournaments**: Organize and participate in tournaments with brackets and leaderboards.
- **Statistics**: Track user performance, win/loss records, and game statistics.

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **WebSocket**: For real-time communication between the server and clients.
- **MongoDB**: Database to store user and game data.
- **jsonwebtoken**: Library for generating and verifying JWT tokens.
- **chess.js**: A chess library for move validation and game state management.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chess-game-backend.git
   cd chess-game-backend

2. Install the dependencies:
    ```bash
    npm install

3. Create a .env file in the root directory with the following variables:
    ```plaintext
    JWTLoginTokenSecret = your_secret_key
    JWTExpiryTokenSecret = your_secret_key
    JWTGameTokenSecret = your_secret_key
    DBConnectionString= your_mongodb_uri

4. Start the server:
    ```bash
    npm start

# API Endpoints
## WebSocket Connection

    Connect to the WebSocket server to begin a game and interact with other players.

## Actions

    Search: Search for an opponent based on the game format.
    Cancel Search: Cancel the ongoing search for an opponent.
    Move: Make a move in the current game.
    Rejoin: Rejoin a previously started game.
    Draw: Offer, accept, or reject a draw.
    Resign: Resign from the current game.

## Social Features

    Follow: Follow other users to see their game activity.
    Messaging: Send and receive messages from friends.
    Friend List: View a list of friends and their online status.

## Settings Management

    Customize Board Appearance: Change themes and board colors.
    Notification Settings: Manage notifications for game events and messages.

## Tournaments

    Create Tournament: Organize tournaments and set rules.
    Join Tournament: Participate in existing tournaments.
    Leaderboards: View tournament standings and individual player performance.

## Statistics

    Performance Tracking: View win/loss records and game statistics.
    Game History: Access a history of played games and results.

## Usage

To use this backend service, connect to the WebSocket server from your front-end application and utilize the provided actions to manage game flow.
## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.
## License

This project is licensed under the MIT License - see the LICENSE file for details.
# Acknowledgments
    ```plaintext
    chess.js - The chess library used for managing the game state.
    jsonwebtoken - For token authentication.


Feel free to modify any section to better reflect your project's actual capabilities or future goals!
