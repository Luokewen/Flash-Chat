<template>
  <div class="公益404-container">
    <!-- 页面主体 -->
    <div class="content">
      <!-- 错误提示 -->
      <div class="error-info">
        <h1 class="error-code">404</h1>
        <p class="error-desc">抱歉，你访问的页面不存在</p>
      </div>

      <!-- 公益宣传区域 -->
      <div class="public-welfare">
        <img src="https://picsum.photos/id/237/300/200" alt="公益宣传图：保护动物" class="welfare-img">
        <div class="welfare-text">
          <p>你知道吗？每消失一个页面，就可能有一只小动物失去家园</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button @click="goHome" class="home-btn">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

// 返回首页
const router = useRouter();
const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.公益404-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.content {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
}

.error-code {
  font-size: 80px;
  font-weight: bold;
  color: #ff4d4f;
  margin: 0 0 20px;
}

.error-desc {
  font-size: 18px;
  color: #666;
  margin: 0 0 40px;
}

.public-welfare {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.welfare-img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.welfare-text {
  max-width: 400px;
  text-align: left;
}

.welfare-text p {
  font-size: 16px;
  color: #333;
  margin: 0 0 15px;
}

.welfare-link {
  display: inline-block;
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.welfare-link:hover {
  color: #096dd9;
  text-decoration: underline;
}

.home-btn {
  padding: 10px 24px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.home-btn:hover {
  background-color: #096dd9;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .error-code {
    font-size: 60px;
  }

  .public-welfare {
    flex-direction: column;
  }

  .welfare-text {
    text-align: center;
  }
}
</style>
