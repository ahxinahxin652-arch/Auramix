<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

const router = useRouter()
const auth = useAuthStore()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="admin-header__brand">Auramix Admin</div>
      <div class="admin-header__user">
        <span v-if="auth.profile" class="admin-header__username">{{ auth.profile.username }}</span>
        <el-button size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </header>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-header {
  height: $header-height;
  padding: 0 $spacing-lg;
  background: #001529;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__brand {
    font-size: $font-size-lg;
    font-weight: 600;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  &__username {
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.85);
  }
}

.admin-main {
  flex: 1;
  padding: $spacing-lg;
}
</style>
