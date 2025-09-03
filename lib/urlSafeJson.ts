// utils/urlSafeJson.ts
import LZString from "lz-string"

// Utilitário para serialização e desserialização compactada e segura de JSON para URL
export function encodeUrlSafeJson(obj: any): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(obj));
}

export function decodeUrlSafeJson(str: string): any {
  return JSON.parse(LZString.decompressFromEncodedURIComponent(str));
}
