export default async function handler(req, res) {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'Missing url parameter' })

  const allowed = ['upload.wikimedia.org', 'commons.wikimedia.org']
  let parsed
  try { parsed = new URL(url) } catch { return res.status(400).json({ error: 'Invalid URL' }) }
  if (!allowed.some(domain => parsed.hostname === domain)) {
    return res.status(403).json({ error: 'Domain not allowed' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GardenPlanner/1.0)',
        'Referer': 'https://en.wikipedia.org/',
        'Accept': 'image/webp,image/png,image/jpeg,image/*',
      }
    })

    if (!response.ok) return res.status(response.status).json({ error: 'Upstream error' })

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(Buffer.from(buffer))
  } catch (err) {
    res.status(500).json({ error: 'Proxy fetch failed', detail: err.message })
  }
}
