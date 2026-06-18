<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { useLocalStorageStore } from '../stores/localStorage.js'
import { useSidebarStore } from '../stores/sidebar.js'

const player = usePlayerStore()
const localStorageStore = useLocalStorageStore()
const sidebarStore = useSidebarStore()
const router = useRouter()

const showModal = ref(false)
const followedArtists = ref({})

const artistWrapRef = ref(null)
const canScrollArtist = ref(false)

function closeSidebar() {
  sidebarStore.setOpen(false)
  localStorageStore.setRightBarShow(false)
}

const parsedArtists = computed(() => {
  if (!player.currentTrack) return []
  if (!player.currentTrack.artists) return []
  try {
    const list = typeof player.currentTrack.artists === 'string'
      ? JSON.parse(player.currentTrack.artists)
      : player.currentTrack.artists
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
})

const sidebarArtists = computed(() => {
  return parsedArtists.value.filter(
    art => art.role === 'Main Artist' || art.role === 'Featured Artist'
  )
})

const categorizedCredits = computed(() => {
  const categories = {
    'Artist': [],
    'Composition & Lyrics': [],
    'Production & Engineering': [],
    'Others': []
  }
  
  parsedArtists.value.forEach(artist => {
    const role = (artist.role || '').trim()
    const roleLower = role.toLowerCase()
    
    if (roleLower === 'main artist' || roleLower === 'featured artist') {
      categories['Artist'].push(artist)
    } else if (
      roleLower.includes('writer') ||
      roleLower.includes('composer') ||
      roleLower.includes('lyricist') ||
      roleLower.includes('author')
    ) {
      categories['Composition & Lyrics'].push(artist)
    } else if (
      roleLower.includes('producer') ||
      roleLower.includes('mixer') ||
      roleLower.includes('engineer') ||
      roleLower.includes('mastering')
    ) {
      categories['Production & Engineering'].push(artist)
    } else {
      categories['Others'].push(artist)
    }
  })
  
  return Object.entries(categories)
    .filter(([_, list]) => list.length > 0)
    .map(([title, list]) => ({ title, list }))
})

const currentArtistDetail = ref(null)

const loadArtistDetail = async (track) => {
  if (!track) {
    currentArtistDetail.value = null
    return
  }

  let artists = []
  if (track.artists) {
    try {
      const list = typeof track.artists === 'string'
        ? JSON.parse(track.artists)
        : track.artists
      if (Array.isArray(list)) {
        artists = list
      }
    } catch (e) {}
  }

  const mainArtists = artists.filter(
    art => art.role === 'Main Artist' || art.role === 'Featured Artist'
  )

  if (mainArtists.length > 0) {
    const mainArtist = mainArtists[0]
    try {
      const res = await window.electronAPI.getArtistById(mainArtist.id)
      if (res.success && res.data && res.data.artist) {
        currentArtistDetail.value = res.data.artist
      } else {
        currentArtistDetail.value = null
      }
    } catch (e) {
      currentArtistDetail.value = null
    }
  } else {
    currentArtistDetail.value = null
  }
}

const artistBgStyle = computed(() => {
  if (currentArtistDetail.value && currentArtistDetail.value.coverImg) {
    const cleanUrl = currentArtistDetail.value.coverImg.replace(/^['"]|['"]$/g, '')
    return {
      backgroundImage: `url('${cleanUrl}')`
    }
  }
  return {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(24, 24, 24, 0.9) 100%)'
  }
})

const artistBio = computed(() => {
  if (currentArtistDetail.value && currentArtistDetail.value.metadata) {
    try {
      const meta = typeof currentArtistDetail.value.metadata === 'string'
        ? JSON.parse(currentArtistDetail.value.metadata)
        : currentArtistDetail.value.metadata
      if (meta.bio) return meta.bio
    } catch (e) {}
  }
  return `Discover the sound of ${sidebarArtists.value[0]?.name || 'the artist'}. Seamlessly streaming lossless and premium local audio archives.`
})

function formatListeners(artistId) {
  if (!artistId) return '1,234,567'
  let hash = 0
  for (let i = 0; i < artistId.length; i++) {
    hash = artistId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const absHash = Math.abs(hash)
  const base = 100000 + (absHash % 19900000)
  return base.toLocaleString()
}

function checkOverflow() {
  canScrollArtist.value = false
  nextTick(() => {
    if (artistWrapRef.value) {
      const artistEl = artistWrapRef.value.querySelector('.track-artist')
      canScrollArtist.value = artistEl ? artistEl.offsetWidth > artistWrapRef.value.clientWidth : false
    }
  })
}

watch([() => player.currentTrack?.id, () => player.currentTrack?.artists], () => {
  checkOverflow()
  loadArtistDetail(player.currentTrack)
}, { immediate: true })

watch(() => sidebarStore.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      checkOverflow()
      setTimeout(checkOverflow, 150)
      setTimeout(checkOverflow, 350)
    })
  }
})

