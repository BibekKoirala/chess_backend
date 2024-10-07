const { Chess } = require("chess.js");
const jwt = require("jsonwebtoken");
const UserGamesModel = require("../Models/UserGames.Model");
const GamesModel = require("../Models/Games.Model");
const action = require('./actions');
const UserRatingModel = require("../Models/UserRating.Model");
const changePlayerRatings  = require("./RatingHandler");
const WSMessage = require('./helpers/WSMessageFormatter')

// Array of array for different games.
// 0 -> Bullet 1 -> Blitz 2 -> Rapid 3 -> Classical

var formatKey = ['bullet', 'blitz', 'rapid', 'classical']
var game = {
  search: [[],[],[],[]],
  games: [[],[],[],[]],
  online: [],
};

class Game {
  constructor(player1, player2, format) {
    this.token = CreateGameToken(player1.id, player2.id);
    this.player1 = player1;
    this.player2 = player2;
    this.player1.gameid = this.token;
    this.player2.gameid = this.token;

    this.white = Math.floor(Math.random() * 2) + 1;
    this.chess = new Chess();
    this.drawid = null;
    if (format == 0) {
      this.format = format;
      this.time1 = 60;
      this.time2 = 60;
    }
    else if (format == 1) {
      this.format = format;
      this.time1 = 300;
      this.time2 = 300;
    }
    else if (format == 2) {
      this.format = format;
      this.time1 = 900;
      this.time2 = 900;
    }
    else if (format == 3) {
      this.format = format;
      this.time1 = 2700;
      this.time2 = 2700;
    }
    this.start();
  }

  makeMove(move, id) {
    if (id === this.player1.id) {
      if (
        (this.chess.turn() == "w" && this.white === 1) ||
        (this.chess.turn() == "b" && this.white !== 1)
      ) {
        this.move(move, 2);
      } else {
        this.player1.send(WSMessage(action.Illegal_Move, "Illegal Move"));
      }
    } else if (id === this.player2.id) {
      if (
        (this.chess.turn() == "w" && this.white === 2) ||
        (this.chess.turn() == "b" && this.white !== 2)
      ) {
        this.move(move, 1);
      } else {
        this.player2.send(WSMessage(action.Illegal_Move, "Illegal Move"));
      }
    }
  }

  move(move, sendto) {
    const result = this.chess.move(move);
    if (result === null) {
      if (sendto === 1) {
        this.player2.send(WSMessage(action.Illegal_Move, "Illegal Move"));
      } else {
        this.player1.send(WSMessage(action.Illegal_Move, "Illegal Move"));
      }
      return;
    } else {
      if (this.chess.isGameOver()) {
        let GameAction = "",
          message = "",
          win = false;
        if (this.chess.isCheckmate()) {
          GameAction = action.Is_CheckMate;
          message = "Checkmate";
          win = true;
        } else if (this.chess.isStalemate()) {
          GameAction = action.Is_StaleMate;
          message = "Game drawn by stalemate.";
        } else if (this.chess.isInsufficientMaterial()) {
          GameAction = action.Is_InsufficientMaterial;
          message = "Game drawn by insufficient material.";
        } else if (this.chess.isThreefoldRepetition()) {
          GameAction = action.Is_ThreeFold;
          message = "Game drawn by threefold repetition";
        } else if (this.chess.isDraw()) {
          GameAction = action.Is_Draw;
          message = "Game drawn";
        } else {
          GameAction = action.Is_Draw;
          message = "Game drawn";
        }
        if (win) {
          if (sendto == 1) {
            this.end(
              false,
              this.player2.id,
              GameAction,
              "You {win} by checkmate.",
              move
            );
          } else if (sendto == 2) {
            this.end(
              false,
              this.player1.id,
              GameAction,
              "You {win} by checkmate.",
              move
            );
          }
        } else {
          this.end(true, null, GameAction, message, move);
        }

        /**************************************Handle Game end logic. Store the game in DB.***********************************/
        return;
      }

      if (sendto === 1) {
        this.player1.send(
          WSMessage(action.Opponent_Move, "Opponent Move", { move: move })
        );
      } else {
        this.player2.send(
          WSMessage(action.Opponent_Move, "Opponent Move", { move: move })
        );
      }
    }
  }

