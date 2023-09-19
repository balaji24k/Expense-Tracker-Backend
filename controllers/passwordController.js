const uuid = require("uuid");
const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const { createTransport } = require("nodemailer");
require("dotenv").config();

const ForgotPassword = require("../models/ForgotPassword");

const transporter = createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: "balaji325s@gmail.com",
    pass: process.env.MAIL_API_KEY,
  },
});

exports.forgotPassword = async (req, res, next) => {
  try {
    const {email} = req.body;
    console.log("email forgot>>>>>>",email)
    const user = await Users.findOne({ where: { email } });
    console.log("user forgot>>>>>>>>>>>",user)
    const id = uuid.v4();

    const mailOptions = {
      from: "balaji325s@gmail.com",
      to: email,
      subject: "Password Recovery",
      text: `http://localhost:4000/password/resetPassword/${id}`,
    };

    if (user) {
      await user.createForgotPassword({ id});
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) { 
          console.log(err);
          return;
        } 
        console.log("email sent>>>>>>>>>>>",info);
        res.status(200).json({message:"Email Sent!"})
      });
    } 
    else {
      throw new Error("User does not exists!");
    }
  } catch (error) {
    // console.log("err>>>>>>>>>>", error);
    res.status(400).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // console.log("id in reset>>>>>", req.params);
    const {id} = req.params;
    const forgotPasswordReq = await ForgotPassword.findOne({ where: { id } });
    if (forgotPasswordReq && forgotPasswordReq.active) {
      console.log("forg pass req>>",forgotPasswordReq)
      forgotPasswordReq.update({ active: false });
      res.status(200).send(
        `<html>
            <form action="/password/updatePassword/${id}" method="post">
                <label for="newpassword">Enter New password</label>
                <input name="newPassword" type="password" required></input>
                <button>Reset Password</button>
            </form>
        </html>`
      );
      res.end();
    }
  } catch (error) {
    console.log("reset password>>>>>>>>>>>", error);
  }
};

exports.updatePassword = async(req, res, next) => {
  // console.log("updatePass>>>>>>>>>.",req.body.newPassword);
  try {
    const newPassword = req.body.newPassword;
    const {resetPasswordId} = req.params;
    console.log("resetPasswordId",resetPasswordId)
    const reserPasswordReq = await ForgotPassword.findOne({ where : { id: resetPasswordId }});
    const user = await Users.findOne({where: {id: reserPasswordReq.userId}});
    if(user) {
      const saltRounds = 10;
      bcrypt.hash(newPassword, saltRounds, (err, hash) => {
        user.update({password: hash});
        res.status(200).json({ success: true, message: "Password Changed Succesfully!"});
      })
    }
  } catch (error) {
    console.log(error)
  }
};
