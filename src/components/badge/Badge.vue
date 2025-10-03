<template>
  <el-badge :value="count" :hidden="count === 0" class="notification-badge" @click="handleNotificationVisible">
    <el-icon size="20">
      <Bell />
    </el-icon>
  </el-badge>
  <notification v-model="notificationVisible" />
</template>
<script setup lang="ts">
import { Bell } from '@element-plus/icons-vue';
import { useMessageStore } from '@/stores/messageStore';
import { ref, watch } from 'vue';
import Notification from '../notification/Notification.vue';

const userStore = useMessageStore();
let count = ref(userStore.friendRequestCount);

const notificationVisible = ref(false);

const handleNotificationVisible = () => {
  notificationVisible.value = !notificationVisible.value;
}

watch(() => userStore.friendRequestCount, (newCount) => {
  count.value = newCount;
})
</script>
<style lang="less" scoped>
.notification-badge {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  cursor: pointer; // 增加鼠标指针效果
}
</style>
