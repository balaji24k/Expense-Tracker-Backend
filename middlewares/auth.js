const jwt = require("jsonwebtoken");
const User = require("../models/Users");
require("dotenv").config();

exports.authenticate = async (req, res, next) => {
  console.log("middleware>>>>", req.body);
  try {
    const token = req.header("Authorization");

    // Check if token exists
    if (!token) {
      return res
        .status(403)
        .json({ success: false, message: "No token provided." });
    }

    const userObjJwt = jwt.verify(token, process.env.AUTH_KEY);

    const user = await User.findById(userObjJwt.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("auth middleware>>>>>>>>", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    return res
      .status(401)
      .json({ success: false, message: "User authentication failed" });
  }
};
