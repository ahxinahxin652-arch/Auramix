<script setup>
// 首屏占位页：实际功能入口都在顶栏 (App.vue)。
// 这里保留一个简洁的欢迎区, 让用户登录后第一眼有内容可看。
import { onMounted } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

onMounted(() => {
  // Hook for future personalization
})
</script>

<template>
  <div class="home-view">
    <div class="welcome">
      <h1>欢迎回来, {{ userStore.profile?.displayName || '听友' }}</h1>
      <p>从顶部右上角的铃铛查看你的最新报告, 或点击 AI 助手聊聊音乐。</p>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome {
  text-align: center;
  max-width: 500px;
}

.welcome h1 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(90deg, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome p {
  margin: 0;
  font-size: 14px;
  color: rgba(224, 231, 255, 0.6);
  line-height: 1.6;
}
</style>