<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Download,
  MagicStick,
  Star,
  ChatLineRound,
  Calendar,
  Clock,
} from '@element-plus/icons-vue'
import {
  getReport,
  submitFeedback,
  parseStats,
  statusLabel,
  periodTypeLabel,
} from '../api/reports'
import { markReportRead } from '../services/reportNotice'

const route = useRoute()
const router = useRouter()

const report = ref(null)
const loading = ref(false)
const feedbackRating = ref(null)
const feedbackComment = ref('')
const submitting = ref(false)
let pollTimer = null

const reportId = computed(() => route.params.id)
const isGenerating = computed(() => report.value?.status === 0)
const isReady = computed(() => report.value?.status === 1)
const isFailed = computed(() => report.value?.status === 2)
const isNoData = computed(() => report.value?.status === 3)
const hasReport = computed(() => report.value !== null)

const stats = computed(() => report.value ? parseStats(report.value.statsSnapshotJson) : null)

const hourly = computed(() => stats.value?.hourlyDistribution ?? [])
const weekday = computed(() => stats.value?.weekdayDistribution ?? [])
const topTracks = computed(() => (stats.value?.topTracks ?? []).slice(0, 8))
const topArtists = computed(() => (stats.value?.topArtists ?? []).slice(0, 8))

const maxHourly = computed(() => Math.max(1, ...hourly.value, 1))
const maxWeekday = computed(() => Math.max(1, ...weekday.value, 1))

const hourlyBars = computed(() =>
  hourly.value.map((v, i) => {
    const barH = (Number(v) / maxHourly.value) * 60
    const x = (i / 24) * 100 + 0.4
    const y = 60 - barH
    return { x, y, h: barH, v, label: i }
  }),
)
const weekdayBars = computed(() => {
  const labels = ['一', '二', '三', '四', '五', '六', '日']
  return weekday.value.map((v, i) => {
    const barH = (Number(v) / maxWeekday.value) * 60
    const barWidth = 12
    const x = i * (100 / 7) + 2
    return { x, y: 60 - barH, w: barWidth, h: barH, v, label: labels[i] }
  })
})

const summaryText = computed(() => report.value?.summary || '')
const moodTags = computed(() => report.value?.moodTags || [])
const highlights = computed(() => report.value?.highlights || [])
const recommendations = computed(() => report.value?.recommendations || [])

