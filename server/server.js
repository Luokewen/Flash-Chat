const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { Server } = require('socket.io')
const routerInit = require('./config/router')
const { verifyJwt } = require('./utils/jwt')
const PrivateMessage = require('./models/privateMessage')

//加载环境变量
dotenv.config()

//创建Express应用
const app = express()

//中间件  cors
app.use(cors())

//中间件 express.json()  解析json格式的请求体
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 创建Socket.IO服务器
const server = require('http').createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// 存储用户 ID 与 Socket 连接的映射（用于定向发送消息）
const userSocketMap = new Map()

// 存储在线用户
const onlineUsers = new Map()

// 连接Socket.IO服务器
io.on('connection', (socket) => {
  console.log('一个用户已连接:', socket.id)
})

// Socket 连接处理
io.on('connection', (socket) => {
  console.log('新客户端连接:', socket.id)

  // 客户端连接时，让用户登录（绑定用户 ID 与 Socket）
  socket.on('userLogin', (userId) => {
    userSocketMap.set(userId, socket.id)
    onlineUsers.set(userId, socket.id)
    console.log(`用户 ${userId} 绑定 Socket: ${socket.id}`)
  })

  // 发送消息
  socket.on('sendMessage', async (messageData) => {
    try {
      const { fromUserId, toUserId, content, type = 'text' } = messageData
      console.log('收到消息:', messageData)
      // 创建消息记录
      const message = new PrivateMessage({
        fromUserId,
        toUserId,
        content,
        type,
        timestamp: new Date(),
        status: onlineUsers.has(toUserId) ? 'delivered' : 'sent',
      })

      // 保存消息到数据库
      await message.save()

      // 构建要发送的消息对象
      const messageToSend = {
        id: message._id,
        fromUserId,
        toUserId,
        content,
        type,
        timestamp: message.timestamp,
        status: message.status,
      }

      // 如果接收者在线，直接发送消息
      const receiverSocketId = onlineUsers.get(toUserId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', messageToSend)
      }

      // 通知发送者消息已发送
      socket.emit('messageSent', {
        code: 200,
        id: message._id,
        status: message.status,
        timestamp: message.timestamp,
      })
    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('messageError', { code: 500, error: 'Failed to send message' })
    }
  })

  // 消息已读确认
  socket.on('messageRead', async (messageIds) => {
    try {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return

      // 更新消息状态为已读
      await PrivateMessage.updateMessageStatus(messageIds, 'read', socket.userId)

      // 通知发送者消息已读
      const messages = await PrivateMessage.find({ _id: { $in: messageIds } })
      messages.forEach((msg) => {
        const senderSocketId = onlineUsers.get(msg.fromUserId)
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageReadConfirmation', {
            messageIds: [msg._id],
            readerId: socket.userId,
          })
        }
      })
    } catch (error) {
      console.error('Error updating message read status:', error)
    }
  })

  // 获取历史消息
  socket.on('getHistory', async ({ userId, friendId, limit = 50, skip = 0 }) => {
    try {
      const messages = await PrivateMessage.findMessagesBetweenUsers(userId, friendId, {
        limit,
        skip,
      })

      socket.emit('historyMessages', {
        code: 200,
        friendId,
        messages,
      })
    } catch (error) {
      console.error('Error fetching history messages:', error)
      socket.emit('historyError', { code: 500, error: 'Failed to fetch messages' })
    }
  })

  // 撤回消息
  socket.on('recallMessage', async (messageId) => {
    try {
      const message = await PrivateMessage.findById(messageId)

      // 验证是否是消息发送者
      if (!message || message.fromUserId !== socket.userId) {
        return socket.emit('recallError', { error: 'Unauthorized' })
      }

      // 更新消息为已撤回
      message.isRecalled = true
      message.recallTimestamp = new Date()
      await message.save()

      // 通知接收者消息已撤回
      const receiverSocketId = onlineUsers.get(message.toUserId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('messageRecalled', {
          messageId: message._id,
        })
      }

      // 确认发送者消息已撤回
      socket.emit('messageRecallConfirmed', { messageId: message._id })
    } catch (error) {
      console.error('Error recalling message:', error)
      socket.emit('recallError', { error: 'Failed to recall message' })
    }
  })

  // 断开连接时清理映射
  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id)
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId)
        break
      }
    }
  })
})

// 将 io 实例挂载到 app 上，方便其他模块使用
app.set('io', io)
app.set('userSocketMap', userSocketMap)

// 验证jwt
// app.use(verifyJwt());
app.use(express.static('public')) // 静态资源

//连接数据库
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch((err) => console.log('MongoDB 连接失败:', err))

// 路由初始化
routerInit(app)

// 根路由
app.get('/', (req, res) => {
  res.send('API 运行中')
})

// 启动服务器
const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`))
