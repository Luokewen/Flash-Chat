<template>
  <div class="home">
    <!-- 侧边栏（宽度固定） -->
    <div class="aside">
      <Aside @sendData="handleItemClick" />
    </div>

    <!-- 信息列表（可拖拽调整宽度） -->
    <div class="info-list" :style="{ width: infoListWidth + 'px' }">
      <InfoList :info-items="infoItems" v-show="currentView === 'info'" />
      <ContactList v-show="currentView === 'contact'" />
    </div>
    <!-- 拖拽手柄（仅用于信息列表右侧） -->
    <div class="resize-handle" @mousedown="startResize"></div>

    <!-- 主内容区（自动适应剩余宽度） -->
    <div class="main-body">
      <Badge />
      <router-view></router-view>
    </div>
    <Notification v-model="notificationVisible" />
  </div>
</template>

<script lang="ts" setup>
import Aside from '@/components/aside/Aside.vue';
import ContactList from '@/components/infoList/ContactList.vue';
import InfoList from '@/components/infoList/InfoList.vue';
import api from '../../api'
import { onMounted, watch } from 'vue';
import { useUserStore } from '../stores/userStore'
//导入userInfo类型
import { type UserInfo } from '../../types/userInfo';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElNotification } from 'element-plus';
import { useMessageStore } from '@/stores/messageStore';
import socket, { initSocket } from '../../utils/socket';
import type { FriendListItem, FriendRequestList } from '../../types/friends';
import { useFriendsStore } from '@/stores/friendStore';
import Badge from '@/components/badge/Badge.vue';
import Notification from '@/components/notification/Notification.vue';

const router = useRouter();

const userStore = useUserStore();
// 主页挂载后发起请求
onMounted(() => {
  // 获取用户信息
  api.userInfo.getUserInfo({ userId: userStore.user.id }).then(res => {
    const userInfo: UserInfo = res.data;
    //获取状态码
    if (userInfo.code === 200) {
      userStore.userInfo = {
        ...userInfo.data,
      };
    }
  }).catch(err => {
    ElMessage.error("用户信息获取失败");
    localStorage.removeItem('token');
    userStore.$reset();
    router.push('/login');
  })
    ;
});

// 视图切换状态
const currentView = ref('info');

const handleItemClick = (index: number) => {
  switch (index) {
    case 0:
      currentView.value = 'info';
      break;
    case 1:
      currentView.value = 'contact';
      break;
    default:
      currentView.value = currentView.value;
  }
}

// 信息列表宽度控制（核心）
const infoListWidth = ref(300); // 默认宽度
const isResizing = ref(false);  // 拖拽状态标记

// 开始拖拽（仅针对信息列表）
const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  const startX = e.clientX; // 记录初始鼠标X坐标
  const startWidth = infoListWidth.value; // 记录初始宽度

  // 鼠标移动时调整宽度
  const handleMouseMove = (moveEvent: MouseEvent) => {
    if (!isResizing.value) return;

    // 计算鼠标移动距离（正数向右拖宽，负数向左拖窄）
    const deltaX = moveEvent.clientX - startX;
    // 计算新宽度并限制范围（最小200px，最大600px）
    const newWidth = Math.max(200, Math.min(600, startWidth + deltaX));
    // 更新宽度（响应式驱动视图变化）
    infoListWidth.value = newWidth;
  };

  // 结束拖拽
  const handleMouseUp = () => {
    isResizing.value = false;
    // 移除全局事件监听
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    // 恢复鼠标样式
    document.body.style.cursor = '';
    // 移除拖拽状态类
    document.body.classList.remove('resizing');
  };

  // 添加全局事件监听（确保鼠标移出手柄仍能响应）
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  // 设置拖拽时的鼠标样式
  document.body.style.cursor = 'ew-resize';
  // 添加拖拽状态类（用于禁用文本选择）
  document.body.classList.add('resizing');
  // 阻止默认行为（避免拖拽时选中文本）
  e.preventDefault();
};

// 模拟信息列表数据
const infoItems = ref([
  {
    id: 1,
    name: "张三",
    avatar: "https://picsum.photos/id/1/200/200",
    message: "你好，请问有什么可以帮助你的吗？",
    time: "09:45",
    unread: true,
    unreadCount: 2
  },
  {
    id: 2,
    name: "李四",
    avatar: "https://picsum.photos/id/2/200/200",
    message: "项目进度已经更新，请查收",
    time: "昨天",
    unread: false,
    unreadCount: 0
  },
  {
    id: 3,
    name: "王五",
    avatar: "https://picsum.photos/id/3/200/200",
    message: "周末有空一起聚餐吗？",
    time: "08:30",
    unread: true,
    unreadCount: 1
  },
  {
    id: 4,
    name: "技术部群聊",
    avatar: "https://picsum.photos/id/4/200/200",
    message: "小明：新版本将在下周一发布",
    time: "周三",
    unread: false,
    unreadCount: 0
  },
  {
    id: 5,
    name: "产品经理",
    avatar: "https://picsum.photos/id/5/200/200",
    message: "需求文档已经发送到邮箱",
    time: "07:15",
    unread: true,
    unreadCount: 3
  },
  {
    id: 6,
    name: "人力资源",
    avatar: "https://picsum.photos/id/6/200/200",
    message: "请在周五前完成绩效考核表",
    time: "上周",
    unread: false,
    unreadCount: 0
  },
  {
    id: 7,
    name: "客户A",
    avatar: "https://picsum.photos/id/7/200/200",
    message: "这个方案我们接受，安排签约吧",
    time: "06:40",
    unread: false,
    unreadCount: 0
  },
  {
    id: 8,
    name: "客户B",
    avatar: "https://picsum.photos/id/8/200/200",
    message: "收到，请尽快回复",
    time: "昨天",
    unread: true,
    unreadCount: 1
  },
  {
    id: 9,
    name: "客户C",
    avatar: "https://picsum.photos/id/9/200/200",
    message: "关于合作事宜，请尽快回复",
    time: "08:20",
    unread: true,
    unreadCount: 2
  },
  {
    id: 10,
    name: "客户D",
    avatar: "https://picsum.photos/id/10/200/200",
    message: "收到，请安排一下",
    time: "昨天",
    unread: false,
    unreadCount: 0
  },
  {
    id: 11,
    name: "客户E",
    avatar: "https://picsum.photos/id/11/200/200",
    message: "请尽快回复，谢谢",
    time: "08:50",
    unread: true,
    unreadCount: 1
  },
  {
    id: 12,
    name: "客户F",
    avatar: "https://picsum.photos/id/12/200/200",
    message: "方案已经收到，正在评估中",
    time: "昨天",
    unread: false,
    unreadCount: 0
  },
  {
    id: 13,
    name: "客户G",
    avatar: "https://picsum.photos/id/13/200/200",
    message: "请尽快回复，谢谢",
    time: "09:10",
    unread: true,
    unreadCount: 2
  },
  {
    id: 14,
    name: "客户H",
    avatar: "https://picsum.photos/id/14/200/200",
    message: "合同已经签署，期待合作",
    time: "昨天",
    unread: false,
    unreadCount: 0
  },
])

