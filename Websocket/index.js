const { Chess } = require("chess.js");
const jwt = require("jsonwebtoken");
const UserGamesModel = require("../Models/UserGames.Model");

const game = {
  search: [],
  games: [],
  online: [],
};

const action = {
  Online: "Online",
  Draw_Offered: "Draw_Offered",
  Illegal_Move: "Illegal_Move",
  Opponent_Move: "Opponent_Move",
  Opponent_Left: "Opponent_Left",
  Opponent_Inactive: "Opponent_Inactive",
  Game_Started: "Game_Started",
  Game_Over: "Game_Over",
  Expired_Token: "Expired_Token",
  Search: "Search",
  Cancel_Search: "Cancel_Search",
  Move: "Move",
  Invalid_Request: "Invalid_Request",
  Rejoin: "Rejoin",
  Rejoin_Success: "Rejoin_Success",
  Rejoin_Failure: "Rejoin_Failure",
  Opponent_Rejoin: "Opponent_Rejoin",
  In_Check: "In_Check",
  Is_CheckMate: "Is_CheckMate",
  Is_StaleMate: "Is_Stalemate",
  Is_Draw: "Is_Draw",
  Is_ThreeFold: "Is_ThreeFold",
  Is_InsufficientMaterial: "Is_InsufficientMaterial",
  Is_Abandoned: "Is_Abandoned",
};

const WSMessage = (action, message, payload) => {
  return payload
    ? JSON.stringify({ action: action, message: message, payload: payload })
    : JSON.stringify({ action: action, message: message });
};

class Game {
  constructor(player1, player2) {
    this.token = CreateGameToken(player1.id, player2.id);
    this.player1 = player1;
    this.player2 = player2;
    this.player1.gameid = this.token;
    this.player2.gameid = this.token;

    this.white = Math.floor(Math.random() * 2) + 1;
    this.chess = new Chess();
    this.format = "Rapid";
    this.time = 10;
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
  }

  end(draw, winid, reason, message, move) {
    if (draw) {
      UserGamesModel.create({
        player1: this.player1.id,
        player2: this.player2.id,
        format: this.format,
        time: this.time,
        history: this.chess.history(),
        finalPosition: this.chess.fen(),
        concludeby: reason,
        winner: null,
        createdon: new Date(),
      })
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
            })
          );
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

      game.games = game.games.filter((game) => game.token !== this.token);
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
    } else if (winid == this.player2.id) {
      let message1 = message.replace("{win}", "lost");
      let message2 = message.replace("{win}", "won");

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

    UserGamesModel.create({
      player1: this.player1.id,
      player2: this.player2.id,
      format: this.format,
      time: this.time,
      history: this.chess.history(),
      finalPosition: this.chess.fen(),
      concludeby: reason,
      winner: winid,
      createdon: new Date(),
    })
      .then(() => {
        return;
      })
      .catch((e) => {
        console.log(e.message);
      });

    /*** Filter game and set gameid to null ***/
    game.games = game.games.filter((game) => game.token !== this.token);
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
                let searchList = game.search.filter((wss) => wss.id != ws.id);
                if (searchList.length > 0) {
                  let opponent = searchList.pop();
                  let newgame = new Game(opponent, ws);
                  game.search = game.search.filter(
                    (wss) => wss.id !== opponent.id
                  );
                  game.games.push(newgame);
                } else if (searchList.length < game.search.length) {
                  ws.send(WSMessage(action.Search, "Searching for opponent."));
                } else {
                  game.search.push(ws);
                  ws.send(WSMessage(action.Search, "Searching for opponent."));
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
        game.search = game.search.filter(
          (wss) => wss.id !== message.payload.id
        );
        ws.send(WSMessage(action.Cancel_Search, "Search cancelled."));
        break;
      }
      case action.Move: {
        for (let index = 0; index < game.games.length; index++) {
          const element = game.games[index].token;
          if (element == message.payload.token) {
            game.games[index].makeMove(
              message.payload.move,
              message.payload.id
            );
            return;
          }
        }
        break;
      }
      case action.Rejoin: {
        let tempgame = game.games.filter(
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
          let tempgame = game.games.filter((game) => game.token === ws.gameid);
          if (tempgame.length > 0) {
            tempgame[0].endByAbort(ws.id);
          }
        }
        break;
      }
      case action.Draw_Offered: {
      }
    }
  });

  ws.on("close", (code, reason) => {
    console.log(ws);
    game.online = game.online.filter((wss) => wss.id !== ws.id);
    game.search = game.search.filter((wss) => wss.id !== ws.id);
    if (ws.gameid) {
      let tempgame = game.games.filter((game) => game.token === ws.gameid);
      if (tempgame.length > 0) {
        tempgame[0].playerleft(ws.id);
      }
    }

    console.log(game);
  });
}

module.exports = WebsocketHandler;
