import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const aliasPath = (path: string) => resolve(__dirname, path)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),
  ],
  server: {
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': aliasPath('src')
    }
  },
})
