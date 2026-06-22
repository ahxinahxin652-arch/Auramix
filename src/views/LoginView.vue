<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <h1 class="logo-title">Auramix</h1>
      <p class="subtitle">{{ isLoginMode ? '听见音乐的色彩' : '开启音乐新旅程' }}</p>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Email Input -->
        <div class="form-group">
          <label class="form-label">电子邮箱</label>
          <div class="input-wrapper">
            <input
              type="email"
              v-model="form.email"
              placeholder="email@example.com"
              required
              class="form-input"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Send Code & Code Input (Register Mode Only) -->
        <template v-if="!isLoginMode">
          <div class="form-group">
            <label class="form-label">邮箱验证码</label>
            <div class="code-group">
              <input
                type="text"
                v-model="form.code"
                placeholder="6位验证码"
                maxlength="6"
                required
                class="form-input code-input"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="btn-send-code"
                :disabled="isLoading || countdown > 0 || !form.email"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>

          <!-- Nickname / Display Name (Register Mode Only) -->
          <div class="form-group">
            <label class="form-label">个性昵称</label>
            <div class="input-wrapper">
              <input
                type="text"
                v-model="form.displayName"
                placeholder="展示昵称"
                required
                class="form-input"
                :disabled="isLoading"
              />
            </div>
          </div>
        </template>

        <!-- Password Input -->
        <div class="form-group">
          <label class="form-label">登录密码</label>
          <div class="input-wrapper">
            <input
              type="password"
              v-model="form.password"
              placeholder="请输入密码（最少6位）"
              required
              minlength="6"
              class="form-input"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-submit" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>{{ isLoginMode ? '登 录' : '注 册' }}</span>
        </button>
      </form>

      <!-- Toggle Mode -->
      <div class="toggle-mode-container">
        <span class="toggle-text">
          {{ isLoginMode ? '还没有账户？' : '已经有账户？' }}
        </span>
        <button class="btn-toggle" @click="toggleMode" :disabled="isLoading">
          {{ isLoginMode ? '注册新账号' : '立即登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const isLoginMode = ref(true)
const isLoading = ref(false)
const countdown = ref(0)
let timer = null

const form = reactive({
  email: '',
  password: '',
  displayName: '',
  code: ''
})

function toggleMode() {
  isLoginMode.value = !isLoginMode.value
  form.password = ''
  form.displayName = ''
  form.code = ''
}

// Handle send code countdown
async function handleSendCode() {
  if (!form.email) return
  try {
    isLoading.value = true
    await userStore.sendCode(form.email)
    ElMessage.success('验证码发送成功，请查收邮件')
    
    // Start 60s countdown
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (err) {
    ElMessage.error(err.message || '验证码发送失败')
  } finally {
    isLoading.value = false
  }
}

// Handle login or registration submission
async function handleSubmit() {
  isLoading.value = true
  try {
    if (isLoginMode.value) {
      await userStore.login(form.email, form.password)
      ElMessage.success('登录成功！')
    } else {
      await userStore.register(form.email, form.password, form.displayName, form.code)
      ElMessage.success('注册并登录成功！')
    }
    router.push('/')
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #1e2028 0%, #0d0e11 100%);
  user-select: none;
}

.login-card {
  width: 380px;
  padding: 40px;
  background-color: #16181d;
  border-radius: 12px;
  border: 1px solid #2a2d37;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-h);
  margin-bottom: 8px;
  background: linear-gradient(135deg, #7c5cff 0%, #a28aff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 13px;
  color: var(--text);
  margin-bottom: 32px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 6px;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-h);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  background-color: #1e2028;
  border: 1px solid #2a2d37;
  border-radius: 6px;
  color: var(--text-h);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: #7c5cff;
  box-shadow: 0 0 0 2px rgba(124, 92, 255, 0.2);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.code-group {
  display: flex;
  gap: 10px;
}

.code-input {
  flex: 1;
}

.btn-send-code {
  padding: 0 16px;
  background-color: var(--surface-3);
  border: 1px solid #2a2d37;
  border-radius: 6px;
  color: var(--text-h);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-send-code:hover:not(:disabled) {
  background-color: #7c5cff;
  border-color: #7c5cff;
}

.btn-send-code:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  margin-top: 10px;
  padding: 14px;
  background-color: #7c5cff;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-submit:hover:not(:disabled) {
  background-color: #9370ff;
  transform: scale(1.02);
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-mode-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.toggle-text {
  font-size: 12px;
  color: var(--text);
}

.btn-toggle {
  background: none;
  border: none;
  color: #7c5cff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.btn-toggle:hover {
  color: #9370ff;
}

/* Spinner for loading state */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
