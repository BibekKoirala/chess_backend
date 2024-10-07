// ratingActions.js

const UserRatingModel = require('../../Models/UserRating.Model');  // Assuming your model file is named UserRatingModel.js

// Function to add a new rating for a user
const addUserRating = async (userId, bullet, blitz, rapid, classical) => {
  try {
    const newRating = new UserRatingModel({
      user: userId,
      bullet,
      blitz,
      rapid,
      classical
    });
    await newRating.save();
    return { success: true, message: 'Rating added successfully', rating: newRating };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Function to update a user's rating
const updateUserRating = async (userId, bullet, blitz, rapid, classical) => {
  try {
    const updatedRating = await UserRatingModel.findOneAndUpdate(
      { user: userId },
      { bullet, blitz, rapid, classical },
      { new: true, runValidators: true } // `new` returns the updated document; `runValidators` enforces schema validation
    );
    if (!updatedRating) {
      return { success: false, message: 'Rating not found for this user' };
    }
    return { success: true, message: 'Rating updated successfully', rating: updatedRating };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Function to get a user's rating
const getUserRating = async (userId) => {
  try {
    const rating = await UserRatingModel.findOne({ user: userId });
    if (!rating) {
      return { success: false, message: 'Rating not found for this user' };
    }
    return { success: true, rating };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Function to delete a user's rating
const deleteUserRating = async (userId) => {
  try {
    const deletedRating = await UserRatingModel.findOneAndDelete({ user: userId });
    if (!deletedRating) {
      return { success: false, message: 'Rating not found for this user' };
    }
    return { success: true, message: 'Rating deleted successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  addUserRating,
  updateUserRating,
  getUserRating,
  deleteUserRating
};
