const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const DownloadList = sequelize.define('downloadList', {
  id : {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  fileUrl: Sequelize.STRING,
});

module.exports = DownloadList;