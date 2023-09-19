const Expenses = require("../models/Expenses");
const User = require("../models/Users");
const sequelize = require("../util/database");

exports.postData = async(req, res, next) => {
  const tran = await sequelize.transaction();
  try {
    const totalSpent = Number(req.user.totalSpent) + Number(req.body.price);
    const promise1 = User.update(
      {totalSpent : totalSpent},
      {where : {id: req.user.id},transaction:tran}
    )
    const promise2 = req.user.createExpense(req.body,{transaction:tran});

    const result = await Promise.all([promise1,promise2]);
    await tran.commit();
    res.status(200).json(result[1]);
  } catch (error) {
    if (tran) {
      await tran.rollback();
    }
    res.status(500).json(error);
  }
};

exports.getData = async(req, res, next) => {
  try {
    console.log("query>>>>>",req.query);
    const {numberOfRows,currPage} = req.query;
    const expenses = await req.user.getExpenses({
			limit: +numberOfRows,
			offset: (+(currPage)-1)*(+numberOfRows),
			order: [['id', 'DESC']],
		});
    const totalExpensesCount = await req.user.countExpenses();
    res.status(200).json({expenses,totalExpensesCount,user:req.user});
  } catch (error) {
    res.status(500).json({error});
  }
};

exports.deleteData = async(req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const expense = await req.user.getExpenses({where: {id: req.params.id}, transaction});
    const totalSpent = Number(req.user.totalSpent) - Number(expense[0].dataValues.price);
    const promise1 = User.update({totalSpent : totalSpent},{where : {id: req.user.id}, transaction})
    const promise2 = Expenses.destroy({where: {id: req.params.id}, transaction})
  
    const result = await Promise.all([promise1,promise2]);
    await transaction.commit();
    res.status(204).json(result);
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    res.status(404).json({error})
  }
};

exports.updateData = async(req, res, next) => {
  try {
    const totalSpent = Number(req.user.totalSpent) - Number(req.body.prevExpensePrice) + Number(req.body.price);
    const promise1 = Expenses.update({price : req.body.price},{where : {id: req.params.id}})
    const promise2 = User.update({totalSpent : totalSpent},{where : {id: req.user.id}})
    
    await Promise.all([promise1,promise2])
    res.status(200).json(req.body);
  } catch (error) {
    res.status(500).json({error})
  }

};



  // Expenses.destroy({where: {id: req.params.id, userId: deletingUserId}})
  //   .then(numOfRows => {
  //     console.log("mum of rows delete",numOfRows);
  //     if(numOfRows === 0) {
  //       return res.status(404).json({success:false, message : "Expense does not belongs to user!"})
  //     }
  //     return res.status(200).json({success:true, message : "Deleted Successfully"});
  //   })
  //   .catch(err => {
  //     res.status(500).json({success:false, message : "Failed!"});
  //   })

  // Expenses.findByPk(req.params.id)
  //   .then(result => {
  //     result.destroy();
  //   }).catch((err) => {
  //       res.json(err);
  //   });
