const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  console.log("in admin middleware before requiresAuth")
  if (!config.get("requiresAuth")) return next();
  const token = req.header("x-auth-token");
  console.log("token", token)
  if (!token) return res.status(401).send("Access denied. No token provided.");
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.admin = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
