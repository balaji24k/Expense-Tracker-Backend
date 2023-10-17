const User = require("../models/Users");
const Expense = require("../models/Expenses");
const DownloadList = require('../models/DownloadList');

require("dotenv").config();

const AWS = require('aws-sdk');

const uploadtoS3 = (data, fileName) => {
  const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: data,
    ACL: 'public-read'
  }
  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("Error in uploading:", err);
        reject(err);
      } else {
        console.log("Upload successful:", s3response);
        resolve(s3response.Location);
      }
    });
  })
};

exports.downloadExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ _id: { $in: req.user.expenses } });

    const stringifiedExpenses = JSON.stringify(expenses);
    const fileName = `Expenses${req.user.id}/${new Date()}.txt`;
    const fileUrl = await uploadtoS3(stringifiedExpenses, fileName);

		const file = new DownloadList({ fileUrl: fileUrl });
		await file.save();
		req.user.downloadLists.push(file._id);
		await req.user.save();
		res.status(200).json({ fileUrl: file.fileUrl });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
};

exports.getDownloadList = async (req, res, next) => {
  try {
    // Assuming the downloadList is an array field in the User schema.
    const userWithFiles = await User.findById(req.user._id).populate('downloadLists').exec();
		const files = userWithFiles.downloadLists.slice(0, 5);
		res.status(200).json(files);
  } catch (error) {
    console.error(error, "getdownload");
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.showLeaderboard = async (req, res, next) => {
  try {
    const expenses = await User.find({}, 'id name totalSpent').sort({ totalSpent: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(404).json(error);
  }
};
