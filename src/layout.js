import { Platform } from 'react-native'

export const PHONE_WIDTH = 393
export const PHONE_HEIGHT = 852
export const PHONE_FRAME_BORDER = 8
export const MAX_WEB_SCALE = 1

export function getWebPhoneScale(width, height) {
  const widthScale = (width - 32) / PHONE_WIDTH
  const heightScale = (height - 16) / PHONE_HEIGHT
  return Math.min(MAX_WEB_SCALE, widthScale, heightScale)
}

export function getAppFrameWidth(width) {
  const framed = Platform.OS === 'web' && width > 600
  return framed ? PHONE_WIDTH - PHONE_FRAME_BORDER * 2 : width
}
