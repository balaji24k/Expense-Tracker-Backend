const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Expenses = sequelize.define('expenses', {
  id : {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  expense: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  },
});

module.exports = Expenses;