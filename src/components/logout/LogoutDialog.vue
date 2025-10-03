<template>
  <el-dialog v-model="dialogVisible" title="退出登录" width="500" align-center>
    <span>是否退出登录</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="logout">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useMessageStore } from '@/stores/messageStore'
import { useFriendsStore } from '@/stores/friendStore'

const userStore = useUserStore()
const messageStore = useMessageStore()
const friendStore = useFriendsStore()

const router = useRouter()

const dialogVisible = ref(true)

//点击确定后删除toke并返回登录页
const logout = () => {
  localStorage.removeItem('token')
  userStore.$reset()
  messageStore.$reset()
  friendStore.$reset()
  router.push('/login')
}

</script>
