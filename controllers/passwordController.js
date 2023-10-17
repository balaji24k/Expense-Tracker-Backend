const User = require("../models/Users");
const ForgotPassword = require("../models/ForgotPassword");
const bcrypt = require("bcrypt");
const { createTransport } = require("nodemailer");
const uuid = require("uuid");

require("dotenv").config();

const transporter = createTransport({
  host: process.env.MAIL_API_HOST,
  port: process.env.MAIL_API_PORT,
  auth: {
    user: process.env.MAIL_API_MAILID,
    pass: process.env.MAIL_API_KEY,
  },
});

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (user) {
      const uniqueReqId = uuid.v4();
      const forgotPasswordInstance = new ForgotPassword({ token: uniqueReqId, user: user._id });
      await forgotPasswordInstance.save();

      const fromMail = process.env.MAIL_API_MAILID;
      const mailOptions = {
        from: fromMail,
        to: email,
        subject: "Password Recovery",
        text: `http://localhost:4000/password/resetPassword/${uniqueReqId}`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Email sending failed" });
        }
        res.status(200).json({ message: "Email Sent!" });
      });
    } else {
      throw new Error("User does not exist!");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const forgotPasswordReq = await ForgotPassword.findOne({ token });

    if (forgotPasswordReq && forgotPasswordReq.active) {
      forgotPasswordReq.active = false;
      await forgotPasswordReq.save();

      res.status(200).send(`
        <html>
          <form action="/password/updatePassword/${token}" method="post">
            <label for="newpassword">Enter New password</label>
            <input name="newPassword" type="password" required></input>
            <button>Reset Password</button>
          </form>
        </html>`
      );
    } else {
      throw new Error("Invalid or used link!");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updatePassword = async (req, res, next) => {
  try {
    const newPassword = req.body.newPassword;
    const { resetPasswordId } = req.params;

    const resetPasswordReq = await ForgotPassword.findOne({ token: resetPasswordId });
    if (!resetPasswordReq) throw new Error("Reset token not found!");

    const user = await User.findById(resetPasswordReq.user);
    if (!user) throw new Error("User not found!");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password Changed Successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
