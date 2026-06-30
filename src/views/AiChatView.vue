<template>
  <div class="ai-chat-container" ref="containerRef">
    <!-- 左侧会话历史侧边栏（中心区域过小时隐藏） -->
    <div
      v-show="showAiSidebar"
      class="ai-sidebar"
      :style="{ width: aiSidebarWidth + 'px', minWidth: aiSidebarWidth + 'px' }"
    >
      <div class="sidebar-header">
        <h2 class="sidebar-title">Auramix Agent</h2>
        <button class="new-chat-btn" @click="startNewSession" title="新建对话">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      <div class="session-list">
        <div 
          v-for="session in sessions" 
          :key="session.id"
          class="session-item"
          :class="{ active: currentSessionId === session.id }"
          @click="selectSession(session.id)"
        >
          <svg class="session-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="session-title">{{ session.title }}</span>
          <button class="delete-btn" @click.stop="deleteSession(session.id)" title="删除">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 拖拽分隔条（仅在左侧栏可见时显示） -->
    <div
      v-show="showAiSidebar"
      class="ai-sidebar-resizer"
      @mousedown="startSidebarDrag"
    ></div>

    <!-- 右侧聊天主区域 -->
    <div class="ai-main">
      <div class="chat-messages" ref="messagesContainer">
        <!-- 欢迎页 -->
        <div v-if="messages.length === 0" class="welcome-screen">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16.01"></line>
            <line x1="16" y1="16" x2="16" y2="16.01"></line>
          </svg>
          <h3>我是你的智能音乐助手</h3>
          <p>告诉我你今天想听什么风格的音乐？或者有什么音乐相关的问题？</p>
        </div>
        
        <!-- 消息列表 -->
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          class="message-wrapper"
          :class="{ 'is-user': msg.role === 'user' }"
        >
          <div class="message-avatar" v-if="msg.role !== 'user'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
            </svg>
          </div>
          <div class="message-content" v-html="formatMessage(msg.content)"></div>
          <div class="message-avatar" v-if="msg.role === 'user'">
            <img v-if="userStore.profile?.avatarUrl" :src="userStore.profile.avatarUrl" />
            <div v-else class="avatar-placeholder">{{ userStore.profile?.displayName?.charAt(0).toUpperCase() || 'U' }}</div>
          </div>
        </div>
        
        <!-- 正在加载状态 -->
        <div v-if="isStreaming" class="message-wrapper">
           <div class="message-avatar">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
             </svg>
           </div>
           <div class="message-content typing-indicator">
             <span></span><span></span><span></span>
           </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="chat-input-area">
        <div class="input-container">
          <textarea 
            v-model="inputText" 
            placeholder="你好！今天想聊什么？"
            @keydown="handleKeydown"
            :disabled="isStreaming"
            rows="1"
            ref="inputArea"
          ></textarea>
          <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || isStreaming">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const sessions = ref([])
const currentSessionId = ref(null)
const messages = ref([])
const inputText = ref('')
const isStreaming = ref(false)
const messagesContainer = ref(null)
const inputArea = ref(null)
const containerRef = ref(null)

// ===== 响应式：是否显示左侧对话框 =====
// 当中心区域（ai-chat-container）宽度小于阈值时隐藏左侧对话框
const SIDEBAR_HIDE_THRESHOLD = 520 // px，低于此值隐藏左侧会话列表
const showAiSidebar = ref(true)

// ===== 左侧栏拖拽宽度 =====
const AI_SIDEBAR_MIN = 150   // 最小宽度
const AI_SIDEBAR_MAX = 360   // 最大宽度
const AI_SIDEBAR_DEFAULT = 240
const aiSidebarWidth = ref(AI_SIDEBAR_DEFAULT)
const isSidebarDragging = ref(false)

// ResizeObserver 监测容器宽度变化
let resizeObserver = null

function updateSidebarVisibility(width) {
  showAiSidebar.value = width >= SIDEBAR_HIDE_THRESHOLD
}

