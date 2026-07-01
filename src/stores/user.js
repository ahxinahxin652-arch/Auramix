import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { backendFetch } from '../utils/backendApi'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('auramix_token') || null)
  const profile = ref(JSON.parse(localStorage.getItem('auramix_profile') || 'null'))
  const membershipActive = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const isVip = computed(() => membershipActive.value)

  function setMembershipActive(val) {
    membershipActive.value = !!val
  }

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
      
      try {
        const { useLibraryStore } = await import('./library.js')
        const libraryStore = useLibraryStore()
        await libraryStore.forceSync()
      } catch (err) {
        console.error('Failed to sync library after login', err)
      }
    }
    return data
  }

  async function fetchProfile() {
    try {
      const data = await backendFetch('/api/user/auth/me')
      profile.value = data
      localStorage.setItem('auramix_profile', JSON.stringify(data))
    } catch (err) {
      if (err.status === 401 || err.code === 4106) {
        logout()
      }
      throw err
    }
  }

  function logout() {
    token.value = null
    profile.value = null
    membershipActive.value = false
    localStorage.removeItem('auramix_token')
    localStorage.removeItem('auramix_profile')
    
    import('./library.js').then(({ useLibraryStore }) => {
      const libraryStore = useLibraryStore()
      libraryStore.playlists = []
      libraryStore.followedArtists = []
      libraryStore.subscribedPlaylists = []
      libraryStore.initialized = false
    }).catch(err => console.error(err))

    import('../routers/index.js').then(m => m.default.replace('/login'))
  }

  return {
    token,
    profile,
    membershipActive,
    isLoggedIn,
    isVip,
    setMembershipActive,
    sendCode,
    register,
    login,
    fetchProfile,
    logout
  }
})
