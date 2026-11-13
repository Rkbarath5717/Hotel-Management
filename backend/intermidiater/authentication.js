const jwt = require("jsonwebtoken");

const SECRET_KEY =
  process.env.JWT_SECRET || "hotel_management_demo_secret_change_me";

  
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "PLEASE LOGIN AND ACCESS"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, SECRET_KEY);

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "YOUR LOGIN SESSION IS EXPIRED PLEASE RE-LOGIN..."
    });
  }
}


function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "ADMIN ONLY ACCESS THIS...."
    });
  }

  next();
}

module.exports = {
  SECRET_KEY,
  protect,
  adminOnly
};