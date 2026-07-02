<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { backendFetch } from '../utils/backendApi'
import QRCode from 'qrcode'

const userStore = useUserStore()

const plans = ref([])
const loading = ref(true)
const loadError = ref('')
const subscribeLoading = ref(null)
const selectedPayType = ref(0) // 0=微信支付, 1=支付宝
const confirmPaymentLoading = ref(false)
const cancelOrderLoading = ref(false)

// 选中卡片（点击可转移高亮）
const selectedPlanId = ref(null)

// 支付弹窗状态
const showPayment = ref(false)
const orderInfo = ref(null)
const payCountdown = ref('')
const payExpired = ref(false)
const qrCodeDataUrl = ref('')
let countdownTimer = null

// 未支付订单列表（从后端获取）
const pendingOrders = ref([])

// 当前会员订阅信息
const myMembership = ref(null)

const hasActiveMembership = computed(() => {
  if (!myMembership.value) return false
  return new Date(myMembership.value.endDate).getTime() > Date.now()
})

async function fetchPendingOrders() {
  try {
    pendingOrders.value = await backendFetch('/api/user/manage/member/pendingOrders') || []
  } catch {
    pendingOrders.value = []
  }
}

async function refreshMyMembership() {
  try {
    const membership = await backendFetch('/api/user/manage/member/myMembership').catch(() => null)
    const membershipData = Array.isArray(membership) ? membership[0] : membership
    if (membershipData && new Date(membershipData.endDate).getTime() > Date.now()) {
      myMembership.value = membershipData
    } else {
      myMembership.value = null
    }
  } catch {
    myMembership.value = null
  }
}

function getPendingOrder(planId) {
  return pendingOrders.value.find(o => o.planId === planId) || null
}

function hasPendingOrder(planId) {
  return pendingOrders.value.some(o => o.planId === planId)
}

const userLevel = computed(() => userStore.profile?.level ?? userStore.profile?.product ?? 0)

onMounted(async () => {
  try {
    const [data, orders, membership] = await Promise.all([
      backendFetch('/api/user/manage/member/plans'),
      backendFetch('/api/user/manage/member/pendingOrders').catch(() => []),
      backendFetch('/api/user/manage/member/myMembership').catch(() => null)
    ])
    const activePlans = (data || [])
      .filter(p => p.status === 1)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    plans.value = activePlans
    pendingOrders.value = orders || []

    // 处理会员信息（响应可能是数组或单个对象）
    const membershipData = Array.isArray(membership) ? membership[0] : membership
    if (membershipData && new Date(membershipData.endDate).getTime() > Date.now()) {
      myMembership.value = membershipData
    }
  } catch (err) {
    console.error('获取套餐信息失败:', err)
    loadError.value = err.message || '无法加载套餐信息，请稍后重试'
  } finally {
    loading.value = false
  }
})

const maxLevel = computed(() => {
  if (plans.value.length === 0) return 0
  return Math.max(...plans.value.map(p => p.level))
})

function isCurrentPlan(plan) {
  if (hasActiveMembership.value) {
    return plan.id === myMembership.value.planId
  }
  return plan.level <= userLevel.value
}

function isRecommended(plan) {
  // 有活跃会员时不显示"推荐"
  if (hasActiveMembership.value) return false
  if (plan.level === userLevel.value) return false
  return plan.level === maxLevel.value
}

function isSelected(plan) {
  if (selectedPlanId.value !== null) {
    return plan.id === selectedPlanId.value
  }
  // 默认选中推荐卡片，无推荐则选第一个可购买的
  return isRecommended(plan)
}

function selectPlan(plan) {
  selectedPlanId.value = plan.id
}

function formatDuration(months) {
  if (months === 1) return '/ 月'
  if (months === 12) return '/ 年'
  return ` / ${months} 个月`
}

function discountPercent(plan) {
  if (!plan.originalPrice || plan.originalPrice <= plan.price) return 0
  return Math.round((1 - plan.price / plan.originalPrice) * 100)
}

