<template>
  <div class="chat-box">
    <textarea v-model="message" @keydown.enter.exact="handleSend" @keydown.enter.shift="handleNewLine"
      placeholder="输入消息...按Enter发送,Shift+Enter换行">
    </textarea>
    <div class="button-container">
      <el-button @click="handleSendMessage(userStore.toUserId, message)" type="primary">
        <span :style="message ? 'color: white' : 'color: #39B7FF'">发送</span>
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useMessageStore } from '@/stores/messageStore';

const message = ref('')
const userStore = useUserStore()


// 发送消息并阻止默认换行
const handleSend = (e: KeyboardEvent) => {
  e.preventDefault()
  if (message.value) {
    handleSendMessage(userStore.toUserId, message.value)
  }
};

// 处理换行（Shift+Enter）
const handleNewLine = (e: KeyboardEvent) => {
  if (e.shiftKey) {
    e.preventDefault()
    message.value += '\n'
  }
};


import {
  sendMessage,
  type Message
} from '../../../utils/socket'

// 存储消息列表
const messages = ref<Message[]>([])
const messageStore = useMessageStore()

// 发送消息的方法
const handleSendMessage = async (toUserId: string, content: string) => {
  try {
    const result = await sendMessage({
      toUserId,
      content,
      type: 'text'
    })
    messages.value.push(result.message)
    messageStore.messages.push(content)
    message.value = ''
  } catch (error) {
    console.error('消息发送失败:', error)
  }
}



</script>

<style lang="less">
.chat-box {
  display: flex;
  // 设置主轴
  flex-direction: column;
  background-color: white;

  textarea {
    flex: 0.9;
    resize: none;
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    // 设置字体
    font-size: 16px;
    padding: 10px;
    font-weight: bold;
    font-family: '宋体';
    // 设置行高
    line-height: 1.3;

    //选中后的背景色
    &::selection {
      background-color: #3064CE;
      color: white;
    }
  }

  .button-container {
    flex: 0.1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 15px;

    .el-button {
      width: 120px;
      height: 32px;
      background-color: #0099FF;
    }
  }
}
</style>
