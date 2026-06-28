export const COUNTRIES = {
  es: 'España',
  us: 'EE.UU.',
  mx: 'Mexico',
  ar: 'Argentina',
  gb: 'Reino Unido',
  br: 'Brasil',
}

async function fetchCountry(country, limit = 100) {
  try {
    const rss = await fetch(
      `https://itunes.apple.com/${country}/rss/topsongs/limit=${limit}/json`
    )
    if (!rss.ok) return []
    const rssData = await rss.json()
    const entries = rssData?.feed?.entry || []

    const ids = entries
      .map(e => { const m = (e?.id?.label || '').match(/[?&]i=(\d+)/); return m ? m[1] : null })
      .filter(Boolean)
    if (!ids.length) return []

    const lookup = await fetch(
      `https://itunes.apple.com/lookup?id=${ids.join(',')}&entity=song`
    )
    if (!lookup.ok) return []
    const data = await lookup.json()

    return (data.results || [])
      .filter(r => r.wrapperType === 'track' && r.previewUrl)
      .map(r => ({
        id:         String(r.trackId),
        name:       r.trackName,
        artist:     r.artistName,
        previewUrl: r.previewUrl,
        image:      r.artworkUrl100?.replace('100x100', '300x300') || null,
      }))
  } catch {
    return []
  }
}

export async function fetchAllCountriesTracks(limit = 100) {
  const results = await Promise.all(
    Object.keys(COUNTRIES).map(c => fetchCountry(c, limit))
  )
  // Merge and deduplicate by track ID
  const seen = new Set()
  const merged = []
  for (const list of results) {
    for (const track of list) {
      if (!seen.has(track.id)) {
        seen.add(track.id)
        merged.push(track)
      }
    }
  }
  if (!merged.length) throw new Error('No se pudieron cargar canciones de ningún país')
  return merged
}

export function searchTracks(query, tracks) {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return tracks
    .filter(t => t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q))
    .slice(0, 8)
}
