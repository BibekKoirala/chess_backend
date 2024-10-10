const express = require('express');
const UserGamesModel = require('../../Models/UserGames.Model');

// Creating an instance of the express server
const GamesRouter = express.Router();

GamesRouter.get('/playergames', (req, res) => {
    UserGamesModel.find()
    .where({player: req.userId})
    .populate({ path: 'opponent', select: '-password -activated -birthdate -createdon -__v'})
    .populate({ path: 'game', select: '-__v'})
    .exec()
    .then((result) => {
        if (result.length > 0) {
            res.status(200).json({ message: 'User game history.', data: result });
        }
        else {
            res.status(400).json({ message: 'No user game history.', data: [] });
        }
    })
    .catch((err) => {
        res.status(400).json({ message: 'Bad Request.', data: [] });
    })
})

GamesRouter.get('/playergames/:gameid', (req, res) => {
    console.log('Hi')
    const gameId = req.params.gameid.split(':')[1];

    UserGamesModel.findById(gameId)
        .where({ player: req.userId }) // Ensure the game belongs to the logged-in user
        .populate({ path: 'opponent', select: '-password -activated -birthdate -createdon -__v' })
        .populate({ path: 'game', select: '-__v' })
        .exec()
        .then((result) => {
            if (result) {
                res.status(200).json({ message: 'Game details.', data: result });
            } else {
                res.status(404).json({ message: 'Game not found.', data: null });
            }
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ message: 'Server error.', error: err.message });
        });
});


module.exports = GamesRouter