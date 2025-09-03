// utils/urlSafeJson.ts
// Utilitário para serialização e desserialização segura de JSON para URL

export function encodeUrlSafeJson(obj: any): string {
  return encodeURIComponent(JSON.stringify(obj));
}

export function decodeUrlSafeJson(str: string): any {
  return JSON.parse(decodeURIComponent(str));
}
