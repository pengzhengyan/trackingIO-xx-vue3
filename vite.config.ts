import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import {createSvgIconsPlugin } from 'vite-plugin-svg-icons'

const aliasPath = (path: string) => resolve(__dirname, path)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),
    createSvgIconsPlugin({
      // 图标文件的位置
      iconDirs:[resolve(process.cwd(), 'src/assets/icons')],
      // 声明symbolId的格式
      symbolId: 'icon-[dir]-[name]',
    }),
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
