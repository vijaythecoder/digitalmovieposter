import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: {
      overlay: false,
      timeout: 1000
    },
    watch: {
      usePolling: true,
      interval: 100,
      binaryInterval: 300
    }
  }
})
