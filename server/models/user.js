const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//用户模型schema
const UserSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 8,
  },
  password:{
    type: String,
    required: true,
    minlength: 6,
    maxlength: 12,
  }
})

//保存前加密密码
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  // 生成盐并加密密码
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 验证密码方法
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

// 修改密码方法
UserSchema.methods.updatePassword = async function(newPassword) {
  this.password = newPassword;
  await this.save();
  return true;
}

module.exports = mongoose.model('User', UserSchema);
