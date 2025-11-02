// functions/api/_helpers.ts
import { CONFIG } from "./_config";

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `public, max-age=${CONFIG.CACHE_TIME}`,
    },
  });
}

export function errorResponse(message: string, status = 500, details: unknown = null) {
  return jsonResponse({ errno: status, errmsg: message, details, data: null }, status);
}

export function toHttps(url?: string) {
  if (!url) return "";
  return url.replace(/^http:\/\//, "https://");
}

export function convertImageUrl(url: string, width: number, height: number, quality: number) {
  if (!url) return "";
  const httpsUrl = toHttps(url);
  if (httpsUrl.includes("/bdr/")) {
    return httpsUrl.replace(/\/bdr\/__\d+\//, `/bdm/${width}_${height}_${quality}/`);
  }
  return httpsUrl;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function toProxyPath(httpsUrl: string) {
  if (!httpsUrl) return "";
  const url = httpsUrl.replace(/^https?:\/\//, "");
  return `/img/${url}`;
}

export async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 12000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: c.signal });
  } finally {
    clearTimeout(t);
  }
}

export function normalize(item: any) {
  return {
    id: item.id,
    class_id: item.class_id,
    resolution: item.resolution,
    tag: item.tag || "",
    utag: item.utag || "",
    url: toHttps(item.url),
    url_thumb: toHttps(item.url_thumb),
    url_mid: toHttps(item.url_mid),
    create_time: item.create_time,
    img_1024_768: toHttps(item.img_1024_768),
    img_1280_800: toHttps(item.img_1280_800),
    img_1280_1024: toHttps(item.img_1280_1024),
    img_1366_768: toHttps(item.img_1366_768),
    img_1440_900: toHttps(item.img_1440_900),
    img_1600_900: toHttps(item.img_1600_900),
    custom_urls: {
      "1920x1080": convertImageUrl(item.url, 1920, 1080, 100),
      "2560x1440": convertImageUrl(item.url, 2560, 1440, 100),
      "3840x2160": convertImageUrl(item.url, 3840, 2160, 100),
    },
  };
}
