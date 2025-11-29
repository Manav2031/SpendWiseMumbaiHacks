const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const a = req.headers.authorization;
  if (!a) return res.status(401).json({ message: "No token" });
  const token = a.split(" ")[1];
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    req.user = p;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
};
