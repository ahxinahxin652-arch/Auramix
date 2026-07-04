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
    selectorTrackId: null,
    selectorTrackData: null
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
    async forceSync() {
      if (this.syncing) return
      this.syncing = true
      try {
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
        console.error('Failed to force sync library store:', err)
      } finally {
        this.syncing = false
      }
    },
    openSelector(trackId, x, y, trackData = null) {
      this.selectorTrackId = trackId
      this.selectorTrackData = trackData
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
      if (!playlist.trackIds) playlist.trackIds = []
      const oldTrackIds = [...playlist.trackIds]
      
      // 乐观更新
      if (hasTrack) {
        playlist.trackIds = playlist.trackIds.filter(id => id !== tidStr)
      } else {
        playlist.trackIds.push(tidStr)
      }

      window.dispatchEvent(new CustomEvent('playlist-track-toggled', { 
        detail: { playlistId: pidStr, trackId: tidStr, hasTrack: !hasTrack } 
      }))

      try {
        let res
        if (hasTrack) {
          if (window.electronAPI?.removeTrackFromLocalPlaylist) {
            res = await window.electronAPI.removeTrackFromLocalPlaylist(playlistId, trackId)
          }
        } else {
          if (window.electronAPI?.addTrackToLocalPlaylist) {
            res = await window.electronAPI.addTrackToLocalPlaylist(playlistId, trackId, this.selectorTrackData)
          }
        }
        if (res && !res.success) throw new Error(res.error || 'Failed')
      } catch (err) {
        playlist.trackIds = oldTrackIds
        window.dispatchEvent(new CustomEvent('playlist-track-toggled', { 
          detail: { playlistId: pidStr, trackId: tidStr, hasTrack: hasTrack } 
        }))
        console.error('Failed to toggle track in playlist', err)
      }
    },
    async toggleFollowArtist(artistObj) {
      const artistId = typeof artistObj === 'object' ? artistObj.id : artistObj
      const aidStr = String(artistId)
      const isFollowing = this.followedArtists.some(a => String(a.id) === aidStr)
      const oldFollowedArtists = [...this.followedArtists]

      // 乐观更新
      if (isFollowing) {
        this.followedArtists = this.followedArtists.filter(a => String(a.id) !== aidStr)
      } else {
        const newArtist = typeof artistObj === 'object' ? artistObj : { id: aidStr, name: 'Unknown Artist', coverImg: '' }
        this.followedArtists.push(newArtist)
      }
      // 通知外部组件（比如 musicLibrary）也可以刷新
      window.dispatchEvent(new CustomEvent('artist-follow-toggled', { detail: { artistId: aidStr } }))

      try {
        let res
        if (isFollowing) {
          if (window.electronAPI?.unfollowLocalArtist) {
            res = await window.electronAPI.unfollowLocalArtist(artistId)
          }
        } else {
          if (window.electronAPI?.followLocalArtist) {
            res = await window.electronAPI.followLocalArtist(artistId)
          }
        }
        if (res && !res.success) throw new Error(res.error || 'Failed')
      } catch (err) {
        this.followedArtists = oldFollowedArtists
        window.dispatchEvent(new CustomEvent('artist-follow-toggled', { detail: { artistId: aidStr } }))
        console.error('Failed to toggle follow artist', err)
      }
    },
    async toggleSubscribePlaylist(playlistObj) {
      const playlistId = typeof playlistObj === 'object' ? playlistObj.id : playlistObj
      const pidStr = String(playlistId)
      const isSubscribed = this.subscribedPlaylists.some(p => String(p.id) === pidStr)
      const oldSubscribedPlaylists = [...this.subscribedPlaylists]

      // 乐观更新
      if (isSubscribed) {
        this.subscribedPlaylists = this.subscribedPlaylists.filter(p => String(p.id) !== pidStr)
      } else {
        const newPlaylist = typeof playlistObj === 'object' ? playlistObj : { id: pidStr, name: 'Unknown Playlist', coverUrl: '', trackIds: [] }
        this.subscribedPlaylists.push(newPlaylist)
      }
      window.dispatchEvent(new CustomEvent('playlist-subscribe-toggled', { detail: { playlistId: pidStr } }))

      try {
        let res
        if (isSubscribed) {
          if (window.electronAPI?.unsubscribeLocalPlaylist) {
            res = await window.electronAPI.unsubscribeLocalPlaylist(playlistId)
          }
        } else {
          if (window.electronAPI?.subscribeLocalPlaylist) {
            res = await window.electronAPI.subscribeLocalPlaylist(playlistId)
          }
        }
        if (res && !res.success) throw new Error(res.error || 'Failed')
      } catch (err) {
        this.subscribedPlaylists = oldSubscribedPlaylists
        window.dispatchEvent(new CustomEvent('playlist-subscribe-toggled', { detail: { playlistId: pidStr } }))
        console.error('Failed to toggle subscribe playlist', err)
      }
    }
  }
})