// ===== 拖拽逻辑 =====
function startSidebarDrag(e) {
  e.preventDefault()
  isSidebarDragging.value = true
  const startX = e.clientX
  const startWidth = aiSidebarWidth.value

  function onMouseMove(e) {
    const delta = e.clientX - startX
    let newWidth = startWidth + delta
    newWidth = Math.max(AI_SIDEBAR_MIN, Math.min(AI_SIDEBAR_MAX, newWidth))
    aiSidebarWidth.value = newWidth
  }

  function onMouseUp() {
    isSidebarDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const LOCAL_API = 'http://localhost:3000/api/ai-chat'
const BACKEND_API = 'http://localhost:8080/api/user/ai/chat/stream'

onMounted(() => {
  loadSessions()

  // 用 ResizeObserver 监听容器宽度变化
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        updateSidebarVisibility(width)
      }
    })
    resizeObserver.observe(containerRef.value)
    // 初始检测
    updateSidebarVisibility(containerRef.value.offsetWidth)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

const loadSessions = async () => {
  try {
    const res = await fetch(`${LOCAL_API}/sessions`)
    const data = await res.json()
    if (data.success) {
      sessions.value = data.data
      if (sessions.value.length > 0 && !currentSessionId.value) {
        selectSession(sessions.value[0].id)
      }
    }
  } catch (err) {
    console.error('Failed to load sessions', err)
  }
}

const startNewSession = async () => {
  try {
    const res = await fetch(`${LOCAL_API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '新对话' })
    })
    const data = await res.json()
    if (data.success) {
      sessions.value.unshift(data.data)
      selectSession(data.data.id)
    }
  } catch (err) {
    console.error('Failed to create session', err)
  }
}

const selectSession = async (id) => {
  currentSessionId.value = id
  messages.value = []
  try {
    const res = await fetch(`${LOCAL_API}/sessions/${id}/messages`)
    const data = await res.json()
    if (data.success) {
      messages.value = data.data
      scrollToBottom()
    }
  } catch (err) {
    console.error('Failed to load messages', err)
  }
}

const deleteSession = async (id) => {
  try {
    const res = await fetch(`${LOCAL_API}/sessions/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      sessions.value = sessions.value.filter(s => s.id !== id)
      if (currentSessionId.value === id) {
        currentSessionId.value = null
        messages.value = []
        if (sessions.value.length > 0) {
          selectSession(sessions.value[0].id)
        }
      }
    }
  } catch (err) {
    console.error('Failed to delete session', err)
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 自动调整输入框高度
watch(inputText, () => {
  nextTick(() => {
    if (inputArea.value) {
      inputArea.value.style.height = 'auto'
      inputArea.value.style.height = (inputArea.value.scrollHeight) + 'px'
    }
  })
})

const formatMessage = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br/>')
}

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return
  
  if (!currentSessionId.value) {
    await startNewSession()
  }

  const sessionId = currentSessionId.value
  inputText.value = ''
  
  // 1. 保存用户消息到本地 SQLite
  try {
    const userMsgRes = await fetch(`${LOCAL_API}/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content: text })
    })
    const userMsgData = await userMsgRes.json()
    if (userMsgData.success) {
      messages.value.push(userMsgData.data)
      scrollToBottom()
    }
  } catch (err) {
    console.error('Failed to save user message', err)
    return
  }

  isStreaming.value = true
  
  // 准备发送到后端的数据（提取历史记录）
  const history = messages.value.map(m => ({ role: m.role, content: m.content }))
  
  try {
    const token = localStorage.getItem('auramix_token')
    const response = await fetch(BACKEND_API, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Internal-Api-Key': 'auramix-desktop-internal-key-2026'
      },
      body: JSON.stringify({ messages: history })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let aiContent = ''
    
    // 创建一个占位的 AI 消息
    const aiMessage = { role: 'ai', content: '' }
    messages.value.push(aiMessage)

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value, { stream: true })
      // SSE 格式通常是: data: 实际内容\n\n
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataStr = line.substring(5).trim()
          if (dataStr && dataStr !== '[DONE]') {
             aiContent += dataStr
             aiMessage.content = aiContent
             scrollToBottom()
          }
        }
      }
    }
    
    // 2. 保存 AI 回复到本地 SQLite
    await fetch(`${LOCAL_API}/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ai', content: aiContent })
    })
    
  } catch (err) {
    console.error('Chat stream error', err)
    messages.value.push({ role: 'ai', content: '网络出错了，请稍后再试。' })
  } finally {
    isStreaming.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #121212;
  color: #e0e0e0;
  overflow: hidden;
}

/* ===== 左侧会话历史侧边栏 ===== */
.ai-sidebar {
  background-color: #000000;
  border-right: 1px solid #282828;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.15s ease;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #282828;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.new-chat-btn {
  background: transparent;
  color: #b3b3b3;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
}
.new-chat-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

/* ===== Webkit 滚动条 — 会话列表 ===== */
.session-list::-webkit-scrollbar {
  width: 4px;
}
.session-list::-webkit-scrollbar-track {
  background: transparent;
}
.session-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.10);
  border-radius: 100px;
}
.session-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

