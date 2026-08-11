import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Vercel / Netlify kök dizinde yayınlar.
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssTarget: 'safari16',
    assetsInlineLimit: 2048,
    // Ağır 3B paketi ön yüklemeden çıkar. `modulepreload` yüksek öncelikli
    // indirir ve ilk saniyelerde fontlarla yarışır; oysa sahneye ancak
    // yükleme ekranı bittikten sonra ihtiyaç var.
    modulePreload: {
      resolveDependencies: (_url: string, deps: string[]) =>
        deps.filter((dep) => !dep.includes('three-')),
    },
    rollupOptions: {
      output: {
        // three + drei ayrı chunk: yükleme ekranı geçildikten sonra
        // arka planda indirilir, ilk boyamayı bloklamaz.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (/[\\/](three|@react-three)[\\/]/.test(id)) return 'three'
        },
      },
    },
  },
  server: {
    host: true,
  },
})
