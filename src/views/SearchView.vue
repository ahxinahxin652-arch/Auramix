<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useLibraryStore } from '../stores/library'
import { usePlayerStore } from '../stores/player.js'
import AddPlaylistIcon from '../components/AddPlaylistIcon.vue'

const route = useRoute()
const router = useRouter()
const globalLibraryStore = useLibraryStore()
const player = usePlayerStore()

function isTrackActive(track) {
  return player.currentTrack && player.currentTrack.id === track.id && player.playbackSource?.type === 'search'
}

const query = ref(route.query.q || '')
const currentTab = ref('all') // all, tracks, artists, playlists, albums
const tabs = [
  { id: 'all', label: 'All' },
  { id: 'tracks', label: 'Songs' },
  { id: 'artists', label: 'Artists' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'albums', label: 'Albums' }
]

const results = ref({
  tracks: [],
  artists: [],
  playlists: [],
  albums: []
})

const loading = ref(false)
const pageNum = ref(1)
const hasMore = ref(true)

// Fetch data
async function fetchResults(isLoadMore = false) {
  if (!query.value.trim()) return
  if (!isLoadMore) {
    loading.value = true
    pageNum.value = 1
    hasMore.value = true
    results.value = { tracks: [], artists: [], playlists: [], albums: [] }
  }

  try {
    const res = await window.electronAPI.globalSearchRemote({
      keyword: query.value,
      type: currentTab.value,
      pageNum: pageNum.value,
      pageSize: currentTab.value === 'all' ? 5 : 20
    })

    if (res.success) {
      const data = res.data
      if (currentTab.value === 'all') {
        results.value.tracks = data.tracks || []
        results.value.artists = data.artists || []
        results.value.albums = data.albums || []
        results.value.playlists = data.playlists || []
        hasMore.value = false // All doesn't load more
      } else {
        const list = data.records || []
        if (isLoadMore) {
          results.value[currentTab.value].push(...list)
        } else {
          results.value[currentTab.value] = list
        }
        hasMore.value = list.length === (currentTab.value === 'all' ? 5 : 20)
      }
    } else {
      ElMessage.error(res.error || 'Search failed')
    }
  } catch (err) {
    ElMessage.error(err.message || 'Error occurred during search')
  } finally {
    loading.value = false
  }
}

// Watch query from route
watch(() => route.query.q, (newQ) => {
  query.value = newQ || ''
  fetchResults()
})

function switchTab(tabId) {
  currentTab.value = tabId
  fetchResults()
}

// Infinite scroll
function handleScroll(e) {
  if (currentTab.value === 'all' || !hasMore.value || loading.value) return
  const { scrollTop, scrollHeight, clientHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    pageNum.value++
    fetchResults(true)
  }
}

async function playTrack(track) {
  let playlist = [track]
  if (track.albumId) {
    try {
      const result = await window.electronAPI.getAlbumDetailRemote(track.albumId)
      if (result.success && result.data && result.data.album && result.data.album.tracks) {
        playlist = result.data.album.tracks
      }
    } catch (e) {
      console.error('Failed to fetch album tracks for search play', e)
    }
  }
  const index = playlist.findIndex(t => String(t.id) === String(track.id))
  
  const source = { type: 'search', id: track.id, name: track.title, route: `/album/${track.albumId}` }
  window.dispatchEvent(new CustomEvent('play-track', {
    detail: { track, playlist, index: index >= 0 ? index : 0, source }
  }))
}

function goArtist(id) {
  router.push(`/artist/${id}`)
}

function goAlbum(id) {
  router.push(`/album/${id}`)
}

function goPlaylist(id) {
  router.push(`/warehouse/${id}?remote=1`)
}

onMounted(() => {
  if (query.value) fetchResults()
})
</script>

