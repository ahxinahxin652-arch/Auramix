import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { backendFetch } from '../utils/backendApi'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('auramix_token') || null)
  const profile = ref(JSON.parse(localStorage.getItem('auramix_profile') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  async function sendCode(email) {
    return backendFetch('/api/user/auth/send-code', {
      method: 'POST',
      body: { email }
    })
  }

  async function register(email, password, displayName, code) {
    const data = await backendFetch('/api/user/auth/register', {
      method: 'POST',
      body: { email, password, displayName, code }
    })
    if (data && data.token) {
      token.value = data.token
      profile.value = data.profile
      localStorage.setItem('auramix_token', data.token)
      localStorage.setItem('auramix_profile', JSON.stringify(data.profile))
    }
    return data
  }

  async function login(email, password) {
    const data = await backendFetch('/api/user/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    if (data && data.token) {
      token.value = data.token
      profile.value = data.profile
      localStorage.setItem('auramix_token', data.token)
      localStorage.setItem('auramix_profile', JSON.stringify(data.profile))
    }
    return data
  }

  async function fetchProfile() {
    try {
      const data = await backendFetch('/api/user/auth/me')
      profile.value = data
      localStorage.setItem('auramix_profile', JSON.stringify(data))
    } catch (err) {
      if (err.message.includes('凭证无效') || err.message.includes('4106') || err.message.includes('401')) {
        logout()
      }
      throw err
    }
  }

  function logout() {
    token.value = null
    profile.value = null
    localStorage.removeItem('auramix_token')
    localStorage.removeItem('auramix_profile')
    window.location.hash = '#/login'
  }

  return {
    token,
    profile,
    isLoggedIn,
    sendCode,
    register,
    login,
    fetchProfile,
    logout
  }
})