.session-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  color: #b3b3b3;
}

.session-item:hover {
  background-color: #1a1a1a;
}
.session-item.active {
  background-color: #282828;
  color: #fff;
}

.session-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.session-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.delete-btn {
  background: transparent;
  color: #b3b3b3;
  border: none;
  cursor: pointer;
  opacity: 0;
  padding: 4px;
  display: flex;
}
.session-item:hover .delete-btn {
  opacity: 1;
}
.delete-btn:hover {
  color: #f87171;
}

/* ===== 拖拽分隔条 ===== */
.ai-sidebar-resizer {
  width: 4px;
  flex-shrink: 0;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s;
  position: relative;
  z-index: 10;
}
.ai-sidebar-resizer:hover,
.ai-sidebar-resizer:active {
  background: rgba(29, 185, 84, 0.5);
}

/* 拖拽时全局 cursor 不被覆盖 */
.ai-chat-container:has(.ai-sidebar-resizer:active) {
  cursor: col-resize;
}

/* ===== 主聊天区 ===== */
.ai-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

/* ===== Webkit 滚动条 — 聊天消息区 ===== */
.chat-messages::-webkit-scrollbar {
  width: 5px;
}
.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}
.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  transition: background 0.2s;
}
.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.28);
}
.chat-messages::-webkit-scrollbar-corner {
  background: transparent;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #b3b3b3;
  text-align: center;
}
.welcome-screen h3 {
  margin-top: 16px;
  color: #e0e0e0;
}

.message-wrapper {
  display: flex;
  margin-bottom: 24px;
  max-width: 80%;
  align-items: flex-start;
}

.message-wrapper.is-user {
  align-self: flex-end;
  justify-content: flex-end;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-placeholder {
  font-size: 14px;
  color: #e0e0e0;
}

.message-wrapper:not(.is-user) .message-avatar {
  margin-right: 12px;
}
.message-wrapper.is-user .message-avatar {
  margin-left: 12px;
}

.message-content {
  background: #282828;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #e0e0e0;
  word-wrap: break-word;
  word-break: break-word;
}

.message-wrapper.is-user .message-content {
  background: #1db954;
  color: #000;
  border-bottom-right-radius: 2px;
}
.message-wrapper:not(.is-user) .message-content {
  border-bottom-left-radius: 2px;
}

.typing-indicator span {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #b3b3b3;
  border-radius: 50%;
  margin-right: 4px;
  animation: typing 1.4s infinite ease-in-out;
}
.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; margin-right: 0; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* ===== 输入区域 ===== */
.chat-input-area {
  padding: 16px 24px 24px;
  flex-shrink: 0;
}

.input-container {
  display: flex;
  align-items: flex-end;
  background: #282828;
  border-radius: 12px;
  padding: 8px 12px;
  border: 1px solid #3e3e3e;
}

.input-container:focus-within {
  border-color: #1db954;
}

textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  padding: 4px;
  max-height: 120px;
  min-height: 24px;
  outline: none;
}

/* ===== Webkit 滚动条 — 输入框 ===== */
textarea::-webkit-scrollbar {
  width: 4px;
}
textarea::-webkit-scrollbar-track {
  background: transparent;
}
textarea::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 100px;
}
textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.28);
}

.send-btn {
  background: #1db954;
  color: #000;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 8px;
}
.send-btn:disabled {
  background: #333333;
  color: #888;
  cursor: not-allowed;
}
</style>
