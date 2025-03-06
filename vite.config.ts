import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'


const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['navigation-svgrepo-com.svg'],
  manifest: {
    name: 'navigation',
    short_name: 'navigation',
    description: 'navigation',
    theme_color: '#ffffff',
    icons: [
      {
        src: 'navigation-svgrepo-com.svg',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'navigation-svgrepo-com.svg',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
}
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), VitePWA(pwaConfig), mkcert()],
    base: mode === "production" ? "/navigate-in-maplibre" : "/"
  }
})
