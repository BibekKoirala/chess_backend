const express = require('express');
const AuthMiddleware = require('./authMiddleware');
const UserModel = require('../../Models/User.Model');
const bcrypt = require("bcrypt");
const EmailTemplateModel = require('../../Models/EmailTemplate.Model');
const sendMail = require('../../emailconfig');
const jwt = require('jsonwebtoken');
const UserSettingModel = require('../../Models/UserSetting.Model');

// Creating an instance of the express server
const SignupRouter = express.Router();

// Defining a route
SignupRouter.post('/Signup', async (req, res) => {
    try{
        const { username, email, password, birthdate } = req.body;
        
        // Checking password criteria
        if ( AuthMiddleware.UserCriteria(username , password, email, birthdate, res)) {
            
            // Password hash
            const hash = await AuthMiddleware.PasswordHasher(password);
            
            //User creation in DB
            UserModel.create({
                username: username,
                email: email,
                password: hash,
                birthdate: new Date(birthdate),
                createdon: new Date()
            }).then((r) => {
                res.status(200).json({message: "User created successfully."});
            }).catch((err) => {
                res.status(400).json({message: err.message});
            });

          }
    }catch(e){
        res.status(400).json({message: "Bad request"});
    }
  
});

SignupRouter.post('/register', (req, res) => {
    try{
        const { username, email, birthdate } = req.body;
        
        // Checking password criteria
        if ( AuthMiddleware.UserCriteria(username , email, birthdate, res)) {
            
            //User creation in DB
            UserModel.find({ email: email})
            .then((userRes) => {
                if (userRes.length > 0) {
                    if (userRes[0].activated){
                        res.status(400).json({ message: "User already exists."});
                    }else{
                        EmailTemplateModel.find({ for: 'Registration_Progress'})
                        .then((emailResult) => {
                            if (emailResult.length > 0) {
                                let link = AuthMiddleware.GenerateExpiryLink({ id: userRes[0].id, username: userRes[0].username, email: userRes[0].email}, '/UserRegistration');
                                let text = emailResult[0].template.replace('{username}', userRes[0].username).replace('{link}', `"`+link+`"`);
                                sendMail(email, emailResult[0].subject, text);
                                res.status(200).json({ message: "User already exists. We have sent and activation link to your email. "});
                            }
                            else {
                                res.status(400).json({ message: 'Something went wrong'});
                            }
                        })
                        .catch((err) => {
                            res.status(400).json({ message: 'Something went wrong'});
                        })
                    }
                    
                }
                else {
                    UserModel.create({
                        username: username,
                        email: email,
                        birthdate: new Date(birthdate),
                        activated: false,
                        createdon: new Date()
                    }).then((userRes) => {
                        EmailTemplateModel.find({ for: 'Registration_Progress'})
                        .then((emailResult) => {
                            if (emailResult.length > 0) {
                                let link = AuthMiddleware.GenerateExpiryLink({ id: userRes.id, username: userRes.username, email: userRes.email}, '/UserRegistration');
                                let text = emailResult[0].template.replace('{username}', userRes.username).replace('{link}', `"`+link+`"`);
                                sendMail(email, emailResult[0].subject, text);
                                res.status(200).json({ message: "User created successfully. We have sent and activation link to your email. "});
                            }
                            else {
                                res.status(400).json({ message: 'Something went wrong'});
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            res.status(400).json({ message: 'Something went wrong'});
                        })
                    }).catch((err) => {
                        res.status(400).json({message: err.message});
                    })
                }
            }).catch((err) => {
                res.status(400).json({message: err.message});
            })
          }
    }catch(e){
        res.status(400).json({message: "Bad request"});
    }
});

SignupRouter.post('/validatesignintoken', (req, res) => {
    if (req.body.token){
        // jwt.decode(req.body.token, process.env.JWTExpiryTokenSecret)
        jwt.verify(req.body.token, process.env.JWTExpiryTokenSecret , (err, payload) => {
            console.log(err)
        
            if (err) {
                res.status(400).json({message: err.message});
            } else {
                res.status(200).json({message: 'Success', data: payload});
            }
        
          })
    }
    else {
        res.status(400).json({message: "No token provided."})
    }
});

SignupRouter.post('/createnewpassword', (req, res) => {
    if (req.body.token){
        // jwt.decode(req.body.token, process.env.JWTExpiryTokenSecret)
        jwt.verify(req.body.token, process.env.JWTExpiryTokenSecret , async (err, payload) => {
            console.log(err)
            const hash = await AuthMiddleware.PasswordHasher(req.body.password);
            if (err) {
                res.status(400).json({message: err.message});
            } else {
                UserModel.find({ email: payload.email })
                .then((user) => {
                    if (user.length > 0 ) {
                        if (!user[0].activated){
                            UserModel.findByIdAndUpdate(payload.id, { password: hash, activated: true})
                            .then((result) => {
                                res.status(200).json({ message: "User registration successful." });
                            })
                            .catch((err) => {
                                res.status(400).json({ message: err.message });
                            })
                            UserSettingModel.create({
                                user: payload.id,
                                against: 1,
                                format: 1,
                                difficulty: 1,
                                playas: 'b',
                            }).catch((err) => {
                                console.log(err);
                            })
                        }else {
                            res.status(400).json({ message: "User already activated." });
                        }
                    }
                    else{
                        res.status(400).json({ message: "User doesn't exist." });
                    }
                    
                })
                .catch((err) => {
                    res.status(400).json({ message: err.message });
                })
            }
        
          })
    }
    else {
        res.status(400).json({message: "No token provided."})
    }
});

SignupRouter.post('/login',  (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        UserModel.findOne({ username: username })
        .then((user) => {
            if (user){
                if (user.activated){
                    bcrypt.compare(password, user.password)
                    .then((result) => {
                        if (result){
                            let token = jwt.sign(
                                {
                                    id: user.id,
                                    email: user.email,
                                },
                                process.env.JWTLoginTokenSecret,
                                { expiresIn: "1h" }
                              );
                            res.status(200).json({message: "Login Successful", data: {username: user.username, email: user.email, birthdate: user.birthdate, token: token, id: user.id}});
                        }else {
                            res.status(400).json({ message: "Incorrect password."});
                        }
                    }).catch((err) => {
                        res.status(400).json({ message: "Something went wrong." });
                    })
                }
                else {
                    res.status(400).json({message: "User not activated yet."});
                }
                
            } else {
                res.status(400).json({message: "User doesn't exist."});
            }
        })
        .catch((error) => {
            res.status(400).json({message: error.message});
        })
    }
    else {
        res.status(401).json({message: "Bad request"})
    }
})


module.exports = SignupRouter;