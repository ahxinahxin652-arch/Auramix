/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // eslint-disable-next-line node/prefer-global/process
  const env = loadEnv(mode, process.cwd(), '')
  const stylesDir = fileURLToPath(new URL('./src/styles', import.meta.url))

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          loadPaths: [stylesDir],
          additionalData: (source: string) => {
            // variables.scss 自身不能再 @use "variables"（会 module loop）
            // 用内容签名检测（不依赖 filename，因为 modern-compiler 可能不传）
            if (source.includes('$primary-color:')) {
              return source
            }
            return `@use "variables" as *;\n${source}`
          },
        },
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      open: false,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'es2015',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1500,
    },
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['src/**/*.{test,spec}.ts'],
    },
  }
})
