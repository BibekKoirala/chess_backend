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

module.exports = GamesRouter