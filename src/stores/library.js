import { defineStore } from 'pinia'

export const useLibraryStore = defineStore('library', {
  state: () => ({
    playlists: [], // { id, name, coverUrl, trackIds: [] }
    followedArtists: [],
    subscribedPlaylists: [],
    syncing: false,
    initialized: false,
    selectorVisible: false,
    selectorX: 0,
    selectorY: 0,
    selectorTrackId: null
  }),
  getters: {
    isSavedToAnyPlaylist: (state) => {
      return (trackId) => {
        const idStr = String(trackId)
        return state.playlists.some(p => p.trackIds && p.trackIds.includes(idStr))
      }
    },
    isFollowingArtist: (state) => {
      return (artistId) => {
        return state.followedArtists.some(a => String(a.id) === String(artistId))
      }
    },
    isSubscribedPlaylist: (state) => {
      return (playlistId) => {
        return state.subscribedPlaylists.some(p => String(p.id) === String(playlistId))
      }
    }
  },
  actions: {
    async initialize() {
      if (this.initialized || this.syncing) return
      this.syncing = true
      try {
        // Only run syncLocalLibrary, completely ignoring the redundant local proxy fetches
        if (window.electronAPI && window.electronAPI.syncLocalLibrary) {
          const syncRes = await window.electronAPI.syncLocalLibrary()
          if (syncRes.success && syncRes.data) {
            this.playlists = syncRes.data.playlists || []
            this.followedArtists = syncRes.data.followedArtists || []
            this.subscribedPlaylists = syncRes.data.subscribedPlaylists || []
            this.playlists.forEach(p => {
              if (p.trackIds) p.trackIds = p.trackIds.map(String)
            })
            this.subscribedPlaylists.forEach(p => {
              if (p.trackIds) p.trackIds = p.trackIds.map(String)
            })
          }
        }
        this.initialized = true
      } catch (err) {
        console.error('Failed to initialize library store:', err)
      } finally {
        this.syncing = false
      }
    },
    openSelector(trackId, x, y) {
      this.selectorTrackId = trackId
      this.selectorX = x
      this.selectorY = y
      this.selectorVisible = true
    },
    closeSelector() {
      this.selectorVisible = false
    },
    async toggleTrackInPlaylist(playlistId, trackId) {
      const pidStr = String(playlistId)
      const tidStr = String(trackId)
      const playlist = this.playlists.find(p => String(p.id) === pidStr)
      if (!playlist) return

      const hasTrack = playlist.trackIds && playlist.trackIds.includes(tidStr)
      
      // 乐观更新
      if (!playlist.trackIds) playlist.trackIds = []
      if (hasTrack) {
        playlist.trackIds = playlist.trackIds.filter(id => id !== tidStr)
        if (window.electronAPI?.removeTrackFromLocalPlaylist) {
          window.electronAPI.removeTrackFromLocalPlaylist(playlistId, trackId)
        }
      } else {
        playlist.trackIds.push(tidStr)
        if (window.electronAPI?.addTrackToLocalPlaylist) {
          window.electronAPI.addTrackToLocalPlaylist(playlistId, trackId)
        }
      }

      window.dispatchEvent(new CustomEvent('playlist-track-toggled', { 
        detail: { playlistId: pidStr, trackId: tidStr, hasTrack: !hasTrack } 
      }))
    },
    async toggleFollowArtist(artistObj) {
      const artistId = typeof artistObj === 'object' ? artistObj.id : artistObj
      const aidStr = String(artistId)
      const isFollowing = this.followedArtists.some(a => String(a.id) === aidStr)

      // 乐观更新
      if (isFollowing) {
        this.followedArtists = this.followedArtists.filter(a => String(a.id) !== aidStr)
        if (window.electronAPI?.unfollowLocalArtist) {
          window.electronAPI.unfollowLocalArtist(artistId)
        }
      } else {
        const newArtist = typeof artistObj === 'object' ? artistObj : { id: aidStr, name: 'Unknown Artist', coverImg: '' }
        this.followedArtists.push(newArtist)
        if (window.electronAPI?.followLocalArtist) {
          window.electronAPI.followLocalArtist(artistId)
        }
      }
      // 通知外部组件（比如 musicLibrary）也可以刷新
      window.dispatchEvent(new CustomEvent('artist-follow-toggled', { detail: { artistId: aidStr } }))
    },
    async toggleSubscribePlaylist(playlistObj) {
      const playlistId = typeof playlistObj === 'object' ? playlistObj.id : playlistObj
      const pidStr = String(playlistId)
      const isSubscribed = this.subscribedPlaylists.some(p => String(p.id) === pidStr)

      // 乐观更新
      if (isSubscribed) {
        this.subscribedPlaylists = this.subscribedPlaylists.filter(p => String(p.id) !== pidStr)
        if (window.electronAPI?.unsubscribeLocalPlaylist) {
          window.electronAPI.unsubscribeLocalPlaylist(playlistId)
        }
      } else {
        const newPlaylist = typeof playlistObj === 'object' ? playlistObj : { id: pidStr, name: 'Unknown Playlist', coverUrl: '', trackIds: [] }
        this.subscribedPlaylists.push(newPlaylist)
        if (window.electronAPI?.subscribeLocalPlaylist) {
          window.electronAPI.subscribeLocalPlaylist(playlistId)
        }
      }
      window.dispatchEvent(new CustomEvent('playlist-subscribe-toggled', { detail: { playlistId: pidStr } }))
    }
  }
})
