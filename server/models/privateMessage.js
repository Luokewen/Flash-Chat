const mongoose = require('mongoose')

const privateMessageSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: String,
      required: true,
      ref: 'User',
      index: true, // 为常用查询字段创建索引
    },
    toUserId: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    content: {
      type: String,
      required: function () {
        // 文本类型消息必须有内容
        return this.type === 'text'
      },
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video'], // 限制消息类型
      default: 'text',
    },
    // 媒体文件相关信息（如果不是文本消息）
    mediaInfo: {
      url: String,
      name: String,
      size: Number,
      mimeType: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      // 状态：sent(已发送), delivered(已送达), read(已读), failed(发送失败)
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent',
      index: true,
    },
    roomId: {
      type: String,
      index: true,
    },
    // 用于软删除，存储已删除该消息的用户ID
    _deletedFor: [String],
    // 是否为撤回消息
    isRecalled: {
      type: Boolean,
      default: false,
    },
    // 撤回时间（如果消息被撤回）
    recallTimestamp: Date,
  },
  {
    // 自动添加 createdAt 和 updatedAt 字段
    timestamps: true,
    // 自定义 JSON 转换（例如隐藏内部字段）
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v
        return ret
      },
    },
  },
)

// 创建复合索引，优化查询两个人之间的消息
privateMessageSchema.index({ fromUserId: 1, toUserId: 1, timestamp: -1 })
privateMessageSchema.index({ roomId: 1, timestamp: -1 })

// 添加查询方法：获取两个用户之间的消息
privateMessageSchema.statics.findMessagesBetweenUsers = function (userId1, userId2, options = {}) {
  const { limit = 50, skip = 0, sort = { timestamp: -1 } } = options

  return this.find({
    $or: [
      { fromUserId: userId1, toUserId: userId2 },
      { fromUserId: userId2, toUserId: userId1 },
    ],
    // 排除已删除的消息
    _deletedFor: { $nin: [userId1] },
  })
    .sort(sort)
    .skip(skip)
    .limit(limit)
}

// 添加查询方法：更新消息状态
privateMessageSchema.statics.updateMessageStatus = function (messageIds, status, userId) {
  return this.updateMany(
    {
      _id: { $in: messageIds },
      toUserId: userId,
      status: { $lt: status }, // 确保状态是递进更新的
    },
    { $set: { status, updatedAt: Date.now() } },
  )
}

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema)

module.exports = PrivateMessage