// ============= 加载 =============
async function load() {
  loading.value = true
  try {
    console.log('[ReportDetail] load id:', reportId.value)
    report.value = await getReport(reportId.value)
    console.log('[ReportDetail] loaded:', report.value)
  } catch (err) {
    console.error('[ReportDetail] load error:', err)
    ElMessage.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function startPollingIfNeeded() {
  stopPolling()
  if (isGenerating.value) {
    pollTimer = setInterval(async () => {
      try {
        const latest = await getReport(reportId.value)
        if (latest && latest.status !== 0) {
          report.value = latest
          stopPolling()
          ElMessage.success('报告生成完成')
        }
      } catch { /* ignore */ }
    }, 3000)
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// ============= 反馈 =============
async function handleFeedback() {
  if (!feedbackRating.value) {
    ElMessage.warning('请先选择赞/踩')
    return
  }
  submitting.value = true
  try {
    await submitFeedback(reportId.value, feedbackRating.value, feedbackComment.value || undefined)
    ElMessage.success('反馈已提交, 感谢!')
    feedbackComment.value = ''
  } catch (err) {
    ElMessage.error(err.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// ============= 下载 =============
function handleDownload() {
  if (!report.value) return
  const text = formatReportAsText(report.value, stats.value)
  downloadFile(`${report.value.title || '报告'}.md`, text, 'text/markdown;charset=utf-8')
}

function formatReportAsText(r, s) {
  const lines = []
  lines.push(`# ${r.title || r.periodTypeLabel}`)
  lines.push('')
  lines.push(`> 周期: ${r.periodStart} ~ ${r.periodEnd}`)
  lines.push(`> 生成时间: ${r.generatedAt || '生成中'}`)
  lines.push('')
  if (r.summary) {
    lines.push('## AI 总结')
    lines.push(r.summary)
    lines.push('')
  }
  if (r.moodTags && r.moodTags.length > 0) {
    lines.push('## 心情标签')
    lines.push(r.moodTags.map(t => `#${t}`).join(' '))
    lines.push('')
  }
  if (r.highlights && r.highlights.length > 0) {
    lines.push('## 高光时刻')
    r.highlights.forEach((h, i) => lines.push(`${i + 1}. ${h}`))
    lines.push('')
  }
  if (r.recommendations && r.recommendations.length > 0) {
    lines.push('## 推荐收听')
    r.recommendations.forEach((rec, i) => lines.push(`${i + 1}. ${rec}`))
    lines.push('')
  }
  if (s) {
    lines.push('## 数据统计')
    lines.push(`- 总播放: ${s.totalPlays ?? '-'}`)
    lines.push(`- 总时长(分钟): ${Math.round((s.totalDurationSec || 0) / 60)}`)
    lines.push(`- 去重歌曲: ${s.uniqueTracks ?? '-'}`)
    if (s.topTracks && s.topTracks.length > 0) {
      lines.push('')
      lines.push('### TOP 歌曲')
      s.topTracks.slice(0, 10).forEach((t, i) => {
        lines.push(`${i + 1}. ${t.name} (${t.count} 次)`)
      })
    }
  }
  lines.push('')
  lines.push('---')
  lines.push('Generated by Auramix')
  return lines.join('\n')
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

function back() {
  router.push('/reports')
}

onMounted(async () => {
  await load()
  startPollingIfNeeded()
  if (report.value && report.value.status === 1) {
    markReportRead(report.value.id)
  }
})

onUnmounted(stopPolling)
</script>

<template>
  <div class="report-detail" v-loading="loading">
    <!-- 顶栏 -->
    <header class="detail-topbar">
      <button class="btn btn-ghost" @click="back">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回列表</span>
      </button>
      <button
        v-if="report && isReady"
        class="btn btn-primary"
        @click="handleDownload"
      >
        <el-icon><Download /></el-icon>
        <span>下载报告</span>
      </button>
    </header>

    <div v-if="hasReport" class="detail-content">
      <!-- ============ Hero 头部 ============ -->
      <section class="detail-hero">
        <div class="detail-hero__bg" />
        <div class="detail-hero__corner detail-hero__corner--tl" />
        <div class="detail-hero__corner detail-hero__corner--tr" />
        <div class="detail-hero__corner detail-hero__corner--bl" />
        <div class="detail-hero__corner detail-hero__corner--br" />

        <div class="detail-hero__content">
          <div class="detail-hero__top">
            <span
              :class="['detail-hero__chip',
                report.status === 1 ? 'chip--ok' :
                report.status === 0 ? 'chip--pending' :
                report.status === 2 ? 'chip--failed' : 'chip--empty']"
            >
              {{ statusLabel(report.status) }}
            </span>
            <span class="detail-hero__type">{{ periodTypeLabel(report.periodType) }}</span>
            <span class="detail-hero__divider">|</span>
            <span class="detail-hero__id">#{{ String(report.id).slice(-6) }}</span>
          </div>
          <h1 class="detail-hero__title">{{ report.title || '听歌报告' }}</h1>
          <div class="detail-hero__meta">
            <span><el-icon><Calendar /></el-icon> {{ report.periodStart }} ~ {{ report.periodEnd }}</span>
            <span v-if="report.generatedAt"><el-icon><Clock /></el-icon> 生成于 {{ report.generatedAt }}</span>
            <span v-else-if="isGenerating" class="is-pending">
              <el-icon class="is-loading"><MagicStick /></el-icon> 正在生成...
            </span>
          </div>
        </div>
      </section>

      <!-- ============ 生成中 ============ -->
      <div v-if="isGenerating" class="status-block status-block--pending">
        <el-icon class="is-loading status-block__icon"><MagicStick /></el-icon>
        <h2>报告正在生成中</h2>
        <p>AI 正在分析你的听歌数据, 大约 5~15 秒。页面会自动刷新状态。</p>
      </div>

      <!-- ============ 无数据 ============ -->
      <div v-else-if="isNoData" class="status-block status-block--empty">
        <h2>本周期暂无听歌数据</h2>
        <p>先在「音乐库」里听点歌, 下个周期再来查看吧。</p>
        <button class="btn btn-primary" @click="back">返回列表</button>
      </div>

      <!-- ============ 失败 ============ -->
      <div v-else-if="isFailed" class="status-block status-block--failed">
        <h2>报告生成失败</h2>
        <p>{{ report.errorMessage || '未知错误, 请稍后重试' }}</p>
        <button class="btn btn-primary" @click="back">返回列表</button>
      </div>

      <!-- ============ 已生成 ============ -->
      <template v-else-if="isReady">
        <!-- AI 总结 -->
        <section v-if="summaryText" class="detail-section detail-section--lead">
          <h2 class="detail-section__title">AI 总结</h2>
          <p class="summary-text">{{ summaryText }}</p>
          <div v-if="moodTags.length > 0" class="mood-tags">
            <span
              v-for="(tag, idx) in moodTags"
              :key="idx"
              class="mood-tag"
            >#{{ tag }}</span>
          </div>
        </section>

        <!-- 高光 + 推荐 -->
        <div class="row-2">
          <section v-if="highlights.length > 0" class="detail-section">
            <h2 class="detail-section__title">高光时刻</h2>
            <ul class="bullet-list">
              <li v-for="(h, idx) in highlights" :key="idx">{{ h }}</li>
            </ul>
          </section>
          <section v-if="recommendations.length > 0" class="detail-section">
            <h2 class="detail-section__title">推荐收听</h2>
            <ul class="bullet-list">
              <li v-for="(r, idx) in recommendations" :key="idx">{{ r }}</li>
            </ul>
          </section>
        </div>

        <!-- 图表 -->
        <div class="row-2">
          <section class="detail-section">
            <h2 class="detail-section__title">时段分布（24h）</h2>
            <div class="chart-wrap">
              <svg viewBox="0 0 100 72" preserveAspectRatio="none" class="chart-svg">
                <line x1="0" y1="60" x2="100" y2="60" stroke="#1f1f1f" stroke-width="0.2" />
                <rect
                  v-for="(b, i) in hourlyBars"
                  :key="i"
                  :x="b.x"
                  :y="b.y"
                  width="3.3"
                  :height="b.h"
                  fill="#fff"
                  rx="0.3"
                />
              </svg>
              <div class="chart-axis">
                <span v-for="i in [0, 6, 12, 18, 23]" :key="i">{{ i }}:00</span>
              </div>
            </div>
          </section>

          <section class="detail-section">
            <h2 class="detail-section__title">周分布</h2>
            <div class="chart-wrap">
              <svg viewBox="0 0 100 72" preserveAspectRatio="none" class="chart-svg">
                <line x1="0" y1="60" x2="100" y2="60" stroke="#1f1f1f" stroke-width="0.2" />
                <rect
                  v-for="(b, i) in weekdayBars"
                  :key="i"
                  :x="b.x"
                  :y="b.y"
                  :width="b.w"
                  :height="b.h"
                  fill="#9ca3af"
                  rx="1"
                />
              </svg>
              <div class="chart-axis">
                <span v-for="(b, i) in weekdayBars" :key="i">周{{ b.label }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- TOP -->
        <div class="row-2">
          <section v-if="topTracks.length > 0" class="detail-section">
            <h2 class="detail-section__title">TOP 歌曲</h2>
            <ol class="rank-list">
              <li v-for="(t, idx) in topTracks" :key="idx">
                <span class="rank-num" :class="{ 'is-top': idx < 3 }">{{ idx + 1 }}</span>
                <span class="rank-label">{{ t.name }}</span>
                <span class="rank-value">{{ t.count }} 次</span>
              </li>
            </ol>
          </section>
          <section v-if="topArtists.length > 0" class="detail-section">
            <h2 class="detail-section__title">TOP 歌手</h2>
            <ol class="rank-list">
              <li v-for="(a, idx) in topArtists" :key="idx">
                <span class="rank-num" :class="{ 'is-top': idx < 3 }">{{ idx + 1 }}</span>
                <span class="rank-label">{{ a.name }}</span>
                <span class="rank-value">{{ a.count }} 次</span>
              </li>
            </ol>
          </section>
        </div>

        <!-- 反馈 -->
        <section class="detail-section">
          <h2 class="detail-section__title">报告反馈</h2>
          <div class="feedback-row">
            <span class="feedback-label">这份报告怎么样？</span>
            <div class="feedback-buttons">
              <button
                :class="['feedback-btn', { 'is-active': feedbackRating === 1 }]"
                @click="feedbackRating = 1"
              >
                <el-icon><Star /></el-icon> 赞
              </button>
              <button
                :class="['feedback-btn', { 'is-active': feedbackRating === 2 }]"
                @click="feedbackRating = 2"
              >
                <el-icon><ChatLineRound /></el-icon> 踩
              </button>
            </div>
          </div>
          <textarea
            v-model="feedbackComment"
            class="feedback-textarea"
            rows="3"
            placeholder="（可选）说点什么吧"
            maxlength="500"
          />
          <div class="feedback-footer">
            <span class="feedback-count">{{ feedbackComment.length }} / 500</span>
            <button
              class="btn btn-primary"
              :disabled="!feedbackRating"
              @click="handleFeedback"
            >提交反馈</button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ================== 全局黑主调 ================== */
.report-detail {
  position: relative;
  min-height: 100%;
  padding: 24px 40px 40px;
  background: #000;
  color: #e5e7eb;
}

/* 通用按钮 (与 ReportsView 一致) */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  background: transparent;
  color: #e5e7eb;
  font-family: inherit;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary { background: #fff; color: #000; border-color: #fff; }
.btn-primary:hover:not(:disabled) { background: #d4d4d4; border-color: #d4d4d4; }
.btn-secondary { background: transparent; color: #fff; border-color: #fff; }
.btn-secondary:hover:not(:disabled) { background: #fff; color: #000; }
.btn-ghost { background: transparent; color: #9ca3af; border-color: #1f1f1f; padding: 8px 12px; }
.btn-ghost:hover:not(:disabled) { color: #fff; border-color: #4b5563; background: #0a0a0a; }

.is-loading { animation: rotate 1.5s linear infinite; }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ================== 顶栏 ================== */
.detail-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-content {
  max-width: 1100px;
  margin: 0 auto;
}

/* ================== Hero ================== */
.detail-hero {
  position: relative;
  padding: 32px 36px 28px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%);
  border: 1px solid #1f1f1f;
  border-radius: 6px;
  overflow: hidden;
}

.detail-hero__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 600px 200px at 10% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse 600px 200px at 90% 100%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.detail-hero__corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
}
.detail-hero__corner--tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.detail-hero__corner--tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.detail-hero__corner--bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.detail-hero__corner--br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

.detail-hero__content { position: relative; z-index: 1; }

.detail-hero__top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.detail-hero__chip {
  display: inline-block;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  border-radius: 3px;
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
}
.chip--ok { background: #fff; color: #000; }
.chip--pending { color: #f59e0b; border-color: #f59e0b; }
.chip--failed { color: #ef4444; border-color: #ef4444; }
.chip--empty { color: #6b7280; border-color: #6b7280; }

.detail-hero__type {
  font-size: 12px;
  color: #6b7280;
  padding: 2px 8px;
  background: #111;
  border: 1px solid #1f1f1f;
  border-radius: 4px;
}

.detail-hero__divider {
  color: #4b5563;
  margin: 0 2px;
}

.detail-hero__id {
  font-family: 'Consolas', monospace;
  font-size: 11px;
  color: #6b7280;
}

.detail-hero__title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.detail-hero__meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #9ca3af;
}
.detail-hero__meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.is-pending { color: #f59e0b; }

/* ================== 状态块 ================== */
.status-block {
  padding: 80px 24px;
  text-align: center;
  background: #0a0a0a;
  border: 1px solid #1f1f1f;
  border-radius: 6px;
  margin-bottom: 24px;
}
.status-block h2 { margin: 16px 0 8px; font-size: 22px; color: #fff; font-weight: 600; }
.status-block p { margin: 0 0 24px; color: #9ca3af; font-size: 13px; }
.status-block__icon { font-size: 48px; }

.status-block--pending { border-color: #f59e0b; }
.status-block--pending .status-block__icon { color: #f59e0b; }

.status-block--failed { border-color: #ef4444; }
.status-block--failed h2 { color: #ef4444; }

.status-block--empty { border-color: #4b5563; }
.status-block--empty h2 { color: #9ca3af; }

/* ================== 2 列网格 ================== */
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* ================== 区段 ================== */
.detail-section {
  padding: 22px 26px;
  background: #0a0a0a;
  border: 1px solid #1f1f1f;
  border-radius: 6px;
  margin-bottom: 16px;
}

.detail-section--lead {
  border-color: #fff;
  background: linear-gradient(135deg, #0a0a0a 0%, #111 100%);
}

.detail-section__title {
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 2px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
}
.detail-section__title::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 2px;
  background: #fff;
  margin-right: 8px;
}

.summary-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #e5e7eb;
  white-space: pre-wrap;
}

.mood-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.mood-tag {
  display: inline-block;
  padding: 3px 10px;
  font-size: 11px;
  background: #fff;
  color: #000;
  border-radius: 12px;
}

/* 列表 */
.bullet-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.bullet-list li {
  position: relative;
  padding: 10px 14px 10px 28px;
  margin-bottom: 8px;
  background: #111;
  border: 1px solid #1f1f1f;
  border-radius: 4px;
  color: #e5e7eb;
  font-size: 13px;
  line-height: 1.6;
}
.bullet-list li::before {
  content: '◆';
  position: absolute;
  left: 10px;
  top: 10px;
  color: #fff;
  font-size: 10px;
}

/* 图表 */
.chart-wrap { position: relative; }
.chart-svg { width: 100%; height: 180px; display: block; }
.chart-axis {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}
.chart-axis span { flex: 1; text-align: center; }

/* TOP 榜 */
.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rank-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #111;
  border: 1px solid #1f1f1f;
  border-radius: 4px;
  transition: background 0.15s;
}
.rank-list li:hover { background: #1a1a1a; }

.rank-num {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  border-radius: 4px;
  flex-shrink: 0;
}
.rank-num.is-top { background: #fff; color: #000; }

.rank-label {
  flex: 1;
  font-size: 13px;
  color: #e5e7eb;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-value {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  font-family: 'Consolas', monospace;
  flex-shrink: 0;
}

/* 反馈 */
.feedback-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.feedback-label { font-size: 13px; color: #9ca3af; }
.feedback-buttons { display: flex; gap: 8px; }

.feedback-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 12px;
  background: #111;
  color: #9ca3af;
  border: 1px solid #1f1f1f;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.feedback-btn:hover { color: #fff; border-color: #4b5563; }
.feedback-btn.is-active { background: #fff; color: #000; border-color: #fff; }

.feedback-textarea {
  width: 100%;
  background: #111;
  border: 1px solid #1f1f1f;
  color: #e5e7eb;
  border-radius: 4px;
  padding: 10px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  box-sizing: border-box;
}
.feedback-textarea:focus {
  outline: none;
  border-color: #fff;
}

.feedback-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.feedback-count {
  font-size: 11px;
  color: #6b7280;
  font-family: 'Consolas', monospace;
}
</style>