onMounted(() => {
  checkOverflow()
  loadArtistDetail(player.currentTrack)
  window.addEventListener('resize', checkOverflow)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkOverflow)
})

function goToArtist(artistId) {
  if (artistId) {
    router.push(`/artist/${artistId}`)
  }
}

function goToAlbum(albumId) {
  if (albumId) {
    router.push(`/album/${albumId}`)
  }
}

function toggleFollow(artistId) {
  if (artistId) {
    followedArtists.value[artistId] = !followedArtists.value[artistId]
  }
}

function isFollowed(artistId) {
  return artistId ? !!followedArtists.value[artistId] : false
}

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

const trackInfo = () => {
  if (!player.currentTrack) {
    return { title: '未播放', artist: '' }
  }
  return {
    title: player.currentTrack.title || player.currentTrack.name,
    artist: player.currentTrack.artist || ''
  }
}

const isMainOrFeatured = (role) => {
  const r = (role || '').trim().toLowerCase()
  return r === 'main artist' || r === 'featured artist'
}

const handleArtistClick = (art) => {
  if (isMainOrFeatured(art.role)) {
    goToArtist(art.id)
    closeModal()
  }
}

const handleCardArtistClick = (art) => {
  if (isMainOrFeatured(art.role)) {
    goToArtist(art.id)
  }
}
</script>

