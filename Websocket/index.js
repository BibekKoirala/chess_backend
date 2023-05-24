const { Chess } = require("chess.js");
const jwt = require("jsonwebtoken");

const game = {
  search: [],
  games: [],
};

const action = {
  Illegal_Move: "Illegal_Move",
  Opponent_Move: "Opponent_Move",
  Game_Started: "Game_Started",
  Game_Over: "Game_Over",
  Expired_Token: "Expired_Token",
  Search: "Search",
  Move: "Move",
  Invalid_Request: "Invalid_Request",
  Rejoin: "Rejoin",
}

const WSMessage = (action, message, payload) => {
  return (payload?JSON.stringify({ action: action, message: message, payload: payload}): JSON.stringify({ action: action, message: message}))
}

class Game {
  constructor(player1, player2) {
    this.token = CreateGameToken(player1.id, player2.id);
    this.player1 = player1;
    this.player2 = player2;
    this.white = Math.floor(Math.random() * 2) + 1;
    this.chess = new Chess();

    this.start();
  }

  makeMove(move, id) {
    if (id === this.player1.id) {
      if ((this.chess.turn() == "w" && this.white === 1) || (this.chess.turn() == "b" && this.white !== 1)) {
        this.move(move, 2);
      } else {
        this.player1.send(WSMessage(action.Illegal_Move, "Illegal Move" ));
      }
    } else if (id === this.player2.id) {
      if ((this.chess.turn() == "w" && this.white === 2) || (this.chess.turn() == "b" && this.white !== 2)) {
        this.move(move, 1);
      } else {
        this.player2.send(WSMessage(action.Illegal_Move, "Illegal Move" ));
      }
    }
  }

  move (move, sendto) {
    const result = this.chess.move(move);
    if (result === null) {
      if (sendto === 1) {
        this.player2.send(WSMessage( action.Illegal_Move, "Illegal Move" ));
      }
      else {
        this.player1.send(WSMessage( action.Illegal_Move, "Illegal Move" ));
      }
      return;
    }
  
    if (sendto === 1) {
      this.player1.send(WSMessage( action.Opponent_Move, "Opponent Move",  { move: move }));
    }
    else {
      this.player2.send(WSMessage( action.Opponent_Move, "Opponent Move",  { move: move }));
    }
    
  }

  start() {
    if (this.white == 1) {
      this.player1.send(WSMessage( action.Game_Started, "Game Started", {piece: 'w', token: this.token}));
      this.player2.send(WSMessage( action.Game_Started, "Game Started", {piece: 'b', token: this.token}));
    }
    else {
      this.player1.send(WSMessage( action.Game_Started, "Game Started", {piece: 'b', token: this.token}));
      this.player2.send(WSMessage( action.Game_Started, "Game Started", {piece: 'w', token: this.token}));
    }
  }


}

function CreateGameToken(player1, player2, gametime = 10) {
  return jwt.sign(
    {
      player1: player1,
      player2: player2,
    },
    process.env.JWTGameTokenSecret,
    { expiresIn: gametime * 2 + 'm' }
  );
}

function toEvent(message) {
  try {
    return JSON.parse(message);
    // this.emit(event.type, event.payload);
  } catch (err) {
    console.log("not an event", err);
  }
}

function WebsocketHandler(ws) {
  console.log("Connecting websocket");
  ws.on("message", function (Message) {
    let message;
    try{
      message = JSON.parse(Message)
    }
    catch {
      ws.send(WSMessage( action.Invalid_Request, "Please provide a valid message."))
    }

    switch (message.action) {
      case action.Search: {
        jwt.verify(message.payload.token, process.env.JWTLoginTokenSecret,  (err, payload) => {  
          if (err) {
              ws.send(WSMessage( action.Expired_Token, 'Token is expired login again.'));
          } else {
            if (payload.id == message.payload.id) {
              ws.id = payload.id
              if (game.search.length > 0) {
                let opponent = game.search.pop();
                let newgame = new Game(opponent, ws);
                game.games.push(newgame);
              } else {
                game.search.push(ws);
                ws.send(WSMessage( action.Search, "Searching for opponent."))
              }
            }
            else {
              ws.send(WSMessage( action.Expired_Token, 'Token is expired login again.'));
            }
          }
      
        });
        break;
      }
      case action.Move: {
        for (let index = 0; index < game.games.length; index++) {
          const element = game.games[index].token;
          if (element == message.payload.token) {
            game.games[index].makeMove(message.payload.move, message.payload.id);
            return
          }
        }
        break;
      }
      case action.Rejoin: {

      }
    }
    
  });

  ws.on("close", ()=>{
    console.log("Connection closed.");
  })
}

module.exports = WebsocketHandler;
 