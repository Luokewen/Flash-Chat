const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  // 发起好友请求的用户
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 接收好友请求的用户
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 好友状态: pending(待处理), accepted(已接受), rejected(已拒绝)
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  // 请求时间
  requestedAt: {
    type: Date,
    default: Date.now
  },
  // 处理时间
  handledAt: {
    type: Date
  }
});

// 确保不会重复添加好友请求
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Friend', friendSchema);
