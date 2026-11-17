import Constants from 'expo-constants'
import { Platform } from 'react-native'

function resolveBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:4000/api`
  }
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri
  const host = hostUri ? String(hostUri).split(':')[0] : 'localhost'
  return `http://${host}:4000/api`
}

export const API_BASE_URL = resolveBaseUrl()

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 6000)
  const { timeoutMs, ...fetchOptions } = options
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(fetchOptions.headers || {}) },
      signal: controller.signal,
      ...fetchOptions,
    })
    if (!response.ok) {
      const message = await response.text().catch(() => '')
      throw new Error(message || `Erro ${response.status}`)
    }
    if (response.status === 204) return null
    return response.json()
  } finally {
    clearTimeout(timeout)
  }
}

const endpoints = {
  place: 'places',
  lodging: 'lodgings',
  restaurant: 'restaurants',
  event: 'events',
  guide: 'guides',
  trail: 'trails',
}

export const api = {
  bootstrap: () => request('/bootstrap'),
  registerUser: (user) =>
    request('/users/register', { method: 'POST', body: JSON.stringify(user) }),
  loginUser: (email, password) =>
    request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  uploadImage: ({ data, mimeType }) =>
    request('/uploads', {
      method: 'POST',
      body: JSON.stringify({ data, mimeType }),
      timeoutMs: 30000,
    }),
  translate: (text, source, target) =>
    request('/translate', {
      method: 'POST',
      body: JSON.stringify({ text, source, target }),
      timeoutMs: 12000,
    }),
  saveContent: (type, item, previousName) => {
    if (type === 'category') {
      return request('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: item.name, previousName }),
      })
    }
    return request(`/${endpoints[type]}`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  },
  deleteContent: (type, id) => {
    if (type === 'category') {
      return request(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
    }
    return request(`/${endpoints[type]}/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  getReviews: () => request('/reviews'),
  createReview: (review) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(review) }),
  getSupportMessages: () => request('/support-messages'),
  createSupportMessage: (message) =>
    request('/support-messages', { method: 'POST', body: JSON.stringify(message) }),
  getAccesses: () => request('/accesses'),
  createAccess: (access) =>
    request('/accesses', { method: 'POST', body: JSON.stringify(access) }),
  deleteAccess: (id) => request(`/accesses/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getFavorites: (email) => request(`/favorites?email=${encodeURIComponent(email)}`),
  addFavorite: (email, placeId) =>
    request('/favorites', { method: 'POST', body: JSON.stringify({ email, placeId }) }),
  removeFavorite: (email, placeId) =>
    request(`/favorites/${encodeURIComponent(placeId)}?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    }),
}