<template>
  <div class="search-view" @scroll="handleScroll">
    <div class="search-header">
      <div class="tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-pill"
          :class="{ active: currentTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="loading && pageNum === 1" class="loading-state">
      Searching...
    </div>

    <div v-else-if="!query.trim()" class="empty-state">
      <h3>Browse all</h3>
      <p>Type something in the top bar to search.</p>
    </div>

    <div v-else class="search-results">
      <!-- ALL VIEW -->
      <div v-if="currentTab === 'all'" class="all-results">
        
        <div v-if="results.tracks.length" class="result-section">
          <h2>Songs</h2>
          <div class="track-list">
            <div v-for="track in results.tracks" :key="track.id" class="track-item" :class="{ active: isTrackActive(track) }" @dblclick="playTrack(track)">
              <img :src="track.coverUrl || 'default_cover.jpg'" class="track-cover" />
              <div class="track-info">
                <div class="track-title" :class="{ 'active-text': isTrackActive(track) }" @click.stop="$router.push(`/album/${track.albumId}`)">{{ track.title }}</div>
                <div class="track-artist">
                  <span v-for="(art, idx) in track.artists" :key="art.id">
                    <span class="artist-link" @click.stop="$router.push(`/artist/${art.id}`)">{{ art.name }}</span>
                    <span v-if="idx < track.artists.length - 1">, </span>
                  </span>
                </div>
              </div>
              <button 
                class="add-to-playlist-btn" 
                :class="{ 'is-saved': globalLibraryStore.isSavedToAnyPlaylist(track.id) }"
                @click.stop="globalLibraryStore.openSelector(track.id, $event.clientX, $event.clientY)" 
                title="添加到歌单"
              >
                <AddPlaylistIcon :isSaved="globalLibraryStore.isSavedToAnyPlaylist(track.id)" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="results.artists.length" class="result-section">
          <h2>Artists</h2>
          <div class="card-grid">
            <div v-for="artist in results.artists" :key="artist.id" class="artist-card" @click="goArtist(artist.id)">
              <img :src="artist.coverImg || 'default_artist.jpg'" class="artist-img rounded-full" />
              <div class="artist-name">{{ artist.name }}</div>
              <div class="card-label">Artist</div>
            </div>
          </div>
        </div>

        <div v-if="results.albums.length" class="result-section">
          <h2>Albums</h2>
          <div class="card-grid">
            <div v-for="album in results.albums" :key="album.id" class="album-card" @click="goAlbum(album.id)">
              <img :src="album.coverUrl || 'default_album.jpg'" class="album-img" />
              <div class="album-title">{{ album.title }}</div>
              <div class="card-label">Album</div>
            </div>
          </div>
        </div>

        <div v-if="results.playlists.length" class="result-section">
          <h2>Playlists</h2>
          <div class="card-grid">
            <div v-for="pl in results.playlists" :key="pl.id" class="playlist-card" @click="goPlaylist(pl.id)">
              <img :src="pl.coverUrl || 'default_playlist.jpg'" class="playlist-img" />
              <div class="playlist-title">{{ pl.name }}</div>
              <div class="card-label">Playlist</div>
            </div>
          </div>
        </div>
        
        <div v-if="!results.tracks.length && !results.artists.length && !results.albums.length && !results.playlists.length" class="no-results">
          No results found for "{{ query }}"
        </div>
      </div>

      <!-- SPECIFIC VIEWS -->
      <div v-if="currentTab === 'tracks'" class="track-list full-list">
        <div v-for="track in results.tracks" :key="track.id" class="track-item" :class="{ active: isTrackActive(track) }" @dblclick="playTrack(track)">
          <img :src="track.coverUrl || 'default_cover.jpg'" class="track-cover" />
          <div class="track-info">
            <div class="track-title" :class="{ 'active-text': isTrackActive(track) }" @click.stop="$router.push(`/album/${track.albumId}`)">{{ track.title }}</div>
            <div class="track-artist">
              <span v-for="(art, idx) in track.artists" :key="art.id">
                <span class="artist-link" @click.stop="$router.push(`/artist/${art.id}`)">{{ art.name }}</span>
                <span v-if="idx < track.artists.length - 1">, </span>
              </span>
            </div>
          </div>
          <button 
            class="add-to-playlist-btn" 
            :class="{ 'is-saved': globalLibraryStore.isSavedToAnyPlaylist(track.id) }"
            @click.stop="globalLibraryStore.openSelector(track.id, $event.clientX, $event.clientY)" 
            title="添加到歌单"
          >
            <AddPlaylistIcon :isSaved="globalLibraryStore.isSavedToAnyPlaylist(track.id)" />
          </button>
        </div>
      </div>

      <div v-if="currentTab === 'artists'" class="card-grid">
        <div v-for="artist in results.artists" :key="artist.id" class="artist-card" @click="goArtist(artist.id)">
          <img :src="artist.coverImg || 'default_artist.jpg'" class="artist-img rounded-full" />
          <div class="artist-name">{{ artist.name }}</div>
          <div class="card-label">Artist</div>
        </div>
      </div>

      <div v-if="currentTab === 'albums'" class="card-grid">
        <div v-for="album in results.albums" :key="album.id" class="album-card" @click="goAlbum(album.id)">
          <img :src="album.coverUrl || 'default_album.jpg'" class="album-img" />
          <div class="album-title">{{ album.title }}</div>
          <div class="card-label">Album</div>
        </div>
      </div>

      <div v-if="currentTab === 'playlists'" class="card-grid">
        <div v-for="pl in results.playlists" :key="pl.id" class="playlist-card" @click="goPlaylist(pl.id)">
          <img :src="pl.coverUrl || 'default_playlist.jpg'" class="playlist-img" />
          <div class="playlist-title">{{ pl.name }}</div>
          <div class="card-label">Playlist</div>
        </div>
      </div>
      
      <div v-if="loading && pageNum > 1" class="loading-more">Loading more...</div>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  overflow-y: overlay;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  color: #fff;
}