// 返回本地时间的 ISO 格式字符串，无时区后缀（如 "2026-06-27T15:20:00"）
function toLocalTimeString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatExpiryDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function handleSubscribe(plan) {
  subscribeLoading.value = plan.id
  try {
    const payUrl = `auramix://pay?planId=${plan.id}&amount=${plan.price}&payType=${selectedPayType.value}`
    const res = await backendFetch('/api/user/manage/member/createOrder', {
      method: 'POST',
      body: { planId: plan.id, payType: selectedPayType.value, payUrl }
    })

    // 刷新待支付订单列表
    fetchPendingOrders()

    orderInfo.value = res
    payExpired.value = false
    showPayment.value = true
    startCountdown(res.expireTime)
    await generateQRCode(res)
  } catch (err) {
    ElMessage.error(err.message || '创建订单失败')
  } finally {
    subscribeLoading.value = null
  }
}

function payPendingOrder(planId) {
  const order = getPendingOrder(planId)
  if (!order) {
    ElMessage.warning('订单已过期，请重新购买')
    return
  }
  orderInfo.value = order
  payExpired.value = false
  selectedPayType.value = order.payType ?? 0
  showPayment.value = true
  startCountdown(order.expireTime)
  generateQRCode(order)
}

async function generateQRCode(order) {
  // 构建支付链接：优先使用后端返回的 payUrl，否则用订单号构造
  const payContent = order.payUrl || `auramix://pay?orderNo=${order.orderNo}&amount=${order.amount}`
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(payContent, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch {
    qrCodeDataUrl.value = ''
  }
}

function startCountdown(expireTime) {
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    const now = Date.now()
    const expire = new Date(expireTime).getTime()
    const remaining = expire - now

    if (remaining <= 0) {
      payExpired.value = true
      payCountdown.value = '00:00'
      clearInterval(countdownTimer)
      countdownTimer = null
      showPayment.value = false
      fetchPendingOrders()
      return
    }

    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    payCountdown.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, 200)
}

function closePayment() {
  showPayment.value = false
  clearInterval(countdownTimer)
  countdownTimer = null
}

// 测试用：模拟支付成功
async function confirmPayment() {
  if (!orderInfo.value?.id) return
  confirmPaymentLoading.value = true
  try {
    // 生成模拟交易流水号
    const transactionId = `TEST${orderInfo.value.id}${Date.now()}`
    await backendFetch('/api/user/manage/member/paymentSuccess', {
      method: 'POST',
      body: {
        orderId: orderInfo.value.id,
        transactionId
      }
    })
    // 刷新待支付订单列表和会员信息
    await refreshMyMembership()
    fetchPendingOrders()
    closePayment()
    ElMessage.success('支付成功（测试模式）')
  } catch (err) {
    ElMessage.error(err.message || '支付确认失败')
  } finally {
    confirmPaymentLoading.value = null
  }
}

// 取消订单：调用后端接口将过期时间设为当前时间
async function cancelOrder() {
  if (!orderInfo.value?.id) return
  cancelOrderLoading.value = true
  try {
    await backendFetch(`/api/user/manage/member/paymentOrders/${orderInfo.value.id}`, {
      method: 'PUT',
      body: { expireTime: toLocalTimeString(), status: 2 }
    })
    // 刷新待支付订单列表
    fetchPendingOrders()
    closePayment()
    ElMessage.success('订单已取消')
  } catch (err) {
    ElMessage.error(err.message || '取消订单失败')
  } finally {
    cancelOrderLoading.value = null
  }
}

function goPay() {
  if (payExpired.value) return
  if (orderInfo.value?.payUrl) {
    window.open(orderInfo.value.payUrl, '_blank')
  } else {
    ElMessage.info('支付链接暂不可用，请稍后重试')
  }
}
</script>

