<template>
  <div class="home">
    <showSetting v-model:visible="settingVisible" />
    <logout-dialog v-if="activeIndex === 2" />
    <div class="aside">
      <div class="logo">
        <div>Flash Chat</div>
      </div>
      <div class="user-avatar">
        <el-avatar :size="45" :src="avatarUrl" @error="errorHandler">
          <img src="@/assets/avatar/error-avatar.png" />
        </el-avatar>
      </div>
      <div class="menu">
        <!-- 使用v-for循环渲染菜单项 -->
        <div class="menu-item" @click="handleclick(item.index)"
          :class="{ 'menu-item-active': activeIndex === item.index }" v-for="item in menuItems" :key="item.index">
          <el-icon size="20" :color="activeIndex === item.index ? activeColor : defaultColor">
            <component :is="item.icon" />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ChatDotRound, Setting, SwitchButton, User } from '@element-plus/icons-vue'
//导入头像
import showSetting from '../setting/Setting.vue'
import LogoutDialog from '../logout/LogoutDialog.vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const errorHandler = () => true

// 获取头像链接
const avatarUrl = ref(userStore.userInfo.avatar)

// 监听用户信息的变化，更新头像链接
watch(
  () => userStore.userInfo.avatar,
  (newUrl) => {
    avatarUrl.value = newUrl
  }
)
// 定义菜单配置数组
const menuItems = [
  { index: 0, icon: ChatDotRound },
  { index: 1, icon: User },
  { index: 2, icon: SwitchButton },
  { index: 3, icon: Setting },
]

// 选中状态管理
const activeIndex = ref(0) // 默认选中第一个菜单
const activeColor = ref('#409EFF') // 选中时的图标颜色
const defaultColor = ref('#606266') // 未选中时的默认颜色
const activeBgColor = ref('#DCDCDC') // 选中时的背景颜色
const settingVisible = ref(false) // 控制设置对话框显示状态

const emit = defineEmits(['sendData']) // 定义一个事件，用于向父组件传递数据
// 点击菜单项时触发
const handleclick = (index: number) => {
  activeIndex.value = index // 更新选中状态
  emit('sendData', index) // 发送事件，传递选中菜单的索引值
  if (index === 0) {
    router.push('/')
  } else if (index === 1) {
    router.push('/home/infoPage')
  } else if (index === 3) {
    // 点击设置按钮时显示设置对话框
    settingVisible.value = true
  }
}

</script>
<style scoped lang="less">
.user-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.logo {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  color: #409EFF;
  border-bottom: 1px solid #DCDCDC;

  div {
    width: 60px;
    text-align: center;
  }
}

.menu {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  .menu-item {
    margin: 5px;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #DCDCDC;
    }

    el-icon {
      font-size: 24px;
    }
  }

  .menu-item-active {
    background-color: v-bind(activeBgColor);

    &:hover {
      background-color: v-bind(activeBgColor);
    }
  }
}
</style>