  start() {
    if (this.white == 1) {
      this.player1.send(
        WSMessage(action.Game_Started, "Game Started", {
          piece: "w",
          token: this.token,
        })
      );
      this.player2.send(
        WSMessage(action.Game_Started, "Game Started", {
          piece: "b",
          token: this.token,
        })
      );
    } else {
      this.player1.send(
        WSMessage(action.Game_Started, "Game Started", {
          piece: "b",
          token: this.token,
        })
      );
      this.player2.send(
        WSMessage(action.Game_Started, "Game Started", {
          piece: "w",
          token: this.token,
        })
      );
    }

    UserRatingModel.findOne({user: this.player1.id}).then((val)=> this.player1.ratings = val).catch(e=> console.log(e.message))
    UserRatingModel.findOne({user: this.player2.id}).then((val)=> this.player2.ratings = val).catch(e=> console.log(e.message))


    this.interval = setInterval(()=>{
     if ((this.chess.turn() == "w" && this.white === 1) ||
      (this.chess.turn() == "b" && this.white !== 1)) {
        this.time1 = this.time1 - 1;
      }
      else if ((this.chess.turn() == "w" && this.white === 2) ||
      (this.chess.turn() == "b" && this.white !== 2)) {
        this.time2 = this.time2 - 1;
      }
      this.player1.send(WSMessage(action.Game_Clock, "Clock info", {
        ownclock: this.time1,
        opponentclock: this.time2,
      }))

      this.player2.send(WSMessage(action.Game_Clock, "Clock info", {
        ownclock: this.time2,
        opponentclock: this.time1,
      }))
      if (this.time1 == 0) {
        clearInterval(this.interval);
        this.interval = null;
        this.end(false, this.player2.id, action.Is_TimeUp, "You {win} on time.", null);
      }
      else if (this.time2 == 0) {
        clearInterval(this.interval);
        this.interval = null;
        this.end(false, this.player1.id, action.Is_TimeUp, "You {win} on time.", null)
      }
    }, 1000)
  }

  end(draw, winid, reason, message, move) {
    if (this.interval){
      clearInterval(this.interval);
    }
    if (draw) {
      GamesModel.create({
        format: this.format,
        time: this.time,
        history: this.chess.history(),
        finalPosition: this.chess.fen(),
        concludeby: reason,
        createdon: new Date(),
      })
      .then((val)=>{
        UserGamesModel.insertMany([{
          player: this.player1.id,
          opponent: this.player2.id,
          winner: null,
          draw: true,
          white: (this.white == 1),
          game: val._id
        },{
          player: this.player2.id,
          opponent: this.player1.id,
          winner: null,
          draw: true,
          white: (this.white == 2),
          game: val._id
        }])
          .then(() => {
            this.player1.send(
              WSMessage(action.Game_Over, message, {
                move: move,
                reason: reason,
                draw: true,
              })
            );
            this.player2.send(
              WSMessage(action.Game_Over, message, {
                move: move,
                reason: reason,
                draw: true,
              }));
      })
      
          
        })
        .catch((e) => {
          this.player1.send(
            WSMessage(action.Game_Over, message, {
              move: move,
              reason: reason,
              draw: true,
            })
          );
          this.player2.send(
            WSMessage(action.Game_Over, message, {
              move: move,
              reason: reason,
              draw: true,
            })
          );
        });

      game.games[this.format] = game.games[this.format].filter((game) => game.token !== this.token);
      this.player1.gameid = null;
      this.player2.gameid = null;

      return;
    } else if (winid == this.player1.id) {
      let message1 = message.replace("{win}", "won");
      let message2 = message.replace("{win}", "lost");

      this.player1.send(
        WSMessage(action.Game_Over, message1, {
          move: move,
          reason: reason,
          win: true,
        })
      );
      this.player2.send(
        WSMessage(action.Game_Over, message2, {
          move: move,
          reason: reason,
          win: false,
        })
      );
      changePlayerRatings(this.player1.id, this.player1.ratings[formatKey[this.format]], this.player2.ratings[formatKey[this.format]], true, this.format, this.player1, this.player2)
      changePlayerRatings(this.player2.id, this.player2.ratings[formatKey[this.format]], this.player1.ratings[formatKey[this.format]], false, this.format, this.player2, this.player1)

    } else if (winid == this.player2.id) {
      let message1 = message.replace("{win}", "lost");
      let message2 = message.replace("{win}", "won");
      changePlayerRatings(this.player1.id, this.player1.ratings[formatKey[this.format]], this.player2.ratings[formatKey[this.format]], false, this.format, this.player1, this.player2)
      changePlayerRatings(this.player2.id, this.player2.ratings[formatKey[this.format]], this.player1.ratings[formatKey[this.format]], true, this.format, this.player2, this.player1)

      this.player1.send(
        WSMessage(action.Game_Over, message1, {
          move: move,
          reason: reason,
          win: false,
        })
      );
      this.player2.send(
        WSMessage(action.Game_Over, message2, {
          move: move,
          reason: reason,
          win: true,
        })
      );
    }

    GamesModel.create({
      format: this.format,
      time: this.time,
      history: this.chess.history(),
      finalPosition: this.chess.fen(),
      concludeby: reason,
      createdon: new Date(),
    })
    .then((val)=>{
      UserGamesModel.insertMany([{
        player: this.player1.id,
        opponent: this.player2.id,
        winner: (winid == this.player1.id),
        draw: false,
        white: (this.white == 1),
        game: val._id
      },{
        player: this.player2.id,
        opponent: this.player1.id,
        winner: (winid == this.player2.id),
        draw: false,
        white: (this.white == 2),
        game: val._id
      }])
      .then(() => {
        return;
      })
      .catch((e) => {
        console.log(e.message);
      });
    
        
      })
      .catch((e) => {
        console.log(e.message);
      });


    /*** Filter game and set gameid to null ***/
    game.games[this.format] = game.games[this.format].filter((game) => game.token !== this.token);
    this.player1.gameid = null;
    this.player2.gameid = null;
  }

