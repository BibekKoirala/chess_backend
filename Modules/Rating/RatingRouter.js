const express = require('express');
const { getUserRating } = require('./RatingActions');

// Creating an instance of the express server
const RatingRouter = express.Router();

RatingRouter.get('/ratings', async (req, res) => {
   const response = await getUserRating(req.userId)

   if (response.success) {
    res.status(200).send({success: true, ratings: response.rating})
   }
   else {
    res.status(400).send({success: false, ratings: {}})
   }
})

module.exports = RatingRouter