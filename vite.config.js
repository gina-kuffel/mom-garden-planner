import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, Vite doesn't know about the api/ serverless functions.
// This plugin runs them inline so /api/image-proxy works locally.
function apiPlugin() {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/image-proxy', async (req, res) => {
        const url = new URL(req.url, 'http://localhost').searchParams.get('url')
        if (!url) { res.statusCode = 400; res.end('Missing url'); return }
        const allowed = ['upload.wikimedia.org', 'commons.wikimedia.org']
        let parsed
        try { parsed = new URL(url) } catch { res.statusCode = 400; res.end('Invalid url'); return }
        if (!allowed.some(d => parsed.hostname === d)) { res.statusCode = 403; res.end('Forbidden'); return }
        try {
          const upstream = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; GardenPlanner/1.0)',
              'Referer': 'https://en.wikipedia.org/',
              'Accept': 'image/webp,image/png,image/jpeg,image/*',
            }
          })
          const ct = upstream.headers.get('content-type') || 'image/jpeg'
          const buf = await upstream.arrayBuffer()
          res.setHeader('Content-Type', ct)
          res.setHeader('Cache-Control', 'public, max-age=86400')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.statusCode = upstream.status
          res.end(Buffer.from(buf))
        } catch (e) {
          res.statusCode = 500; res.end(e.message)
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
})
