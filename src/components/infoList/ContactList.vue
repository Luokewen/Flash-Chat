<template>
  <div class="contact-list" ref="targetElement">
    <ListHeader :title="'联系人'" />
    <div class="search">
      <el-input v-model="searchInfo" class="responsive-input" placeholder="搜索" :prefix-icon="Search" />
      <!-- 给按钮添加ref用于定位对话框 -->
      <el-button :icon="Plus" style="width: 32px;" @click="dialogVisible = !dialogVisible" />
      <el-dialog v-model="dialogVisible" :modal="false" :show-close="false" class="dialog"
        :style="{ left: `${width}px` }">
        <div class="dialog-item">
          <el-icon>
            <Connection />
          </el-icon>创建群聊
        </div>
        <div class="dialog-item" @click="clickAddVisible">
          <el-icon>
            <CirclePlus />
          </el-icon>加好友/群
        </div>
      </el-dialog>
    </div>
    <div class="contacts">
      <el-tree ref="treeRef" :data="treeData" :props="defaultProps" node-key="id" default-expand-all highlight-current
        :filter-node-method="filterNode" @node-click="handleNodeClick" :current-node-key="currentNodeId">
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <el-avatar v-if="data.type === 'friend'" :src="data.avatar" :size="40" />
            <span class="label">{{ node.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>
    <AddFriends :addVisible="addVisible" @update:add-visible="addVisible = $event" />
  </div>
</template>

<script lang="ts" setup>
import ListHeader from './ListHeader.vue';
import { Search, Plus } from '@element-plus/icons-vue'
import { nextTick, ref, watch, computed } from 'vue';
import { Connection, CirclePlus } from '@element-plus/icons-vue'
import AddFriends from './AddFriends.vue';
import { useFriendsStore } from '../../stores/friendStore'
import api from '../../api'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

const addVisible = ref(false)
const searchInfo = ref('')
const dialogVisible = ref(false)
// 修正：使用number类型存储宽度
const width = ref<number>(0)
// 目标元素ref
const targetElement = ref<HTMLDivElement | null>(null)
const friendsStore = useFriendsStore()
const currentNodeId = ref('')
const router = useRouter()

// 监听对话框显示状态变化时重新计算位置
watch(() => dialogVisible.value, (newVal) => {
  if (newVal) {
    nextTick(() => {
      calculateWidth()
    })
  }
})

// 计算宽度的方法
const calculateWidth = () => {
  if (targetElement.value) {
    // 正确赋值方式：给ref的value属性赋值
    width.value = targetElement.value.offsetWidth
  }
}

const clickAddVisible = () => {
  dialogVisible.value = !dialogVisible.value
  addVisible.value = !addVisible.value
}

// 树形数据相关
const treeRef = ref()

const defaultProps = {
  children: 'children',
  label: 'name'
}

// 从Pinia仓库获取好友数据并构建树形结构
const treeData = computed(() => [
  {
    id: 1,
    name: '我的好友',
    type: 'folder',
    // 将好友数据转换为树形结构所需的格式
    children: friendsStore.friends.map(friend => ({
      id: friend.id,
      name: friend.nickname,
      type: 'friend',
      avatar: friend.avatar,
      username: friend.username,
      createdAt: friend.requestedAt
    }))
  },
  {
    id: 2,
    name: '我的群聊',
    type: 'folder',
    children: [
      {
        id: 201,
        name: '前端开发交流群',
        type: 'group'
      },
      {
        id: 202,
        name: 'Vue3学习群',
        type: 'group'
      }
    ]
  }
])

// 过滤树节点
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.includes(value)
}

// 监听搜索框变化，过滤树节点
watch(() => searchInfo.value, (val) => {
  treeRef.value?.filter(val)
})

// 点击树节点处理
const handleNodeClick = (data: any) => {

  // 如果点击的是当前已选中的节点，不重复请求
  if (data.id === currentNodeId.value) {
    router.push('/home/infoPage')
    return
  }

  currentNodeId.value = data.id

  if (data.type === 'friend') {
    api.userInfo.getUserInfo({ userId: data.id }).then(res => {
      friendsStore.friendInfo = res.data.data
    })
    router.push('/home/infoPage')
  }
}

onBeforeRouteLeave((to, from, next) => {
  //清空树的选中状态
  treeRef.value?.setCurrentKey(null)
  currentNodeId.value = ''
  // 清空搜素框
  searchInfo.value = ''
  next()
})

</script>

<style lang="less">
.contact-list {
  .search {
    margin: 5px 20px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;

    .responsive-input {
      width: 100%;
      margin-right: 10px;
    }

    .dialog {
      position: absolute;
      top: 116px;
      margin: 0;
      width: auto;
      height: auto;
      transform: none;
      padding: 5px;

      .el-dialog__header {
        display: none;
      }

      .dialog-item {
        width: 100px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          background-color: #DCDCDC;
        }

        .el-icon {
          font-size: 18px;
          margin-right: 5px;
        }
      }
    }
  }

  .contacts {
    margin-top: 10px;
    padding: 0 10px;

    .el-tree-node__content {
      height: auto;
      padding: 8px;
    }

    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;

      .el-avatar {
        margin-right: 10px;
      }
    }
  }
}
</style>
