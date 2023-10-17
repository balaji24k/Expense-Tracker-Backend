const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const isValidString = (string) => {
  if (string == null || string.length === 0) {
    return true;
  } else {
    return false;
  }
};

const generateAccessToken = (id, name) => {
  return jwt.sign({ userId: id, name: name }, process.env.AUTH_KEY);
};

exports.signup = async (req, res) => {
  console.log("body>>>>>>>>>>>>>>>", req.body);
  const { name, email, password } = req.body;

  try {
    if (
      isValidString(name) ||
      isValidString(email) ||
      isValidString(password)
    ) {
      return res.status(400).json({
        success: false,
        error: "invaild inputs, please enter valid details",
      });
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }

    // If email doesn't exist, create a new user
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, error: "Password hashing failed" });
      }

      const newUser = new User({ name, email, password: hash });
      await newUser.save();
      res
        .status(200)
        .json({ success: true, message: "Account Created Successfully!" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.login = async (req, res, next) => {
  console.log("login>>>>>", req.body);
  const { email, password } = req.body;

  try {
    if (isValidString(email) || isValidString(password)) {
      return res.json({
        success: false,
        error: "invaild inputs, please enter valid details",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email: email });
    if (user) {
      const hashPassword = user.password;
      bcrypt.compare(password, hashPassword, (err, result) => {
        if (err) {
          return res
            .status(400)
            .json({ success: false, error: "something went wrong!" });
        }
        if (result) {
          return res.status(200).json({
            success: true,
            message: "Logged in Successfully!",
            name: user.name,
            token: generateAccessToken(user._id, user.name),
          });
        } else {
          return res
            .status(400)
            .json({ success: false, error: "incorrect password!" });
        }
      });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "user does not exist, create account" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};