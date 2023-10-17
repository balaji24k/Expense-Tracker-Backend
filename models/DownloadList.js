const mongoose = require('mongoose');

const downloadListSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('DownloadList', downloadListSchema);
