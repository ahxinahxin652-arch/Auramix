import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useLibraryStore } from './library.js'

export const useMusicLibraryStore = defineStore('musicLibrary', () => {
  // ---- 状态 ----
  const warehouses = ref([])           // 音乐库列表 [{ id, name, description, coverUrl, trackCount, ownerName, isPublic, ... }]
  const currentWarehouse = ref(null)    // 当前音乐库
  const sortBy = ref('recent-played')   // 排序方式: 'recent-played' | 'recent-updated' | 'name'
  const totalCount = ref(0)             // 远端歌单总数
  const currentPage = ref(1)            // 当前页码
  const pageSize = ref(100)             // 每页大小
  const isLoading = ref(false)

  // ---- Actions ----

  /**
   * 从远端 API (8080 / MySQL) 加载歌单列表
   */
  async function loadWarehouses() {
    if (isLoading.value) return
    isLoading.value = true
    try {
      const result = await window.electronAPI.getRemotePlaylists({
        pageNum: currentPage.value,
        pageSize: pageSize.value,
      })
      if (result.success && result.data) {
        warehouses.value = result.data.warehouses || []
        totalCount.value = result.data.total || 0
      }
    } catch (err) {
      console.error('加载远端歌单列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 通过远端 API 创建歌单
   * @param {object} body - { name, description?, isPublic? }
   */
  async function createWarehouse(body) {
    try {
      const result = await window.electronAPI.createRemotePlaylist({
        name: body.name,
        description: body.description || '',
        isPublic: body.isPublic !== undefined ? body.isPublic : true,
      })
      if (result.success && result.data) {
        const pl = result.data.playlist
        if (pl) {
          warehouses.value.unshift({
            ...pl,
            trackCount: pl.trackCount || 0,
          })
          // 乐观更新左侧栏对应的本地库歌单
          const libStore = useLibraryStore()
          if (!libStore.playlists.find(p => String(p.id) === String(pl.id))) {
            libStore.playlists.unshift({
              id: pl.id,
              name: pl.name,
              coverUrl: pl.coverUrl || '',
              trackIds: []
            })
          }
        } else {
          await loadWarehouses()
        }
        return { success: true }
      }
      return { success: false, error: result.error || result.message || '创建失败' }
    } catch (err) {
      console.error('创建远端歌单失败:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 通过远端 API 保存歌单（合并信息更新 + 可选封面上传）
   * @param {string|number} libraryId
   * @param {object} options - { name?, description?, isPublic?, clearCover?, coverBase64?, coverFilename? }
   */
  async function saveWarehouse(libraryId, options = {}) {
    try {
      const result = await window.electronAPI.saveRemotePlaylist(libraryId, {
        name: options.name,
        description: options.description,
        isPublic: options.isPublic,
        clearCover: options.clearCover || false,
        coverBase64: options.coverBase64 || '',
        coverFilename: options.coverFilename || 'cover.jpg',
      })
      if (result.success) {
        // 更新本地缓存
        const idx = warehouses.value.findIndex(w => w.id === libraryId || String(w.id) === String(libraryId))
        if (idx !== -1) {
          if (options.name !== undefined) warehouses.value[idx].name = options.name
          if (options.description !== undefined) warehouses.value[idx].description = options.description
          if (options.isPublic !== undefined) warehouses.value[idx].isPublic = options.isPublic
          if (result.data && result.data.coverUrl) {
            warehouses.value[idx].coverUrl = result.data.coverUrl
          } else if (options.clearCover) {
            warehouses.value[idx].coverUrl = ''
          }
        }
        // 同步修改左侧栏对应的本地库歌单
        const libStore = useLibraryStore()
        const libIdx = libStore.playlists.findIndex(p => String(p.id) === String(libraryId))
        if (libIdx !== -1) {
          if (options.name !== undefined) libStore.playlists[libIdx].name = options.name
          if (result.data && result.data.coverUrl) {
            libStore.playlists[libIdx].coverUrl = result.data.coverUrl
          } else if (options.clearCover) {
            libStore.playlists[libIdx].coverUrl = ''
          }
        }
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error || result.message || '保存失败' }
    } catch (err) {
      console.error('保存远端歌单失败:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 通过远端 API 删除歌单
   * @param {string|number} libraryId
   */
  async function deleteWarehouse(libraryId) {
    try {
      const result = await window.electronAPI.deleteRemotePlaylist(libraryId)
      if (result.success) {
        warehouses.value = warehouses.value.filter(
          w => w.id !== libraryId && String(w.id) !== String(libraryId)
        )
        // 从左侧栏对应的本地库歌单中移除
        const libStore = useLibraryStore()
        libStore.playlists = libStore.playlists.filter(
          p => String(p.id) !== String(libraryId)
        )
        return true
      }
      return false
    } catch (err) {
      console.error('删除远端歌单失败:', err)
      return false
    }
  }

  function setCurrentWarehouse(warehouse) {
    currentWarehouse.value = warehouse
  }

  function setSortBy(newSort) {
    sortBy.value = newSort
  }

  return {
    warehouses,
    currentWarehouse,
    sortBy,
    totalCount,
    currentPage,
    pageSize,
    isLoading,
    loadWarehouses,
    createWarehouse,
    saveWarehouse,
    deleteWarehouse,
    setCurrentWarehouse,
    setSortBy,
  }
})
