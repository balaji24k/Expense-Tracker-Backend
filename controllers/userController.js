const Users = require("../models/Users");
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

const generateAccessToken = (id,name) => {
  return jwt.sign({userId: id, name : name}, process.env.AUTH_KEY);
}
 
exports.signup = async (req, res) => {
  console.log("body>>>>>>>>>>>>>>>", req.body);
  const { name, email, password } = req.body;

  try {
    if (isValidString(name) || isValidString(email) || isValidString(password)){
      return res.status(400).json({success:false, error: "invaild inputs, please enter valid details" });
    }

    // Check if the email already exists in the database
    const existingUser = await Users.findAll({ where: { email: email } });
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }

    // If email doesn't exist, create a new user
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      Users.create({name, email, password: hash});
      res.status(200).json({ success: true, message: "Account Created Succesfully!"});
    })

  } catch (error) {
    res.status(400).json({ success: false, error: "Server error" });
  }
};

exports.login = async(req, res, next) => {
  console.log("login>>>>>",req.body)
  const { email, password } = req.body;
  try {
    if (isValidString(email) || isValidString(password)){
      return res.json({success:false, error: "invaild inputs, please enter valid details"});
    }
    const user = await Users.findAll({ where: { email } });
    if(user.length > 0) {
      const userData = user[0].dataValues;
      const hashPassword = userData.password;
      bcrypt.compare(password, hashPassword, (err, result) => {
        if(err) {
          return res.status(400).json({success:false, error: "something went wrong!"})
        }
        if (result) {
          return res.status(200).json({ 
            success: true, 
            message: "Loggedin Succesfully!", 
            name : userData.name,
            token: generateAccessToken(userData.id,userData.name)});
        }
        else {
          return res.status(400).json({success:false, error: "incorrect password!"})
        }
      }) 
    }
    else {
      return res.status(404).json({success:false, error: "user does not exist, create account"})
    }
  }
  catch(err) {
    res.status(400).json({error:err.message});
  }
};