<template>
  <div class="premium-view">
    <!-- 加载状态 -->
    <div v-if="loading" class="premium-loading">
      <div class="loading-spinner"></div>
      <p>加载套餐信息...</p>
    </div>

    <!-- 加载错误 -->
    <div v-else-if="loadError" class="premium-error">
      <p>{{ loadError }}</p>
      <button class="plan-btn btn-primary" @click="loading = true; loadError = ''; onMounted()">重试</button>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <!-- 顶部横幅 -->
      <div class="premium-hero">
        <!-- 会员到期提示 -->
        <div v-if="hasActiveMembership" class="membership-expiry-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>{{ myMembership?.planName }} · 到期时间 {{ formatExpiryDate(myMembership?.endDate) }}</span>
        </div>
        <div class="hero-badge" v-else-if="userLevel > 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          已是会员
        </div>
        <h1 class="hero-title">解锁 Auramix 的全部潜力</h1>
        <p class="hero-subtitle">选择适合你的会员方案，享受更强大的音乐管理体验</p>
      </div>

      <!-- 套餐卡片 -->
      <div class="plans-grid" :class="{ 'cols-3': plans.length >= 3 }">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="plan-card"
          :class="{
            recommended: isRecommended(plan) && selectedPlanId === null,
            'current-plan': isCurrentPlan(plan),
            selected: isSelected(plan) && !isCurrentPlan(plan)
          }"
          @click="selectPlan(plan)"
        >
          <!-- 标签 -->
          <div class="plan-badge" v-if="isCurrentPlan(plan)">{{ hasActiveMembership ? '当前会员方案' : '当前方案' }}</div>

          <!-- 卡片头部 -->
          <div class="plan-header">
            <h3 class="plan-name">{{ plan.name }}</h3>
            <p class="plan-desc" v-if="plan.description">{{ plan.description }}</p>
          </div>

          <!-- 价格区 -->
          <div class="plan-price-section">
            <div class="plan-price">
              <span class="price-symbol">¥</span>
              <span class="price-amount">{{ plan.price }}</span>
              <span class="price-period" v-if="plan.durationMonths > 0 && plan.durationMonths !== 12">/ {{ plan.durationMonths }} 个月</span>
              <span class="price-period" v-else-if="plan.durationMonths === 12">/ 年</span>
            </div>
            <div class="plan-original" v-if="plan.originalPrice > plan.price">
              <span class="original-price">¥{{ plan.originalPrice }}</span>
              <span class="discount-tag">省 {{ discountPercent(plan) }}%</span>
            </div>
          </div>

          <!-- 权益列表 -->
          <ul class="plan-features">
            <template v-for="(benefit, idx) in plan.benefits" :key="idx">
              <template v-if="benefit.status === 1">
                <!-- benefitType 0: 功能开关，有则打勾，无则划掉 -->
                <li v-if="benefit.benefitType === 0" class="feature-item">
                  <svg v-if="benefit.benefitValue == 1" class="feature-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <svg v-else class="feature-cross" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  <span :class="{ 'feature-disabled': benefit.benefitValue != 1 }">{{ benefit.benefitKey }}</span>
                </li>
                <!-- benefitType 1: 数值类 -->
                <li v-else-if="benefit.benefitType === 1" class="feature-item">
                  <svg class="feature-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{{ benefit.benefitKey }}: {{ benefit.benefitValue }}</span>
                </li>
                <!-- benefitType 2: 标识类 -->
                <li v-else-if="benefit.benefitType === 2" class="feature-item">
                  <svg class="feature-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{{ benefit.benefitKey }} {{ benefit.benefitValue }}</span>
                </li>
              </template>
            </template>
          </ul>

          <!-- 操作按钮 -->
          <button
            v-if="hasActiveMembership && isCurrentPlan(plan)"
            class="plan-btn btn-primary"
            :disabled="subscribeLoading === plan.id"
            @click="handleSubscribe(plan)"
          >
            <svg v-if="subscribeLoading === plan.id" class="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            {{ subscribeLoading === plan.id ? '处理中...' : '续费' }}
          </button>
          <button
            v-else-if="hasActiveMembership && !isCurrentPlan(plan)"
            class="plan-btn btn-current"
            disabled
          >不可购买</button>
          <button
            v-else-if="isCurrentPlan(plan)"
            class="plan-btn btn-current"
            disabled
          >当前方案</button>
          <button
            v-else-if="hasPendingOrder(plan.id)"
            class="plan-btn btn-primary"
            :disabled="subscribeLoading === plan.id"
            @click="payPendingOrder(plan.id)"
          >
            <svg v-if="subscribeLoading === plan.id" class="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            {{ subscribeLoading === plan.id ? '处理中...' : '去支付' }}
          </button>
          <button
            v-else
            class="plan-btn"
            :class="isSelected(plan) ? 'btn-primary' : 'btn-outline'"
            :disabled="subscribeLoading === plan.id"
            @click="handleSubscribe(plan)"
          >
            <svg v-if="subscribeLoading === plan.id" class="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            {{ subscribeLoading === plan.id ? '处理中...' : '购买' }}
          </button>
        </div>
      </div>

      <!-- 底部信任区 -->
      <div class="premium-footer">
        <div class="trust-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>安全支付 · 随时取消</span>
        </div>
        <div class="trust-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>7 天无理由退款</span>
        </div>
        <div class="trust-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>数据隐私保护</span>
        </div>
      </div>
    </template>

    <!-- 支付弹窗 -->
    <Teleport to="body">
      <div v-if="showPayment" class="payment-overlay" @click.self="closePayment">
        <div class="payment-modal">
          <button class="payment-close" @click="closePayment" title="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div class="payment-header">
            <svg class="payment-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <h2 class="payment-title">扫码支付</h2>
          </div>

          <!-- 二维码 -->
          <div class="payment-qrcode">
            <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="支付二维码" class="qrcode-image" />
            <div v-else class="qrcode-placeholder">
              <div class="loading-spinner"></div>
              <span>生成中...</span>
            </div>
          </div>
          <p class="qrcode-tip">请使用支付应用扫码支付</p>

          <!-- 支付方式切换 -->
          <div class="pay-type-switch">
            <label class="pay-type-option" :class="{ active: selectedPayType === 0 }">
              <input type="radio" v-model="selectedPayType" :value="0" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.69 3.44c-3.9.9-6.95 4.17-7.48 8.16-.6 4.5 2.1 8.7 6.35 10.04 3.34 1.04 6.83-.09 8.84-2.88.28-.39.83-.36 1.06.06l1.18 2.27c.3.6.98.77 1.52.4C23.64 19.53 24 16.07 24 12.3c0-6.62-5.79-11.9-12.89-11.27-1.38.12-2.68.43-3.89.88l.06.2c.38 1.26.7 2.56.73 3.89.03 1.2-.16 2.37-.49 3.5-.25.85-.61 1.65-1.06 2.38-.56.9-1.3 1.63-2.17 2.2a.62.62 0 0 1-.62-.04c-.45-.36-.38-1.05.11-1.3.9-.48 1.62-1.18 2.15-2.03.54-.86.88-1.82 1.03-2.84.19-1.3.13-2.63-.17-3.9-.2-.84-.5-1.65-.88-2.4z"/>
              </svg>
              <span>微信支付</span>
            </label>
            <label class="pay-type-option" :class="{ active: selectedPayType === 1 }">
              <input type="radio" v-model="selectedPayType" :value="1" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v5h-2zm0 7h2v2h-2z"/>
              </svg>
              <span>支付宝</span>
            </label>
          </div>

          <!-- 订单信息 -->
          <div class="payment-body">
            <div class="payment-row">
              <span class="payment-label">订单编号</span>
              <span class="payment-value order-no">{{ orderInfo?.orderNo }}</span>
            </div>
            <div class="payment-row">
              <span class="payment-label">支付金额</span>
              <span class="payment-value price">
                {{ orderInfo?.currency === 'CNY' ? '¥' : '' }}{{ orderInfo?.amount }}
              </span>
            </div>
            <div class="payment-row">
              <span class="payment-label">剩余时间</span>
              <span class="payment-value countdown" :class="{ expired: payExpired }">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ payExpired ? '已过期' : payCountdown }}
              </span>
            </div>
          </div>

          <div class="payment-footer">
            <button
              class="plan-btn btn-primary payment-btn"
              :disabled="confirmPaymentLoading"
              @click="confirmPayment"
            >
              {{ confirmPaymentLoading ? '处理中...' : '确认支付' }}
            </button>
            <div class="payment-actions">
              <button class="plan-btn btn-outline payment-btn" @click="closePayment">
                取消支付
              </button>
              <button
                class="plan-btn btn-outline payment-btn"
                :disabled="cancelOrderLoading"
                @click="cancelOrder"
              >
                {{ cancelOrderLoading ? '取消中...' : '取消订单' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
