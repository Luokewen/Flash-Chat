<template>
  <el-dialog v-model="dialogTableVisible" title="添加好友" width="600px" @close="emit('update:addVisible', false)"
    :close-on-click-modal="false">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-input v-model="searchQuery" placeholder="搜索用户（用户名/账号ID）" :prefix-icon="Search" class="search-input"
        @input="handleSearch" clearable />
    </div>

    <!-- 搜索结果列表 -->
    <el-table :data="filteredUsers" border style="width: 100%; margin-top: 15px;" :empty-text="getEmptyText">
      <el-table-column label="头像" width="60">
        <template #default="scope">
          <el-avatar :src="scope.row.avatar" class="avatar" />
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="用户名" width="120" />
      <el-table-column prop="username" label="账号" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.relationship)" size="small">
            {{ getStatusText(scope.row.relationship) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button size="small" type="primary"
            :disabled="isButtonDisabled(scope.row.relationship) || scope.row.loading"
            @click="sendFriendRequest(scope.row)">
            <el-icon v-if="scope.row.loading" size="14" class="mr-1">
              <Loading />
            </el-icon>
            {{ getButtonText(scope.row.relationship) }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <div class="pagination-container" v-if="total > pageSize">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20]"
        :total="total" layout="total, sizes, prev, pager, next" @current-change="handlePageChange"
        @size-change="handleSizeChange" />
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { Search, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '../../../api'
import { useUserStore } from '@/stores/userStore'

// 定义事件类型
const emit = defineEmits<{
  (e: 'update:addVisible', value: boolean): void
}>();

const userStore = useUserStore();

// 定义用户数据类型
interface User {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  relationship: 'accepted' | 'pending' | 'rejected' | null;
  loading?: boolean;
}

// 分页相关参数
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);
const totalPages = ref(0);

// 接收父组件传递的显示状态
const props = defineProps({
  addVisible: {
    type: Boolean,
    default: false
  }
})

// 对话框显示状态
const dialogTableVisible = ref(false);

// 搜索相关
const searchQuery = ref('');
const users = ref<User[]>([]);
const isSearching = ref(false);

// 监听父组件状态变化
watch(() => props.addVisible, (newValue) => {
  dialogTableVisible.value = newValue;
  if (!newValue) {
    resetSearch();
  }
});

watch(() => dialogTableVisible.value, (newValue) => {
  emit('update:addVisible', newValue);
});

// 重置搜索状态
const resetSearch = () => {
  searchQuery.value = '';
  users.value = [];
  currentPage.value = 1;
  total.value = 0;
  isSearching.value = false;
};

// 空状态文本
const getEmptyText = computed(() => {
  if (isSearching.value) return '搜索中...';
  if (!searchQuery.value.trim()) return '请输入搜索内容';
  return '未找到匹配的用户';
});

// 过滤后的用户列表
const filteredUsers = computed(() => users.value);

// 状态标签类型
const getStatusType = (relationship: string) => {
  switch (relationship) {
    case 'friend': return 'success';
    case 'pending': return 'warning';
    default: return 'info';
  }
};

// 状态文本
const getStatusText = (relationship: string) => {
  switch (relationship) {
    case 'accepted': return '已添加';
    case 'pending': return '等待验证';
    case 'rejected': return '已拒绝';
    default: return '未添加';
  }
};

// 按钮是否禁用
const isButtonDisabled = (relationship: string) => {
  return relationship === 'friend' || relationship === 'pending';
};

// 按钮文本
const getButtonText = (relationship: string) => {
  switch (relationship) {
    case 'friend': return '已添加';
    case 'pending': return '已发送';
    default: return '添加好友';
  }
};

// 防抖函数
const debounce = (fn: Function, delay = 300) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// 处理搜索
const handleSearch = debounce(async (value: string) => {
  currentPage.value = 1;
  await fetchUserList(value);
});

// 分页切换
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await fetchUserList(searchQuery.value);
};

// 每页条数变化
const handleSizeChange = async (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  await fetchUserList(searchQuery.value);
};

// 获取用户列表
const fetchUserList = async (keyword: string) => {
  if (!keyword.trim()) {
    users.value = [];
    total.value = 0;
    isSearching.value = false;
    return;
  }

  if (!userStore.user?.id) {
    ElMessage.error('用户未登录');
    return;
  }

  try {
    isSearching.value = true;
    const res = await api.friend.searchUsers({
      keyword: keyword.trim(),
      userId: userStore.user.id,
      page: currentPage.value,
      pageSize: pageSize.value
    });

    const { list, total: totalCount, totalPages: pages } = res.data.data;
    console.log(res.data.data);
    users.value = (list || []).map((user: any) => ({
      ...user,
      loading: false,
      relationship: user.relationship || 'none' // 确保有默认值
    }));
    total.value = totalCount;
    totalPages.value = pages;

  } catch (err) {
    console.error('搜索用户失败:', err);
    ElMessage.error('搜索失败，请稍后重试');
    users.value = [];
    total.value = 0;
  } finally {
    isSearching.value = false;
  }
};

// 发送好友请求
const sendFriendRequest = async (user: User) => {
  if (!userStore.user?.id) {
    ElMessage.error('用户未登录');
    return;
  }

  try {
    user.loading = true;
    await api.friend.sendFriendRequest({
      requesterId: userStore.user.id,
      recipientId: user.id
    });

    ElMessage.success(`已向 ${user.nickname} 发送好友请求`);

    // 更新本地状态为待验证
    const index = users.value.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users.value[index].relationship = 'pending';
    }
  } catch (err: any) {
    console.error('发送好友请求失败:', err);
    if (err.response?.status === 400) {
      ElMessage.error("已发送过好友请求");
      // 更新状态为pending
      const index = users.value.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users.value[index].relationship = 'pending';
      }
    } else {
      ElMessage.error('发送好友请求失败，请稍后重试');
    }
  } finally {
    user.loading = false;
  }
};
</script>

<style scoped lang="less">
.search-container {
  margin-bottom: 10px;
}

.search-input {
  width: 100%;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-container {
  margin-top: 15px;
  text-align: right; // 分页靠右显示
}

:deep(.el-table__empty-text) {
  padding: 40px 0;
}

:deep(.el-icon-loading) {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
