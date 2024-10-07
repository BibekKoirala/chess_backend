const UserRatingModel = require("../Models/UserRating.Model");
const action = require("./actions");
const WSMessage = require("./helpers/WSMessageFormatter");

var formatKey = ['bullet', 'blitz', 'rapid', 'classical']


function calculateRatingChange(playerRating, opponentRating, isWin) {
    const minChange = 2;
    const maxChange = 20;
    const maxDifference = 400;  // Define a cap for the rating difference
    
    // Calculate the absolute difference in ratings
    let ratingDifference = Math.abs(playerRating - opponentRating);

    // Scale the rating change based on the difference
    let ratingChange = Math.max(minChange, maxChange - ((ratingDifference / maxDifference) * (maxChange - minChange)));
    
    // Round the rating change to a whole number
    ratingChange = Math.round(ratingChange);

    // Adjust the player's rating based on win or loss
    if (isWin) {
        return playerRating + ratingChange;
    } else {
        return playerRating - ratingChange;
    }
}

function changePlayerRatings(userid, playerRating, opponentRating, isWin, format, wsp, wso) {
    let newRating = {}
    newRating[formatKey[format]] = Math.max(calculateRatingChange(playerRating, opponentRating, isWin,), 0)
    UserRatingModel.updateOne({user: userid}, newRating).then(()=>{
        wsp.send(
            WSMessage(action.Player_Rating, {
                playerRating: playerRating,
                ratingInc: newRating[formatKey[format]] - playerRating,
              })
        )
        wso.send(
            WSMessage(action.Opponent_Rating, {
                opponentRating: playerRating,
                opponentRatingInc: newRating[formatKey[format]] - playerRating,
              })
        )
    }).catch((e)=>console.log(e.message))
}

module.exports = changePlayerRatings