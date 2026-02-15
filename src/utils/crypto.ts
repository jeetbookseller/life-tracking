const PBKDF2_ITERATIONS = 600_000
const SALT_LENGTH = 16
const IV_LENGTH = 12

export interface EncryptedData {
  ciphertext: string // base64
  iv: string // base64
  salt: string // base64
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}

export async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(
  data: string,
  key: CryptoKey,
): Promise<EncryptedData> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data),
  )

  // Extract the salt from the key (we need the caller to provide it separately)
  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv.buffer),
    salt: '', // salt is stored separately at auth level
  }
}

export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey,
): Promise<string> {
  const ciphertext = base64ToBuffer(encryptedData.ciphertext)
  const iv = base64ToBuffer(encryptedData.iv)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    ciphertext,
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

export async function encryptObject(
  obj: unknown,
  key: CryptoKey,
): Promise<EncryptedData> {
  const json = JSON.stringify(obj)
  return encrypt(json, key)
}

export async function decryptObject<T>(
  encryptedData: EncryptedData,
  key: CryptoKey,
): Promise<T> {
  const json = await decrypt(encryptedData, key)
  return JSON.parse(json) as T
}