  playerleft(id) {
    if (
      id == this.player1.id &&
      this.player2.readyState === this.player2.OPEN
    ) {
      this.player2.send(WSMessage(action.Opponent_Left, "Opponent left"));
    } else if (
      id == this.player2.id &&
      this.player1.readyState === this.player1.OPEN
    ) {
      this.player1.send(WSMessage(action.Opponent_Left, "Opponent left"));
    } else {
      this.end(true, null, action.Is_Abandoned, "Game drawn.", null);
    }
  }

  endByAbort(id) {
    if (
      id == this.player1.id &&
      (this.player2.readyState === this.player2.CLOSED ||
        this.player2.readyState === this.player2.CLOSING)
    ) {
      this.end(
        false,
        id,
        action.Is_Abandoned,
        "You win. Opponent abandoned the game.",
        null
      );
    } else if (
      id == this.player2.id &&
      (this.player1.readyState === this.player1.CLOSED ||
        this.player1.readyState === this.player1.CLOSING)
    ) {
      this.end(
        false,
        id,
        action.Is_Abandoned,
        "You win. Opponent abandoned the game.",
        null
      );
    } else {
      return;
    }
  }

  rejoin(ws) {
    if (this.player1.id == ws.id) {
      this.player1 = ws;
      this.player2.send(
        WSMessage(action.Opponent_Rejoin, "Opponent rejoined.")
      );
    } else if (this.player2.id == ws.id) {
      this.player2 = ws;
      this.player1.send(
        WSMessage(action.Opponent_Rejoin, "Opponent rejoined.")
      );
    } else {
      return;
    }
    ws.send(
      WSMessage(action.Rejoin_Success, "Rejoined Successfully.", {
        fen: this.chess.fen(),
        history: this.chess._history,
      })
    );
    ws.gameid = this.token;
  }

  drawOffered(id) {
    this.drawid = id;
    if (id == this.player1.id) {
      this.player2.send(WSMessage(action.Draw_Offered, this.player1.username + " offered a draw?"))
    }
    else if (id == this.player2.id) {
      this.player1.send(WSMessage(action.Draw_Offered, this.player2.username + " offered a draw?"))
    }
    return;
  }

  drawAccepted(id) {
    if ((this.drawid == this.player1.id && id == this.player2.id) || (this.drawid == this.player2.id && id == this.player1.id)) {
      this.end(true, null, action.Draw_Accepted, "Game drawn  by mutual acceptance", null)
    } else {
      this.drawid = null
    }
    return
  }

  drawRejected(id) {
    this.drawid = null;
    this.player1.send(WSMessage(action.Draw_Rejected, "Draw rejected."));
    this.player2.send(WSMessage(action.Draw_Rejected, "Draw rejected."));
    return;
  }

  resign(id) {
    if (id == this.player1.id) {
      this.end(false, this.player2.id, action.Game_Resign, "You {win} by resignation.", null);
    }
    else if (id == this.player2.id) {
      this.end(false, this.player1.id, action.Game_Resign, "You {win} by resignation.", null);
    }
    return
  }
}

function CreateGameToken(player1, player2, gametime = 10) {
  return jwt.sign(
    {
      player1: player1,
      player2: player2,
    },
    process.env.JWTGameTokenSecret,
    { expiresIn: gametime * 2 + "m" }
  );
}

