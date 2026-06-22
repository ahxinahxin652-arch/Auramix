import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AdminProfile, LoginPayload } from '@/types/admin'
import { fetchProfileApi, loginApi, logoutApi } from '@/api/admin/auth'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // state
    const token = ref('')
    const profile = ref<AdminProfile | null>(null)
    const loading = ref(false)

    // getters
    const isLoggedIn = computed(() => token.value !== '')

    // actions
    async function login(payload: LoginPayload) {
      loading.value = true
      try {
        const result = await loginApi(payload)
        token.value = result.token
        profile.value = result.profile
        return result
      }
      finally {
        loading.value = false
      }
    }

    async function logout() {
      try {
        await logoutApi()
      }
      catch {
        // 忽略错误,无论成败都清本地
      }
      finally {
        clearAuth()
      }
    }

    async function fetchProfile() {
      const p = await fetchProfileApi()
      profile.value = p
      return p
    }

    function clearAuth() {
      token.value = ''
      profile.value = null
    }

    return {
      token,
      profile,
      loading,
      isLoggedIn,
      login,
      logout,
      fetchProfile,
      clearAuth,
    }
  },
  {
    persist: {
      key: 'auramix-auth',
      storage: localStorage,
      paths: ['token', 'profile'],
    },
  },
)
