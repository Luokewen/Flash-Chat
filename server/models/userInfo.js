const mongoose = require('mongoose')

// 定义用户信息 schema
const userInfoSchema = new mongoose.Schema(
  {
    // 关联的用户ID（通常与用户认证表关联）
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // 关联的模型名称
      required: true,
      unique: true,
    },
    // 年龄
    age: {
      type: Number,
      min: 0,
      max: 150,
    },
    // 性别
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unknown'],
      default: 'unknown',
    },
    // 头像URL
    avatar: {
      type: String,
      //获取图片链接的绝对路径
      default: 'http://localhost:3000/assets/avatar/default-avatar.jpg',
    },
    // 昵称
    nickname: {
      type: String,
      default: '',
    },
    // 个人简介
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    // 地址
    address: {
      type: String,
      default: '',
    },
    // 出生日期
    birthday: {
      type: Date,
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
  },
)

// 创建模型
module.exports = mongoose.model('UserInfo', userInfoSchema)
