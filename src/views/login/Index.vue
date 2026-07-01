<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/store/modules/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const tip = ref('')

onMounted(() => {
  if (route.query.expired === '1') tip.value = '会话已过期,请重新登录'
  else if (route.query.disabled === '1') tip.value = '账号已被停用'
})

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    await auth.login({ username: form.username, password: form.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/analytics/overview'
    await router.push(redirect)
  } catch {
    // 校验失败或登录失败,拦截器已弹 ElMessage
  }
}
</script>

<template>
  <div class="page-login">
    <!-- 左:品牌渐变 -->
    <div class="page-login__brand">
      <div class="page-login__brand-top">
        <div class="page-login__brand-logo">AURAMIX</div>
        <div class="page-login__brand-tag">Admin Console</div>
      </div>
      <div class="page-login__brand-middle">
        <h1 class="page-login__brand-title">管理你的音乐世界</h1>
        <p class="page-login__brand-sub">
          歌曲 / 专辑 / 智能审批<br />
          一站式后台
        </p>
      </div>
      <div class="page-login__brand-bottom">© 2026 Auramix</div>
    </div>

    <!-- 右:表单 -->
    <div class="page-login__form-wrap">
      <div class="page-login__form">
        <h2 class="page-login__form-title">欢迎回来</h2>
        <p class="page-login__form-sub">请登录你的账号</p>

        <el-alert
          v-if="tip"
          :title="tip"
          type="warning"
          :closable="false"
          show-icon
          class="page-login__tip"
        />

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" autocomplete="off">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
              @keyup.enter="handleSubmit"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="auth.loading"
              class="page-login__submit"
              @click="handleSubmit"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-login {
  min-height: 100vh;
  display: flex;
  background: $bg-page;

  &__brand {
    flex: 1;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    color: #fff;
    padding: $spacing-xl;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__brand-top {
    display: flex;
    align-items: baseline;
    gap: $spacing-sm;
  }

  &__brand-logo {
    font-size: $font-size-md;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  &__brand-tag {
    font-size: $font-size-2xs;
    opacity: 0.7;
  }

  &__brand-middle {
    max-width: 360px;
  }

  &__brand-title {
    margin: 0 0 $spacing-sm;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.3;
  }

  &__brand-sub {
    margin: 0;
    font-size: $font-size-sm;
    opacity: 0.85;
    line-height: 1.6;
  }

  &__brand-bottom {
    font-size: $font-size-2xs;
    opacity: 0.6;
  }

  &__form-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xl;
  }

  &__form {
    width: 100%;
    max-width: 360px;
  }

  &__form-title {
    margin: 0 0 $spacing-xs;
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $text-primary;
  }

  &__form-sub {
    margin: 0 0 $spacing-lg;
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  &__tip {
    margin-bottom: $spacing-md;
  }

  &__submit {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-login {
    flex-direction: column;

    &__brand {
      flex: 0 0 33vh;
      padding: $spacing-lg;
    }

    &__brand-title {
      font-size: 20px;
    }
  }
}
</style>
