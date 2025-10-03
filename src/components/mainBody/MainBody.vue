<template>
  <div class="message-box-header">
    <MessageBoxHeader />
  </div>
  <div class="message-box">
    <MessageBox />
  </div>
  <div class="chat-box">
    <ChatBox />
  </div>
</template>

<script lang="ts" setup>
import MessageBoxHeader from "./MessageBoxHeader.vue";
import MessageBox from "./MessageBox.vue";
import ChatBox from "./ChatBox.vue";
</script>

<style scoped lang="less">
.message-box-header {
  height: 60px;
  border-bottom: 1px solid #e0e0e0;
}

.message-box {
  height: calc(100% - 310px);
  overflow-y: auto;
}

.chat-box {
  height: 250px;
  border-top: 1px solid #e0e0e0;
}
</style>
