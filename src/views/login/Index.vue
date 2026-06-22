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
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    await router.push(redirect)
  }
  catch {
    // 校验失败或登录失败,拦截器已弹 ElMessage
  }
}
</script>

<template>
  <div class="page-login">
    <el-card class="login-card" shadow="always">
      <h2 class="login-title">Auramix Admin</h2>
      <el-alert
        v-if="tip"
        :title="tip"
        type="warning"
        :closable="false"
        show-icon
        class="login-tip"
      />
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        autocomplete="off"
      >
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
            class="login-submit"
            @click="handleSubmit"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.login-title {
  margin: 0 0 $spacing-lg;
  text-align: center;
  font-size: $font-size-xl;
  color: #303133;
}

.login-tip {
  margin-bottom: $spacing-md;
}

.login-submit {
  width: 100%;
}
</style>
