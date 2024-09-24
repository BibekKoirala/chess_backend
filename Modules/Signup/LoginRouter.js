const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../../Models/User.Model'); // Make sure this path matches your project structure

const loginRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Username of the user
 *         password:
 *           type: string
 *           description: Password of the user
 *       example:
 *         username: johndoe
 *         password: secret123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Status message
 *         data:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               description: Username of the user
 *             email:
 *               type: string
 *               description: Email of the user
 *             birthdate:
 *               type: string
 *               format: date
 *               description: Birthdate of the user
 *             token:
 *               type: string
 *               description: JWT token for authentication
 *             id:
 *               type: string
 *               description: User ID
 *
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Bad request (missing fields)
 */


// POST /login - User login
loginRouter.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (username && password) {
        // Find the user in the database based on the username
        UserModel.findOne({ username: username })
            .then((user) => {
                if (user) {
                    // Check if the user's account is activated
                    if (user.activated) {
                        // Compare the provided password with the hashed password stored in the database
                        bcrypt.compare(password, user.password)
                            .then((result) => {
                                if (result) {
                                    // Password is correct, generate JWT token
                                    const token = jwt.sign(
                                        {
                                            id: user.id,
                                            email: user.email,
                                        },
                                        process.env.JWTLoginTokenSecret, // Ensure this is set in your environment
                                        { expiresIn: "1h" } // Token expiration time
                                    );

                                    // Send the successful login response
                                    res.status(200).json({
                                        message: "Login Successful",
                                        data: {
                                            username: user.username,
                                            email: user.email,
                                            birthdate: user.birthdate,
                                            token: token,
                                            id: user.id
                                        }
                                    });
                                } else {
                                    // Incorrect password
                                    res.status(400).json({ message: "Incorrect password." });
                                }
                            })
                            .catch(() => {
                                // Error during password comparison
                                res.status(400).json({ message: "Something went wrong." });
                            });
                    } else {
                        // User account not activated
                        res.status(400).json({ message: "User not activated yet." });
                    }
                } else {
                    // User not found
                    res.status(400).json({ message: "User doesn't exist." });
                }
            })
            .catch((error) => {
                // Error while finding the user in the database
                res.status(400).json({ message: error.message });
            });
    } else {
        // Missing username or password in the request body
        res.status(401).json({ message: "Bad request" });
    }
});

module.exports = loginRouter;
