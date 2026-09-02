const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded)
  }

  // Fallback for environments without atob (older React Native runtimes).
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let output = ''
  let buffer = 0
  let bits = 0

  for (let i = 0; i < padded.length; i += 1) {
    const char = padded.charAt(i)
    const index = chars.indexOf(char)
    if (index === -1) {
      continue
    }
    buffer = (buffer << 6) | index
    bits += 6
    if (bits >= 8) {
      bits -= 8
      output += String.fromCharCode((buffer >> bits) & 0xff)
    }
  }

  return output
}

const getJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const [, payloadPart] = token.split('.')
    if (!payloadPart) {
      return null
    }
    const decoded = decodeURIComponent(
      decodeBase64Url(payloadPart)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
    return JSON.parse(decoded) as { exp?: number }
  } catch {
    return null
  }
}

export const isAccessTokenExpired = (token: string, bufferSeconds = 60): boolean => {
  const payload = getJwtPayload(token)
  if (!payload?.exp) {
    return false
  }
  const expiresAtMs = payload.exp * 1000
  return Date.now() >= expiresAtMs - bufferSeconds * 1000
}
