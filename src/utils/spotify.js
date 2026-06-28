const REDIRECT_URI = `${window.location.origin}/callback`
const SCOPES = 'playlist-read-public playlist-read-private'

function generateCodeVerifier(length = 128) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, b => chars[b % chars.length]).join('')
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function initiateLogin(clientId) {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  localStorage.setItem('sg_code_verifier', verifier)
  localStorage.setItem('sg_client_id', clientId)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
  })
  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function handleCallback(code) {
  const verifier = localStorage.getItem('sg_code_verifier')
  const clientId = localStorage.getItem('sg_client_id')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(data.error_description || 'Auth failed')

  localStorage.setItem('sg_access_token', data.access_token)
  localStorage.setItem('sg_refresh_token', data.refresh_token)
  localStorage.setItem('sg_token_expiry', Date.now() + data.expires_in * 1000)
  localStorage.removeItem('sg_code_verifier')
  return data.access_token
}

async function refreshToken() {
  const refreshToken = localStorage.getItem('sg_refresh_token')
  const clientId = localStorage.getItem('sg_client_id')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Token refresh failed')

  localStorage.setItem('sg_access_token', data.access_token)
  localStorage.setItem('sg_token_expiry', Date.now() + data.expires_in * 1000)
  if (data.refresh_token) localStorage.setItem('sg_refresh_token', data.refresh_token)
  return data.access_token
}

export async function getValidToken() {
  const expiry = parseInt(localStorage.getItem('sg_token_expiry') || '0')
  if (Date.now() < expiry - 60_000) return localStorage.getItem('sg_access_token')
  return refreshToken()
}

export function isAuthenticated() {
  return !!(localStorage.getItem('sg_access_token') && localStorage.getItem('sg_refresh_token'))
}

export function getClientId() {
  return localStorage.getItem('sg_client_id') || ''
}

export function logout() {
  ['sg_access_token', 'sg_refresh_token', 'sg_token_expiry', 'sg_client_id'].forEach(k => localStorage.removeItem(k))
}

export function extractPlaylistId(input) {
  const match = input.match(/playlist\/([a-zA-Z0-9]+)/)
  return match ? match[1] : input.trim()
}

export async function fetchPlaylistInfo(playlistId) {
  const token = await getValidToken()
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,images`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Playlist not found (${res.status})`)
  return res.json()
}

export async function fetchPlaylistTracks(playlistId) {
  const token = await getValidToken()
  const tracks = []
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=next,items(track(id,name,preview_url,artists(name),album(images)))`

  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
    const data = await res.json()

    const valid = (data.items || [])
      .filter(item => item?.track?.preview_url)
      .map(item => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map(a => a.name).join(', '),
        previewUrl: item.track.preview_url,
        image: item.track.album.images[1]?.url || item.track.album.images[0]?.url || null,
      }))

    tracks.push(...valid)
    url = data.next || null
  }

  return tracks
}

export function searchTracks(query, tracks) {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return tracks
    .filter(t => t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q))
    .slice(0, 8)
}
