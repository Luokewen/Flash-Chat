<template>
  <div class="info-list">
    <!-- 信息列表头 -->
    <ListHeader :title="title || '消息列表'" />
    <div class="info-list-content">
      <!-- 循环渲染信息项组件 -->
      <el-scrollbar height="100%">
        <template v-if="infoItems.length > 0">
          <InfoItem 
            v-for="item in infoItems" 
            :key="item.id" 
            :info="item" 
            @click="handleItemClick(item)" 
            :selected="selectedItemId === item.id"
          />
        </template>
        <div v-else class="empty-state">
          <div class="empty-icon">
            <el-icon><Message /></el-icon>
          </div>
          <p class="empty-text">暂无好友消息</p>
          <p class="empty-hint">添加好友开始聊天吧</p>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
<script lang="ts" setup>
// 导入信息列表头
import ListHeader from './ListHeader.vue'
// 导入信息项组件
import InfoItem from './InfoItem.vue'
import type { InfoItem as InfoItemType } from './InfoItem.vue'
import { ref } from 'vue'
import { Message } from '@element-plus/icons-vue'

// 定义Props
const props = defineProps<{
  infoItems: InfoItemType[]
  title?: string
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'item-click', item: InfoItemType): void
}>()

// 当前选中的项目ID
const selectedItemId = ref<string | number | null>(null)

// 处理信息项点击
const handleItemClick = (item: InfoItemType) => {
  selectedItemId.value = item.id
  emit('item-click', item)
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

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9CA3AF;
  text-align: center;
  height: 100%;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  .empty-text {
    font-size: 16px;
    margin-bottom: 8px;
    color: #6B7280;
    font-weight: 500;
  }

  .empty-hint {
    font-size: 14px;
    color: #9CA3AF;
  }
}
</style>
