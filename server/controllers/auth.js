const User = require('../models/user');
const { generateToken } = require('../utils/jwt');

// @desc    注册用户
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查用户是否已存在
    let user = await User.findOne({ username });
    if (user) {
      return res.status(405).json({
        code: 405,
        success: false,
        message: '用户名已被使用'
      });
    }

    // 创建新用户
    user = await User.create({
      username,
      password
    });

    // 生成令牌
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({
      code: 500,
      success: false,
      message: '服务器错误',
      error: err.message
    });
  }
};

// @desc    用户登录
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证密码是否提供
    if (!password) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '请提供密码'
      });
    }

    // 检查用户是否存在
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: '无效的凭据'
      });
    }

    // 检查密码是否匹配
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: '无效的凭据'
      });
    }

    // 生成令牌
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      code: 500,
      success: false,
      message: '服务器错误',
      error: err.message
    });
  }
};

// 生成并发送令牌响应
const sendTokenResponse = (user, statusCode, res) => {
  // 创建令牌
  const token = generateToken(user._id);

  res.status(statusCode).json({
    code: statusCode,
    message: 'success',
    token,
    data: {
       id: user._id,
      username: user.username
     }
  });
};

// @desc    修改密码
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;
    
    // 验证请求数据
    if (!currentPassword || !newPassword || !userId) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '请提供当前密码、新密码和用户ID'
      });
    }
    
    // 查找用户
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '用户不存在'
      });
    }
    
    // 验证当前密码
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: '当前密码错误'
      });
    }
    
    // 修改密码
    await user.updatePassword(newPassword);
    
    return res.status(200).json({
      code: 200,
      success: true,
      message: '密码修改成功'
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      success: false,
      message: '服务器错误',
      error: err.message
    });
  }
};
