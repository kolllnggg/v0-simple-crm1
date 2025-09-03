// utils/urlSafeJson.ts
import LZString from "lz-string"

// Utilitário para serialização e desserialização compactada e segura de JSON para URL

// Função recursiva para normalizar todos os campos de texto de um objeto
function normalizeStrings(obj: any): any {
  if (typeof obj === "string") {
    return obj.normalize("NFC");
  } else if (Array.isArray(obj)) {
    return obj.map(normalizeStrings);
  } else if (obj && typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = normalizeStrings(obj[key]);
    }
    return result;
  }
  return obj;
}

export function encodeUrlSafeJson(obj: any): string {
  const normalized = normalizeStrings(obj);
  return LZString.compressToEncodedURIComponent(JSON.stringify(normalized));
}

export function decodeUrlSafeJson(str: string): any {
  return JSON.parse(LZString.decompressFromEncodedURIComponent(str));
}
