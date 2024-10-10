const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var passwordReGex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
var usernameReGex = /^[a-zA-Z0-9]*$/;
var emailReGex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

function authHandler(req, res, next) {
  let URL = req.url.endsWith("/")
    ? req.url.toLowerCase().slice(1, req.url.length - 1)
    : req.url.toLowerCase().slice(1);
    
    if (URL.includes(':')){
      URL = URL.split('/')[0]
    }
    console.log(URL)
  if (preLoginRoutes.includes(URL)) {
    if (req.headers.hasOwnProperty("pl") && req.headers.pl === "T") {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else if (secureRoutes.includes(URL)) {
    if (req.headers.hasOwnProperty("pl") && req.headers.pl === "F") {
      checkToken(req, res, next);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    if (req.url.toLowerCase().includes("api-docs")) {
      next();
    }
    else{
      res.status(404).json({ message: "Not Found" });
    }
  }
}

function checkToken(req, res, next) {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Error! Token was not provided." });
    }
    jwt.verify(token, process.env.JWTLoginTokenSecret, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      req.userId = decodedToken.id;
      req.email = decodedToken.email;
      next();
    });
  }
}

function UserCriteria(username, password, email, birthdate, res) {
  if (username.length >= 4 && usernameReGex.test(username)) {
    if (emailReGex.test(email)) {
      return true;
    } else {
      res.status(400).json({ message: "Email does not match the criteria." });
    }
  } else {
    res.status(400).json({ message: "Username does not match the criteria." });
  }
  return false;
}

async function PasswordHasher(password) {
  const hash = await bcrypt
    .genSalt(10)
    .then((salt) => {
      console.log("Salt: ", salt);
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      return hash;
    })
    .catch((err) => console.error(err.message));

  return hash;
}

function GenerateExpiryLink(payload, uri, expirytime = "1h") {
  let token = jwt.sign(payload, process.env.JWTExpiryTokenSecret, {
    expiresIn: expirytime,
  });

  return process.env.PortalLink + uri + "/" + token;
}

const secureRoutes = ["playergames", "setting", "ratings"];
const preLoginRoutes = [
  "signup",
  "register",
  "validatesignintoken",
  "createnewpassword",
  "login",
];

module.exports = {
  authHandler: authHandler,
  UserCriteria: UserCriteria,
  PasswordHasher: PasswordHasher,
  GenerateExpiryLink: GenerateExpiryLink,
};
