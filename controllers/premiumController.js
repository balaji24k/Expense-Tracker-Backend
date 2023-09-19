const User = require("../models/Users");
const Expense = require("../models/Expenses");

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
  return new Promise((resolve,reject) => {
    s3bucket.upload(params, (err,s3response) => {
      if(err) {
        console.log("something went wrong in uploading", err);
        reject(err);
      }
      else{
        console.log("success", s3response);
        resolve(s3response.Location);
      }
    });
  })
};

exports.downloadExpenses = async(req,res,next) => {
  try {
    const expenses = await req.user.getExpenses();
    console.log("download>>>>>>>>>",req.user.id);
    const stringifiedExpenses = JSON.stringify(expenses);
    const fileName = `Expenses${req.user.id}/${new Date()}.txt`;
    const fileUrl = await uploadtoS3(stringifiedExpenses, fileName);
    console.log("fileUrl:>>>>>>>>",fileUrl);
    const file = await req.user.createDownloadList({fileUrl});
    // console.log("res in download",response)
    res.status(200).json(file);

  } catch (error) {
    console.log(error);
    res.status(400).json({error});
  }
};

exports.getDownloadList = async(req, res, next) => {
	try {
		const files = await req.user.getDownloadLists({
			limit: 5,
			offset: 0,
			// order: [['id', 'DESC']],
		});
		// console.log("files download",files);
		res.status(200).json(files);
	} catch (error) {
		console.log(error,"getdownload")
	}
}

exports.showLeaderboard = async(req, res, next) => {
	try {
		const expenses = await User.findAll({
			attributes : ['id', 'name', 'totalSpent' ],
			order : [['totalSpent',"DESC"]]
		});

		console.log("expenses>>>>>>>>>>", expenses[1]);
		res.status(200).json(expenses);

	} catch (error) {
		res.status(404).json(error);
	}
};

		//1st optimization
		// const expenses = await Expense.findAll({
		// 	attributes : ['userId', [sequelize.fn('sum',sequelize.col('expenses.price')),'spent']],
		// 	group : ['userId']
		// });

		//without optimazation
		// const totalExpenseByUser = {};
		// expenses.forEach(expense => {
		// 	// console.log("inside forEch>>>>>>>",expense.dataValues)
		// 	let userId = expense.dataValues.userId;
		// 	if (totalExpenseByUser[userId]) {
		// 		totalExpenseByUser[userId] += expense.dataValues.price
		// 	}
		// 	else{
		// 		totalExpenseByUser[userId] = expense.dataValues.price;
		// 	}
		// });
		// // console.log("totalExpenseByUser>>>>>>>",totalExpenseByUser);

		// const leaderboardData = []
		// users.forEach(user => {
		// 	// console.log("user foreach",user.dataValues);
		// 	leaderboardData.push({
		// 		name: user.dataValues.name,
		// 		spent: totalExpenseByUser[user.dataValues.id] || 0
		// 	})
		// })
		// leaderboardData.sort((a,b)=> b.spent - a.spent)
