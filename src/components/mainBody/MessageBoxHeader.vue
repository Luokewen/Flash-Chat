<template>
  <div class="header">
    <span>{{ friendsStore.friendInfo.nickname }}</span>
  </div>
</template>
<script lang="ts" setup>
import { useFriendsStore } from '@/stores/friendStore';
const friendsStore = useFriendsStore();
</script>
<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;

  span {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}
</style>
