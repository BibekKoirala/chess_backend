/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with a username, email, password, and birthdate.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               birthdate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: User created successfully.
 *       400:
 *         description: Bad request.
 */

const express = require('express');
const AuthMiddleware = require('./authMiddleware');
const UserModel = require('../../Models/User.Model');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const UserSettingModel = require('../../Models/UserSetting.Model');

// Creating an instance of the express server
const SignupRouter = express.Router();

// Simplified register route without email logic
SignupRouter.post('/register', async (req, res) => {
    try {
        const { username, email, password, birthdate } = req.body;

        // Checking password criteria
        if (AuthMiddleware.UserCriteria(username, password, email, birthdate, res)) {
            // Check if user already exists
            const existingUser = await UserModel.findOne({ email: email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists." });
            }

            // Hash password
            const hash = await AuthMiddleware.PasswordHasher(password);

            // Create new user
            const newUser = await UserModel.create({
                username,
                email,
                password: hash,
                birthdate: new Date(birthdate),
                activated: true,  // Automatically activating user since no email logic
                createdon: new Date()
            });

            UserSettingModel.create({
                user: newUser._id,
                against: 1,
                format: 1,
                difficulty: 1,
                playas: 'b',
            }).catch((err) => {
                console.log(err);
            })

            res.status(200).json({ message: "User created successfully." });
        }
    } catch (e) {
        res.status(400).json({ message: "Bad request" });
    }
});

// Simplified create new password route
SignupRouter.post('/createnewpassword', async (req, res) => {
    if (req.body.token) {
        jwt.verify(req.body.token, process.env.JWTExpiryTokenSecret, async (err, payload) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            // Hash new password
            const hash = await AuthMiddleware.PasswordHasher(req.body.password);

            // Update user's password
            try {
                const user = await UserModel.findOneAndUpdate(
                    { email: payload.email },
                    { password: hash, activated: true },
                    { new: true }
                );
                
                if (user) {
                    res.status(200).json({ message: "Password updated successfully." });
                } else {
                    res.status(400).json({ message: "User doesn't exist." });
                }
            } catch (err) {
                res.status(400).json({ message: err.message });
            }
        });
    } else {
        res.status(400).json({ message: "No token provided." });
    }
});

module.exports = SignupRouter;
