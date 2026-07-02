if (!BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function() {
    return this.toString()
  }
}

const express = require('express')
const { ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const { app, BrowserWindow, dialog, Tray, Menu, nativeImage } = require('electron')
const ApiResult = require('../server/pojo/vo/ApiResult')

let mainWindow = null
let tray = null
let isQuitting = false
let expressServer = null
const EXPRESS_PORT = 3000

// ========== 系统托盘 ==========
function createTray() {
  // 使用 nativeImage 创建一个简单的托盘图标（16x16 紫色圆角方块 + 音符符号）
  const size = 16
  const canvas = Buffer.alloc(size * size * 4) // RGBA

  // 绘制一个紫色背景的圆形图标
  const centerX = 7.5
  const centerY = 7.5
  const radius = 7
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centerX
      const dy = y - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const idx = (y * size + x) * 4

      if (dist <= radius) {
        // 紫色 #863bff
        canvas[idx] = 0x86       // R
        canvas[idx + 1] = 0x3b   // G
        canvas[idx + 2] = 0xff   // B
        canvas[idx + 3] = 0xff   // A
      } else {
        // 透明
        canvas[idx] = 0
        canvas[idx + 1] = 0
        canvas[idx + 2] = 0
        canvas[idx + 3] = 0
      }
    }
  }

  const icon = nativeImage.createFromBuffer(canvas, {
    width: size,
    height: size,
  })
  // macOS 需要 template image
  icon.setTemplateImage(true)

  tray = new Tray(icon)
  tray.setToolTip('Auramix')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'open Auramix',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show()
          mainWindow.focus()
        } else {
          createWindow()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'exit',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  // 双击托盘图标显示窗口（Windows）
  tray.on('double-click', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
    } else {
      createWindow()
    }
  })
}

// ========== 窗口管理 ==========
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minHeight: 600,
    minWidth: 920,
    backgroundColor: '#0d0e11',
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false,
  })

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged

  mainWindow.on('maximize', () => mainWindow.webContents.send('window-maximized-changed', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-maximized-changed', false))

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())

  // Intercept Ctrl+R to prevent default reload and send custom sync event
  // F12 / Ctrl+Shift+I / Cmd+Opt+I 打开 DevTools (方便桌面端调试)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
      event.preventDefault()
      mainWindow.webContents.send('app-sync-reload')
    }
    // F12: 打开/关闭 DevTools
    if (input.key === 'F12') {
      event.preventDefault()
      mainWindow.webContents.toggleDevTools()
    }
    // Ctrl+Shift+I (Windows/Linux) 或 Cmd+Opt+I (Mac)
    if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i') {
      event.preventDefault()
      mainWindow.webContents.toggleDevTools()
    }
  })

  // 关键：点击关闭按钮时隐藏到托盘，而不是关闭窗口
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
      // Windows: 可选显示通知
      if (tray && process.platform === 'win32') {
        tray.displayBalloon({
          title: 'Spotify',
          content: '应用已最小化到系统托盘',
          icon: nativeImage.createFromBuffer(Buffer.alloc(1)), // 使用默认图标
        })
      }
    }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

// ========== 歌词悬浮窗 ==========
let lyricsWindow = null

function createLyricsWindow() {
  if (lyricsWindow) return

  lyricsWindow = new BrowserWindow({
    width: 800,
    height: 120,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false,
  })

  // 不让鼠标点击穿透，或者让它穿透（酷狗歌词默认是可以穿透的，只有悬浮时才显示工具栏，为了简单先不穿透）
  // lyricsWindow.setIgnoreMouseEvents(true, { forward: true }) // 先不加

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged
  if (isDev) {
    lyricsWindow.loadURL('http://localhost:5173/#/lyrics-widget')
  } else {
    // vue router hash mode
    lyricsWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '/lyrics-widget' })
  }

  lyricsWindow.on('closed', () => { lyricsWindow = null })
}

// ========== Express 服务器 ==========
function startExpressServer() {
  const expressApp = express()

  // 跨域
  expressApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Token')
    if (req.method === 'OPTIONS') return res.sendStatus(200)
    next()
  })

  expressApp.use(express.json({ limit: '500mb' }))
  expressApp.use(express.urlencoded({ extended: true, limit: '500mb' }))

  // ---- 引入控制器 (Controllers) ----
  const musicController = require('../server/controller/musicController')
  const convertController = require('../server/controller/convertController')
  const decryptController = require('../server/controller/decryptController')
  const lyricsDecryptController = require('../server/controller/lyricsDecryptController')
  const libraryController = require('../server/controller/libraryController')
  const aiChatController = require('../server/controller/aiChatController')
  const intelligentController = require('../server/controller/intelligentController')

  // ---- 挂载路由 ----
  expressApp.use('/api/music', musicController(mainWindow))
  expressApp.use('/api/intelligent', intelligentController(mainWindow))
  expressApp.use('/api/convert', convertController(mainWindow))
  expressApp.use('/api/decrypt', decryptController(mainWindow))
  expressApp.use('/api/lyrics-decrypt', lyricsDecryptController(mainWindow))
  expressApp.use('/api/library', libraryController(mainWindow))
  expressApp.use('/api/ai-chat', aiChatController(mainWindow))

  expressServer = expressApp.listen(EXPRESS_PORT, () => {
    console.log(`[Express] Server running on http://localhost:${EXPRESS_PORT}`)
  })
}

