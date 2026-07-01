<script setup lang="ts">
import CastHeader from './components/CastHeader.vue'
import ParticleBg from './components/ParticleBg.vue'
</script>

<template>
  <div class="cast-layout">
    <ParticleBg />
    <CastHeader />

    <main class="cast-main">
      <slot />
    </main>

    <!-- 底部装饰条 -->
    <footer class="cast-footer">
      <span>© Auramix Data Center · v1.0</span>
      <span class="cast-footer__pulse">
        <span class="cast-footer__dot" />
        LIVE
      </span>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.cast-layout {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background:
    radial-gradient(ellipse at top, rgba(2, 132, 199, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at bottom, rgba(14, 116, 144, 0.12) 0%, transparent 50%),
    linear-gradient(180deg, #020617 0%, #050e2c 50%, #020617 100%);
  color: #e0f2fe;
  overflow-x: hidden;
}

.cast-main {
  position: relative;
  z-index: 1;
  padding: 24px 36px;
}

.cast-footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 36px;
  font-size: 12px;
  color: rgba(125, 211, 252, 0.5);
  letter-spacing: 2px;
  border-top: 1px solid rgba(56, 189, 248, 0.15);

  &__pulse {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
    animation: live 1.4s ease-in-out infinite;
  }
}

@keyframes live {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>