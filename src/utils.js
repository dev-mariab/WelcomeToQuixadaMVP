import { Linking } from 'react-native'
import { API_BASE_URL } from './api'
import { images } from './data'

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

function resolveImageUrl(image) {
  if (/^\/uploads\//i.test(image)) return `${API_ORIGIN}${image}`
  const uploadMatch = /^https?:\/\/[^/]+(\/uploads\/.+)$/i.exec(image)
  if (uploadMatch) return `${API_ORIGIN}${uploadMatch[1]}`
  return image
}

export function imageSource(image) {
  if (!image) return undefined
  if (typeof image !== 'string') return image
  if (images[image]) return images[image]
  if (/^(https?:|data:|file:|content:|\/|\.)/i.test(image)) {
    return { uri: resolveImageUrl(image) }
  }
  return undefined
}

export async function openUrl(url) {
  try {
    await Linking.openURL(url)
  } catch (error) {
    // Ignore devices without support for the requested URL scheme.
  }
}

export function formatPrice(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value)
  try {
    return number.toLocaleString('pt-BR')
  } catch (error) {
    return String(number)
  }
}
