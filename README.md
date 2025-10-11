# FlashChat

## 项目简介
FlashChat 是一个基于 Vue 3 和 Node.js 的现代化即时通讯应用，提供实时聊天、好友管理和用户信息维护等功能。

## 技术栈

### 前端技术
- **Vue 3**：渐进式 JavaScript 框架
- **TypeScript**：静态类型检查
- **Vite**：快速的构建工具
- **Pinia**：Vue 3 官方推荐的状态管理库
- **Element Plus**：Vue 3 UI 组件库
- **Socket.IO Client**：实时通信客户端
- **Axios**：HTTP 客户端

### 后端技术
- **Node.js**：JavaScript 运行时环境
- **Express**：Web 应用框架
- **MongoDB**：NoSQL 数据库
- **Socket.IO**：实时通信服务器
- **JWT**：用户认证
- **Multer**：文件上传处理

## 项目结构

```
├── src/                # 前端代码
│   ├── api/            # API 接口定义
│   ├── assets/         # 静态资源
│   ├── components/     # Vue 组件
│   ├── router/         # 路由配置
│   ├── stores/         # 状态管理
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── server/             # 后端代码
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── models/         # 数据模型
│   ├── routes/         # 路由定义
│   ├── utils/          # 工具函数
│   └── server.js       # 服务器入口
├── types/              # TypeScript 类型定义
└── index.html          # HTML 入口文件
```

## 功能特点

### 用户管理
- 用户注册和登录认证
- 用户信息编辑（头像、昵称、简介等）
- JWT 认证机制

### 好友系统
- 好友请求发送与接受
- 好友列表管理
- 好友信息查看

### 聊天功能
- 实时文字聊天（基于 Socket.IO）
- 消息历史记录
- 在线状态显示

## 环境要求

### 前端环境
- Node.js：^20.19.0 || >=22.12.0
- npm：随 Node.js 安装

### 后端环境
- Node.js：推荐 18.x 或更高版本
- MongoDB：4.x 或更高版本

## 安装和运行

### 前端安装与运行

1. 安装依赖
```sh
npm install
```

2. 开发模式运行
```sh
npm run dev
```

3. 构建生产版本
```sh
npm run build
```

4. 预览生产版本
```sh
npm run preview
```

5. 代码检查
```sh
npm run lint
```

### 后端安装与运行

1. 进入服务器目录
```sh
cd server
```

2. 安装依赖
```sh
npm install
```

3. 启动开发服务器（使用 nodemon）
```sh
npm run dev
```

4. 启动生产服务器
```sh
npm start
```

## 环境配置

### 前端配置
前端环境变量配置文件：
- `.env.development`：开发环境配置
- `.env.preview`：预览环境配置

### 后端配置
后端环境变量配置文件：
- `server/.env`：服务器配置（包含 MongoDB 连接信息、JWT 密钥等）

## 开发说明

### 路由结构
- `/`：默认重定向到登录页
- `/login`：登录页面
- `/home`：主页，包含子路由
  - `/home/infoPage`：用户信息页面
  - `/home/groupInfoPage`：群组信息页面
  - `/home/chatPage`：聊天页面
- `/:pathMatch(.*)*`：404 页面

### 状态管理
使用 Pinia 管理以下状态：
- `userStore`：用户信息和认证状态
- `messageStore`：消息和好友请求
- `friendStore`：好友列表和关系

### API 接口
主要 API 接口包括：
- 用户相关：登录、注册、获取用户信息、更新用户信息
- 好友相关：发送好友请求、接受好友请求、获取好友列表
- 聊天相关：发送消息、获取聊天记录

## License
MIT
