const UserInfo = require('../models/userInfo');

// 创建或更新用户信息
exports.createOrUpdateUserInfo = async (req, res) => {
  try {
    // 从JWT中获取用户ID（假设已通过认证中间件）
    const userId = req.body.userId;

    // 查找是否已有用户信息
    let userInfo = await UserInfo.findOne({ userId });

    if (userInfo) {
      // 如果存在则更新
      userInfo = await UserInfo.findOneAndUpdate(
        { userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        code: 200,
        success: true,
        message: '用户信息更新成功',
        data: userInfo
      });
    } else {
      // 如果不存在则创建
      console.log(req.body);
      const newUserInfo = new UserInfo({
        userId,
        ...req.body,
        // 取出用户名作为昵称
        nickname: req.body.username
      });
      await newUserInfo.save();
      return res.status(201).json({
        code: 201,
        success: true,
        message: '用户信息创建成功',
        data: newUserInfo
      });
    }
  } catch (error) {
    console.error('用户信息操作失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '服务器错误，无法处理用户信息',
      error: error.message
    });
  }
};

// 获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.query.userId;
    const userInfo = await UserInfo.findOne({ userId });
    if (!userInfo) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '未找到用户信息'
      });
    }

     res.status(200).json({
      code: 200,
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '服务器错误，无法获取用户信息',
      error: error.message
    });
  }
};

// 删除用户信息
exports.deleteUserInfo = async (req, res) => {
  try {
    const userId = req.body.userId;
    const userInfo = await UserInfo.findOneAndDelete({ userId });

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: '未找到用户信息'
      });
    }

    res.status(200).json({
      success: true,
      message: '用户信息已删除'
    });
  } catch (error) {
    console.error('删除用户信息失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '服务器错误，无法删除用户信息',
      error: error.message
    });
  }
};