function WebsocketHandler(ws) {
  console.log("Connecting websocket");
  ws.on("message", function (Message) {
    let message;
    try {
      message = JSON.parse(Message);
    } catch {
      ws.send(
        WSMessage(action.Invalid_Request, "Please provide a valid message.")
      );
    }

    switch (message.action) {
      case action.Search: {
        jwt.verify(
          message.payload.token,
          process.env.JWTLoginTokenSecret,
          (err, payload) => {
            if (err) {
              ws.send(
                WSMessage(action.Expired_Token, "Token is expired login again.")
              );
            } else {
              if (payload.id == message.payload.id) {
                // ws.id = payload.id
                if ([0, 1, 2, 3].includes(message.payload.format)) {
                  let searchList = game.search[message.payload.format].filter((wss) => wss.id != ws.id);
                  if (searchList.length > 0) {
                    let opponent = searchList.pop();
                    let newgame = new Game(opponent, ws, message.payload.format);
                    game.search[message.payload.format] = game.search[message.payload.format].filter(
                      (wss) => wss.id !== opponent.id
                    );
                    game.games[message.payload.format].push(newgame);
                  } else if (searchList.length < game.search[message.payload.format].length) {
                    ws.send(WSMessage(action.Search, "Searching for opponent."));
                  } else {
                    game.search[message.payload.format].push(ws);
                    ws.send(WSMessage(action.Search, "Searching for opponent."));
                  }
                }
                else {
                  ws.send(WSMessage(action.Cancel_Search, "Search cancelled."));
                }
              } else {
                ws.send(
                  WSMessage(
                    action.Expired_Token,
                    "Token is expired login again."
                  )
                );
                ws.close();
              }
            }
          }
        );
        break;
      }
      case action.Cancel_Search: {
        game.search[message.payload.format] = game.search[message.payload.format].filter(
          (wss) => wss.id !== message.payload.id
        );
        ws.send(WSMessage(action.Cancel_Search, "Search cancelled."));
        break;
      }
      case action.Move: {
        for (let index = 0; index < game.games[message.payload.format].length; index++) {
          const element = game.games[message.payload.format][index].token;
          if (element == message.payload.token) {
            game.games[message.payload.format][index].makeMove(
              message.payload.move,
              message.payload.id
            );
            return;
          }
        }
        break;
      }
      case action.Rejoin: {
        let tempgame = game.games[message.payload.format].filter(
          (game) => game.token === message.payload.token
        );
        if (tempgame.length > 0) {
          tempgame[0].rejoin(ws);
        } else {
          ws.send(
            WSMessage(
              action.Rejoin_Failure,
              "Could not join to your previous game. Please check the history for more information."
            )
          );
        }
        break;
      }
      case action.Online: {
        jwt.verify(
          message.payload.token,
          process.env.JWTLoginTokenSecret,
          (err, payload) => {
            if (err) {
              ws.send(
                WSMessage(action.Expired_Token, "Token is expired login again.")
              );
            } else {
              if (payload.id == message.payload.id) {
                ws.id = payload.id;
                ws.username = message.payload.username;
                ws.isPlaying = false;
                let searchList = game.online.filter((wss) => wss.id != ws.id);
                if (searchList.length < game.online.length) {
                  ws.send(WSMessage(action.Online, "You are now online."));
                } else {
                  game.online.push(ws);
                  ws.send(WSMessage(action.Online, "You are now online."));
                }
              } else {
                ws.send(
                  WSMessage(
                    action.Expired_Token,
                    "Token is expired login again."
                  )
                );
                ws.close();
              }
            }
          }
        );
        break;
      }
      case action.Opponent_Inactive: {
        if (ws.gameid) {
          let tempgame = game.games[message.payload.format].filter((game) => game.token === ws.gameid);
          if (tempgame.length > 0) {
            tempgame[0].endByAbort(ws.id);
          }
        }
        break;
      }
      case action.Draw_Offered: {
        if (ws.gameid) {
          let tempgame = game.games[message.payload.format].filter((game) => game.token === ws.gameid);
          if (tempgame.length > 0) {
            tempgame[0].drawOffered(ws.id);
          }
        }
        break;
      }
      case action.Draw_Accepted: {
        if (ws.gameid) {
          let tempgame = game.games[message.payload.format].filter((game) => game.token === ws.gameid);
          if (tempgame.length > 0) {
            tempgame[0].drawAccepted(ws.id);
          }
        }
        break;
      }
      case action.Draw_Rejected: {
        if (ws.gameid) {
          let tempgame = game.games[message.payload.format].filter((game) => game.token === ws.gameid);
          if (tempgame.length > 0) {
            tempgame[0].drawRejected(ws.id);
          }
        }
        break;
      }
      case action.Game_Resign: {
        if (ws.gameid) {
          let tempgame = game.games[message.payload.format].filter((game) => game.token === ws.gameid);
          if (tempgame.length > 0) {
            tempgame[0].resign(ws.id);
          }
        }
        break;
      }
    }
  });

  ws.on("close", () => {
    game.online = game.online.filter((wss) => wss.id !== ws.id);
    game.search.forEach((val, i)=>{
      game.search[i] = val.filter((wss) => wss.id !== ws.id);
    })
    // game.search = game.search.filter((wss) => wss.id !== ws.id);
    if (ws.gameid) {
      game.games.forEach((val, i)=>{
        let tempgame = val.filter((game) => game.token === ws.gameid);
        if (tempgame.length > 0) {
          tempgame[0].playerleft(ws.id);
        }
      })
    }
  });
}

module.exports = WebsocketHandler;