.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-pill {
  padding: 8px 16px;
  border-radius: 16px;
  background-color: #2a2a2a;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.tab-pill:hover {
  background-color: #333;
}

.tab-pill.active {
  background-color: #fff;
  color: #000;
}

.empty-state, .loading-state, .no-results {
  text-align: center;
  margin-top: 40px;
  color: #a7a7a7;
}

.result-section {
  margin-bottom: 40px;
}

.result-section h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

/* Track list */
.track-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-cover {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin-right: 10px;
    object-fit: cover;
  }

.track-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

.track-title {
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    line-height: 1;
    margin: 0;
    cursor: pointer;
  }
  .track-title:hover {
    text-decoration: underline;
  }

.artist-link {
  cursor: pointer;
  transition: color 0.2s;
}

.artist-link:hover {
  color: var(--accent, #1db954);
  text-decoration: underline;
}

.track-artist {
    font-size: 14px;
    color: #a7a7a7;
    line-height: 1;
    margin: 0;
  }

.add-to-playlist-btn {
  background: transparent;
  border: none;
  color: #a7a7a7;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-playlist-btn:hover {
  color: #fff;
  transform: scale(1.1);
}

.add-to-playlist-btn.is-saved {
  color: #1db954;
}

/* Cards Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.artist-card, .album-card, .playlist-card {
  background-color: #181818;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.artist-card:hover, .album-card:hover, .playlist-card:hover {
  background-color: #282828;
}

.artist-img, .album-img, .playlist-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  margin-bottom: 16px;
  border-radius: 4px;
}

.rounded-full {
  border-radius: 50% !important;
}

.artist-name, .album-title, .playlist-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: #a7a7a7;
}

.search-view::-webkit-scrollbar {
  width: 10px;
  background: transparent;
}
.search-view::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
}
.search-view::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
.search-view::-webkit-scrollbar-track {
  background: transparent;
}
.track-item.active {
  background-color: rgba(255, 255, 255, 0.1);
}
.active-text {
  color: #1db954 !important;
}
</style>