// ========== 窗口控制 IPC ==========
function setupWindowControls() {
  ipcMain.on('window-minimize', () => mainWindow && mainWindow.minimize())
  ipcMain.on('window-maximize', () => {
    if (!mainWindow) return
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  })
  ipcMain.on('window-close', () => mainWindow && mainWindow.close())

  ipcMain.on('toggle-lyrics-window', () => {
    if (!lyricsWindow) {
      createLyricsWindow()
    }
    if (lyricsWindow.isVisible()) {
      lyricsWindow.hide()
    } else {
      lyricsWindow.show()
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('lyrics-window-state', lyricsWindow.isVisible())
    }
  })

  ipcMain.on('update-lyrics-status', (event, data) => {
    if (lyricsWindow && !lyricsWindow.isDestroyed()) {
      lyricsWindow.webContents.send('on-lyrics-status-update', data)
    }
  })

  ipcMain.on('window-move', (event, { x, y }) => {
    if (lyricsWindow && !lyricsWindow.isDestroyed()) {
      lyricsWindow.setPosition(Math.round(x), Math.round(y))
    }
  })

  // 选择文件，处理前端选择音乐文件的请求
  ipcMain.handle('dialog:selectMusicFiles', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        title: '选择音频文件',
        filters: [
          {
            name: '音频文件',
            extensions: ['flac', 'mp3', 'ogg', 'wav', 'aac', 'm4a', 'kgm', 'kgma', 'qmc0', 'qmc3', 'qmcflac', 'qmcogg', 'mflac', 'mgg', 'ncm', 'kwm']
          },
        ],
      })
      if (result.canceled) {
        return []
      }
      return result.filePaths
    } catch (err) {
      console.error('打开文件管理器失败:', err)
      return []
    }
  })

  // 跨域代理获取文本内容
  ipcMain.handle('fetch-text', async (event, url) => {
    try {
      const response = await fetch(url)
      const text = await response.text()
      return { success: true, text }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  // 读取文件为 ArrayBuffer
  ipcMain.on('read-file', (event, { key, filePath }) => {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        event.reply('read-file-result', { key, error: '文件不存在或已被删除' })
        return
      }
      const buffer = fs.readFileSync(filePath)
      const ext = path.extname(filePath).toLowerCase()
      const mimeMap = {
        '.flac': 'audio/flac',
        '.mp3': 'audio/mpeg',
        '.ogg': 'audio/ogg',
        '.wav': 'audio/wav',
        '.aac': 'audio/aac',
        '.m4a': 'audio/mp4',
      }
      event.reply('read-file-result', {
        key,
        buffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
        mimeType: mimeMap[ext] || 'application/octet-stream',
      })
    } catch (err) {
      event.reply('read-file-result', { key, error: err.message })
    }
  })
}

// ========== 启动 ==========
const { initDatabase, autoMigrate, autoRecoverFromFiles, disconnectDatabase } = require('../server/dao/db')

app.whenReady().then(async () => {
  // 1. 初始化数据库
  initDatabase()

  // 2. 自动执行建表迁移（确保运行时数据库表结构存在）
  await autoMigrate()

  // 3. 自动恢复：数据库为空时从已有文件夹重建
  await autoRecoverFromFiles()

  // 4. 创建系统托盘
  createTray()

  // 5. 创建窗口
  createWindow()
  
  // 初始化歌词窗口
  createLyricsWindow()

  // 6. 启动 Express 服务器 (此时 mainWindow 已经被创建)
  startExpressServer()

  // 7. 设置 IPC
  setupWindowControls()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })
})

// 真正退出时的清理
app.on('before-quit', async () => {
  isQuitting = true
  await disconnectDatabase()
  if (expressServer) expressServer.close()
  if (tray) tray.destroy()
})

app.on('window-all-closed', () => {
  // 不退出：窗口关闭只是隐藏到托盘，isQuitting 才是真正退出
  if (process.platform === 'darwin' && !isQuitting) {
    // macOS: 应用不会因为窗口关闭而退出，这行实际不会执行
  }
})