// 未读请求数量
const unreadRequests = ref(0);
const messageStore = useMessageStore();


watch(() => unreadRequests.value, (newUser) => {
  messageStore.friendRequestCount = newUser;
})

// 初始化 Socket 并加载现有请求
onMounted(() => {
  initSocket();
  loadFriendRequests();
  setupSocketListeners();
  loadFriend()
});

// 加载现有好友请求（修复异步处理和参数名问题）
const loadFriendRequests = async () => {
  if (!userStore.user?.id) return;
  try {
    // 1. 修复：添加 await 处理异步请求
    // 2. 修复：参数名从 userId 改为 id（与后端接口匹配）
    const res: any = await api.friend.getFriendRequests({ userId: userStore.user.id });

    // 3. 修复：正确提取双层 data 中的数组（后端返回格式是 { code:200, data: [...] }）
    const requestList: FriendRequestList = res.data.data || [];

    // 4. 正确更新未读数量
    unreadRequests.value = requestList.length;
    messageStore.friendRequestList = requestList;
  } catch (err) {
    console.error('加载好友请求失败:', err);
    ElMessage.error('加载好友请求失败');
  }
};

const notificationVisible = ref(false);

// 设置 Socket 事件监听
const setupSocketListeners = () => {
  // 监听新的好友请求
  socket.on('new-friend-request', (request) => {
    console.log('收到新好友请求:', request);
    unreadRequests.value++;

    // 显示通知
    ElNotification({
      title: '新的好友请求',
      message: `${request.username} 想加你为好友`,
      duration: 5000,
      onClick: () => {
        notificationVisible.value = !notificationVisible.value;
      }
    });

    // 刷新请求列表
    loadFriendRequests();
  });

  // 监听好友请求处理结果
  socket.on('friend-request-handled', (result) => {
    console.log('好友请求处理结果:', result);
    const message = result.status === 'accepted'
      ? `${result.recipientName} 接受了你的好友请求`
      : `${result.recipientName} 拒绝了你的好友请求`;

    ElMessage.success(message);
    // 处理结果后刷新请求列表
    loadFriendRequests();
    if (result.status === 'accepted') {
      // 如果请求被接受，刷新好友列表
      loadFriend()
    }
  });
};

const friendStore = useFriendsStore();

const loadFriend = async () => {
  if (!userStore.user?.id) return;
  try {
    const res: any = await api.friend.getFriends({ id: userStore.user.id });
    const friendList: FriendListItem[] = res.data.data || [];
    friendStore.friends = friendList;
  } catch (err) {
    console.error('加载好友列表失败:', err);
    ElMessage.error('加载好友列表失败');
  }
};

</script>

<style scoped lang="less">
.home {
  display: flex;
  flex-direction: row;
  height: 100vh;
  overflow: hidden;
  /* 防止页面整体滚动 */
}

// 侧边栏（宽度固定，不参与拖拽）
.aside {
  width: 60px;
  height: 100vh;
  background-color: #ECECEC;
  flex-shrink: 0;
  /* 固定宽度，不被压缩 */
}

// 信息列表（可调整宽度）
.info-list {
  height: 100vh;
  background-color: #FFFFFF;
  overflow: hidden;
  flex-shrink: 0;
  /* 确保宽度调整时不被压缩 */
}

// 拖拽手柄（仅在信息列表右侧）
.resize-handle {
  width: 2px;
  /* 拖拽区域宽度 */
  height: 100vh;
  background-color: #DCDCDC;
  // 双向箭头
  cursor: ew-resize;
  /* 鼠标悬停显示左右拖拽图标 */
  flex-shrink: 0;
  /* 固定宽度 */
  transition: background-color 0.2s;

}

// 主内容区（自动填充剩余空间）
.main-body {
  background-color: #f5f7fa;
  height: 100vh;
  flex: 1;
  /* 自动占据剩余宽度，无需手动计算 */
  overflow: hidden;
}

// 全局样式：拖拽时禁用文本选择
:global(.resizing) {
  user-select: none;
  -webkit-user-select: none;
}
</style>
