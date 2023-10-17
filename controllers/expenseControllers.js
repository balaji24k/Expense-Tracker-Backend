const Expense = require("../models/Expenses");
const User = require("../models/Users");
const mongoose = require('mongoose');

exports.postData = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const totalSpent = Number(req.user.totalSpent) + Number(req.body.price);
    await User.findByIdAndUpdate(
      req.user._id,
      { totalSpent: totalSpent },
      { session }
    );
    const expense = new Expense({ ...req.body, userId: req.user._id });
    const savedExpense = await expense.save({ session });

    req.user.expenses.push(savedExpense._id);
    await req.user.save({ session });

    await session.commitTransaction();
    res.status(200).json(savedExpense);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json(error);
  } finally {
    session.endSession();
  }
};


exports.getData = async (req, res, next) => {
  try {
    console.log("query>>>>>", req.query);
    const { numberOfRows, currPage } = req.query;

    const expenses = await Expense.find({ userId: req.user._id })
      .skip((+currPage - 1) * +numberOfRows)
      .limit(+numberOfRows)
      .sort({ _id: -1 }); 

    const totalExpensesCount = await Expense.countDocuments({
      userId: req.user._id,
    });

    res.status(200).json({ expenses, totalExpensesCount, user: req.user });
  } catch (error) {
    res.status(500).json({ error });
  }
};


exports.deleteData = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    const totalSpent = Number(req.user.totalSpent) - Number(expense.price);

    const userUpdate = await User.findByIdAndUpdate(req.user._id, {
      totalSpent,
    });
    const expenseDelete = await Expense.findByIdAndDelete(req.params.id);

    if (userUpdate && expenseDelete) {
      res.status(204).json({});
    } else {
      throw new Error("Failed to delete or update.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateData = async (req, res, next) => {
  try {
    const totalSpent =
      Number(req.user.totalSpent) -
      Number(req.body.prevExpensePrice) +
      Number(req.body.price);

    const expenseUpdate = await Expense.findByIdAndUpdate(req.params.id, {
      price: req.body.price,
    });
    const userUpdate = await User.findByIdAndUpdate(req.user._id, {
      totalSpent,
    });

    if (expenseUpdate && userUpdate) {
      res.status(200).json(req.body);
    } else {
      throw new Error("Failed to update.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
