const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  console.log("in auth before requiresAuth")
  if (!config.get("requiresAuth")) return next();

  console.log("in auth", config.get("requiresAuth"))
  const token = req.header("x-auth-token");
  console.log("token", token)
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    console.log("decoded", decoded)
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