<template>
  <div class="right-sidebar">
    <!-- 头部：标题 + 关闭按钮 -->
    <div class="sidebar-header">
      <span class="sidebar-title">{{ player.currentTrack?.warehouse || '正在播放' }}</span>
      <button class="btn-sidebar-close" @click="closeSidebar" title="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
    </div>

    <!-- 曲目详情 -->
    <div class="sidebar-content">
      <!-- 封面 -->
      <div class="album-art" @click="goToAlbum(player.currentTrack.albumId)" style="cursor: pointer;">
        <img v-if="player.currentTrack && player.currentTrack.cover" :src="player.currentTrack.cover" class="album-art-img" alt="" />
        <svg v-else-if="player.currentTrack" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <svg v-else width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      </div>

      <!-- 曲目信息 -->
      <div class="track-detail-info">
        <span class="track-title" :class="{ empty: !player.currentTrack }" @click="goToAlbum(player.currentTrack.albumId)" style="cursor: pointer;">
          {{ trackInfo().title }}
        </span>
        <div class="track-artist-wrap" ref="artistWrapRef" :title="trackInfo().artist || '未知作者'" v-if="trackInfo().artist">
          <div class="track-artist-inner" :class="{ scrolling: canScrollArtist }">
            <template v-if="sidebarArtists.length > 0">
              <span class="track-artist">
                <span v-for="(art, idx) in sidebarArtists" :key="art.id">
                  <span class="artist-link" @click.stop="goToArtist(art.id)">{{ art.name }}</span>
                  <span v-if="idx < sidebarArtists.length - 1">, </span>
                </span>
              </span>
              <span class="track-artist track-artist-clone">
                <span v-for="(art, idx) in sidebarArtists" :key="art.id">
                  <span class="artist-link" @click.stop="goToArtist(art.id)">{{ art.name }}</span>
                  <span v-if="idx < sidebarArtists.length - 1">, </span>
                </span>
              </span>
            </template>
            <template v-else>
              <span class="track-artist">{{ trackInfo().artist }}</span>
              <span class="track-artist track-artist-clone">{{ trackInfo().artist }}</span>
            </template>
          </div>
        </div>
        <span class="track-artist empty" v-else-if="player.currentTrack">
          {{ player.currentTrack.warehouse || '未知来源' }}
        </span>
      </div>

      <!-- About the Artist 卡片 (Spotify 风格) -->
      <div class="about-artist-card" v-if="player.currentTrack && sidebarArtists.length > 0">
        <div class="about-artist-card-bg" :style="artistBgStyle">
          <span class="about-artist-title">About the artist</span>
        </div>
        <div class="about-artist-info">
          <span class="about-artist-name" @click.stop="goToArtist(sidebarArtists[0].id)">
            {{ sidebarArtists[0].name }}
            <svg class="verified-badge" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1db954" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </span>
          <div class="about-artist-listeners">
            {{ formatListeners(sidebarArtists[0].id) }} monthly listeners
          </div>
          <p class="about-artist-bio">
            {{ artistBio }}
          </p>
          <button 
            class="follow-btn-large" 
            :class="{ following: isFollowed(sidebarArtists[0].id) }"
            @click.stop="toggleFollow(sidebarArtists[0].id)"
          >
            {{ isFollowed(sidebarArtists[0].id) ? 'Following' : 'Follow' }}
          </button>
        </div>
      </div>

      <!-- Credits 卡片 (Spotify 风格) -->
      <div class="credits-card" v-if="player.currentTrack && parsedArtists.length > 0">
        <div class="credits-card-header">
          <span class="credits-card-title">Credits</span>
          <span class="credits-card-show-all" @click="openModal">Show all</span>
        </div>
        <div class="credits-card-list">
          <div 
            v-for="art in parsedArtists.slice(0, 3)" 
            :key="art.id || art.name" 
            class="credits-card-item"
          >
            <div class="credits-card-item-info">
              <span 
                class="credits-card-artist-name" 
                :class="{ clickable: isMainOrFeatured(art.role) }"
                @click.stop="handleCardArtistClick(art)"
              >{{ art.name }}</span>
              <span class="credits-card-artist-role">{{ art.role }}</span>
            </div>
            <button 
              v-if="art.role === 'Main Artist' || art.role === 'Featured Artist'" 
              class="follow-btn" 
              :class="{ following: isFollowed(art.id) }"
              @click.stop="toggleFollow(art.id)"
            >
              {{ isFollowed(art.id) ? 'Following' : 'Follow' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!player.currentTrack" class="sidebar-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <p>当前未播放任何曲目</p>
      </div>
    </div>
  </div>

  <!-- Credits Modal (Teleport to Body) -->
  <Teleport to="body">
    <Transition name="fade">
      <div class="credits-modal-overlay" v-if="showModal" @click.self="closeModal">
        <div class="credits-modal-container" @click.stop>
          <div class="credits-modal-header">
            <div class="credits-modal-title-group">
              <h3 class="credits-modal-main-title">Credits</h3>
              <span class="credits-modal-sub-title">{{ trackInfo().title }}</span>
            </div>
            <button class="credits-modal-close-btn" @click="closeModal" title="关闭">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="credits-modal-body">
            <div 
              v-for="category in categorizedCredits" 
              :key="category.title" 
              class="credits-modal-section"
            >
              <h4 class="credits-modal-section-title">{{ category.title }}</h4>
              <div class="credits-modal-list">
                <div 
                  v-for="art in category.list" 
                  :key="art.id || art.name" 
                  class="credits-modal-item"
                >
                  <div class="credits-modal-item-info">
                    <span 
                      class="credits-modal-artist-name" 
                      :class="{ clickable: isMainOrFeatured(art.role) }"
                      @click.stop="handleArtistClick(art)"
                    >{{ art.name }}</span>
                    <span class="credits-modal-artist-role">{{ art.role }}</span>
                  </div>
                  <button 
                    v-if="art.role === 'Main Artist' || art.role === 'Featured Artist'" 
                    class="follow-btn" 
                    :class="{ following: isFollowed(art.id) }"
                    @click.stop="toggleFollow(art.id)"
                  >
                    {{ isFollowed(art.id) ? 'Following' : 'Follow' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>