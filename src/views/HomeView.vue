<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ========== 发现页入口卡片数据 ==========
const discoverCards = ref([
  {
    id: 'daily',
    title: '每日推荐',
    badge: '查看啦',
    subtitle: '强推！"八条轨道所览尝"',
    color: '#4ade80',
    icon: 'calendar',
  },
  {
    id: 'guess',
    title: '猜你喜欢',
    badge: null,
    subtitle: '依据你的听歌口味推荐',
    color: '#60a5fa',
    icon: 'guess',
  },
  {
    id: 'scene',
    title: '场景推荐',
    badge: null,
    subtitle: '为你的每一刻定制旋律',
    color: '#fbbf24',
    icon: 'scene',
  },
  {
    id: 'explore',
    title: '探索与发现',
    badge: '新品位',
    subtitle: '发现未被聆听的好音乐',
    color: '#f472b6',
    icon: 'explore',
  },
  {
    id: 'charts',
    title: '排行榜',
    badge: '热门歌曲',
    subtitle: '热门之选，高歌必看',
    color: '#67e8f9',
    icon: 'chart',
  },
  {
    id: 'artists',
    title: '歌手',
    badge: null,
    subtitle: '歌手精选，一键集放',
    color: '#fb923c',
    icon: 'artist',
  },
  {
    id: 'categories',
    title: '分类',
    badge: null,
    subtitle: '超选风格随心听',
    color: '#a78bfa',
    icon: 'category',
  },
])

async function handleCardClick(card) {
  switch (card.id) {
    case 'daily':
      router.push('/daily')
      break
    case 'guess':
    case 'scene':
      // TODO: 跳转到场景推荐页面
      break
    case 'explore':
      router.push('/explore')
      break
    case 'charts':
      // TODO: 跳转到排行榜页面
      break
    case 'artists':
      // TODO: 跳转到歌手页面
      break
    case 'categories':
      // TODO: 跳转到分类页面
      break
  }
}
</script>

<template>
  <div class="home-view">
    <p class="page-subtitle">发现你的专属音乐世界</p>

    <!-- 发现入口卡片 -->
    <section class="discover-section">
      <div class="discover-grid">
        <div
          v-for="card in discoverCards"
          :key="card.id"
          class="discover-card"
          :style="{ borderTopColor: card.color }"
          @click="handleCardClick(card)"
        >
          <!-- 图标区 -->
          <div class="card-icon-wrap" :style="{ background: card.color + '1a', color: card.color }">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <template v-if="card.icon === 'guess'">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </template>
              <template v-else-if="card.icon === 'calendar'">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </template>
              <template v-else-if="card.icon === 'scene'">
                <path d="M17 18a5 5 0 0 0-10 0"/>
                <line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
                <line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/>
                <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/>
                <polyline points="16 5 12 9 8 5"/>
              </template>
              <template v-else-if="card.icon === 'explore'">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </template>
              <template v-else-if="card.icon === 'chart'">
                <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="16"/>
              </template>
              <template v-else-if="card.icon === 'artist'">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </template>
              <template v-else>
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </template>
            </svg>
          </div>
          <!-- 文字区 -->
          <div class="card-body">
            <div class="card-header">
              <span class="card-title">{{ card.title }}</span>
              <span v-if="card.badge" class="card-badge" :style="{ color: card.color, borderColor: card.color }">{{ card.badge }}</span>
            </div>
            <p class="card-subtitle">{{ card.subtitle }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 24px 32px;
  gap: 24px;
  overflow-y: auto;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(224, 231, 255, 0.45);
  letter-spacing: 0.3px;
}

/* ====== 发现入口卡片区域 ====== */
.discover-section {
  width: 100%;
}

.discover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

/* 单张入口卡片 */
.discover-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  border-radius: 12px;
  background: var(--surface-2, #1e2028);
  border: 1px solid var(--border, #2a2d37);
  border-top: 3px solid transparent;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.discover-card:hover {
  background: var(--surface-3, #252830);
  border-color: #3a3d48;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* 图标容器 */
.card-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon {
  width: 22px;
  height: 22px;
}

/* 文字区域 */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 卡片头部：标题 + 徽章 */
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-h, #e8eaf0);
  letter-spacing: 0.3px;
}

/* 小徽章 */
.card-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  border: 1.5px solid;
  padding: 1px 8px;
  border-radius: 10px;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

/* 副标题 */
.card-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--text, #a0a5b5);
  line-height: 1.5;
}

/* 响应式 */
@media (max-width: 900px) {
  .discover-grid {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 12px;
  }
  .discover-card {
    padding: 18px;
    gap: 10px;
  }
  .card-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 8px;
  }
  .card-title {
    font-size: 15px;
  }
}

@media (max-width: 600px) {
  .discover-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
