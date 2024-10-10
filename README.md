# ♟️ Online Chess App (Backend)

Welcome to the backend of our feature-packed Online Chess App! This Node.js/Express-based backend powers multiplayer chess games, handles user authentication, and provides real-time updates through WebSockets.

⚠️ Note: This repository contains the backend portion of the project. You can find the frontend repository here: [Chess Frontend.](https://github.com/BibekKoirala/chess_ui)

# 🚀 Features

* User Authentication & Authorization: Secure login and registration system using JWT (JSON Web Tokens).
* REST APIs: Dynamic data fetching for game history, player ratings, and more.
* WebSockets: Real-time, fast-paced multiplayer mode to challenge opponents online.
* Multiplayer Game Actions: From draw offers to timeouts, we’ve got all the events that drive an exciting game!

### Single Player Mode: 

Play against the renowned Stockfish5 Engine with difficulty levels:
*   Easy 🟢
*   Medium 🟡
*   Hard 🔴
    
### Multiplayer Mode: 

Play online with other chess enthusiasts in real time!

**Player Ratings:** Track your progress in _Bullet, Blitz, Rapid, or Classical_ game modes.
**Game History:** Review your past games and analyze your strategies.    
**Player Options:**
Resign when things get tough
Offer and accept draws like a pro
**Game Modes:**
* Bullet ⚡
* Blitz ⏱️
* Rapid 🚀
* Classical ♟️

## 🎮 Demo Videos

**Multiplayer Gameplay:** [Watch the demo video](https://drive.google.com/file/d/1qyOlG0a16RFQ_g_f0R1OW_PMpmsYxwiB/view?usp=sharing)

**Single Player Gameplay:** [Watch the demo video](https://drive.google.com/file/d/1GjrDIbY7MXg6tQU2z_-5gCy7jss9akGG/view?usp=sharing)

## 🛠️ Technologies Used

* Node.js: The runtime powering our server-side logic.
* Express: For building fast and reliable RESTful APIs.
* MongoDB: Flexible NoSQL database to store player info, game data, and ratings.
* WebSockets: Seamless real-time communication for multiplayer games.

## 🔄 Multiplayer Game Actions

Our app handles a variety of real-time game actions to make the online chess experience immersive and interactive. These include:

    Online: When a player goes online
    Draw_Offered: A player offers a draw
    Draw_Accepted: A draw offer is accepted
    Draw_Rejected: A draw offer is rejected
    Game_Resign: A player resigns from the game
    Illegal_Move: An illegal move is made
    Game_Clock: Tracks and updates the game clock
    Opponent_Move: Opponent makes a move
    Opponent_Left: Opponent leaves the game
    Opponent_Inactive: Opponent is inactive for too long
    Game_Started: The game starts
    Game_Over: The game is over
    Expired_Token: Token expiration detected
    Search: Searching for a game
    Cancel_Search: Cancels the game search
    Move: Player makes a move
    Invalid_Request: An invalid request is made
    Rejoin: Player attempts to rejoin a game
    Rejoin_Success: Successfully rejoined the game
    Rejoin_Failure: Failed to rejoin the game
    Opponent_Rejoin: Opponent rejoins the game
    In_Check: Player is in check
    Is_CheckMate: Checkmate is achieved
    Is_StaleMate: Stalemate is reached
    Is_Draw: The game ends in a draw
    Is_ThreeFold: Threefold repetition occurs
    Is_InsufficientMaterial: Insufficient material to continue
    Is_Abandoned: Game is abandoned by a player
    Is_TimeUp: Time runs out
    Player_Rating: Player's rating is updated
    Opponent_Rating: Opponent's rating is updated
    Opponent_Info: Retrieve opponent's information

# 💻 How to Run This Project

### **Prerequisites**

    Node.js (v14 or above)
    MongoDB instance

### **Steps to Run:**

* Clone the Repository:
    ```bash
    git clone https://github.com/BibekKoirala/chess_backend.git
    cd chess_backend
* Install Dependencies:
    ```bash
    npm install

* Configure Environment Variables:

    Create a .env file in the root directory and add necessary environment variables:

        env

        PortalLink = FRONTEND_APP_URL
        JWTLoginTokenSecret = JWT_TOKEN_SECRET
        JWTExpiryTokenSecret = JWT_TOKEN_SECRET
        JWTGameTokenSecret = JWT_TOKEN_SECRET
        DBConnectionString= MONGO_DB_URL


* Run the Server:
    
        npm start

* Test the APIs:

    You can use a tool like Postman or cURL to test the REST APIs and WebSockets, or use our [frontend application](https://github.com/BibekKoirala/chess_ui) for a fully interactive experience.

# 📁 Frontend

Check out the frontend code for an interactive chess experience: [Chess Frontend.](https://github.com/BibekKoirala/chess_ui)

![Node.js](https://img.shields.io/badge/Node.js-8CC84B?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![WebSockets](https://img.shields.io/badge/WebSockets-4FC3F7?style=for-the-badge&logo=websocket&logoColor=white)