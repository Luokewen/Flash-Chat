<template>
  <div class="info-list">
    <!-- 信息列表头 -->
    <ListHeader :title="'消息列表'" />
    <div class="info-list-content">
      <!-- 循环渲染信息项组件 -->
      <el-scrollbar height="100%">
        <InfoItem v-for="item in infoItems" :key="item.id" :info="item" @click="handleItemClick(item)" />
      </el-scrollbar>
    </div>
  </div>
</template>
<script lang="ts" setup>
// 导入信息列表头
import ListHeader from './ListHeader.vue'
// 导入信息项组件
import InfoItem from './InfoItem.vue'

// 定义Props类型
interface InfoItemType {
  id: number
  name: string
  avatar: string
  message: string
  time: string
  unread: boolean
  unreadCount: number
}

// 定义Props
const props = defineProps<{
  infoItems: InfoItemType[]
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'item-click', item: InfoItemType): void
}>()

// 处理信息项点击
const handleItemClick = (item: InfoItemType) => {
  emit('item-click', item)
  // 可以在这里添加选中状态管理等逻辑
}
</script>

<style scoped lang="less">
.info-list {
  width: 100%;
  height: 100vh;
  background-color: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;

}

.info-list-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 0;
}
</style>
