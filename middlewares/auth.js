const jwt = require("jsonwebtoken");
const User = require("../models/Users");
require("dotenv").config();

exports.authenticate = async(req, res, next) => {
	console.log("middleware>>>>", req.body);
	try {
		const token = req.header("Authorization");
		const userObjJwt = jwt.verify(token,process.env.AUTH_KEY);
		const user = await User.findByPk(userObjJwt.userId)
		req.user = user;
		next();	
	}
	catch(err) {
		console.log("auth middleware>>>>>>>>",err);
		return res.status(401).json({success : false, message:"user does not exists"})
	}
}