// functions/img/[[path]].ts
import { CONFIG } from "../api/_config";

/**
 * 通用图片代理：
 * - 允许 360 源域（来自 CONFIG.ALLOWED_HOSTS）
 * - 允许 A·Desk 源域（*.adesk.com），并自动加 Referer/Origin
 * - 透传图片响应，补充 CORS/缓存头，去掉干扰安全头
 */
export async function onRequest({ params }: { params: { path?: string | string[] } }) {
  try {
    // 1) 解析路径：/img/<host>/<path...>
    const pathParam = params?.path;
    if (!pathParam) return new Response("无效的图片路径", { status: 400 });

    const imagePath = Array.isArray(pathParam) ? pathParam.join("/") : String(pathParam);
    const domainMatch = imagePath.match(/^([^/]+)\//);
    if (!domainMatch) return new Response("无效的图片路径", { status: 400 });

    const domain = domainMatch[1].toLowerCase();

    // 2) 白名单域：原有 360 + 追加手机源 adesk.com
    const EXTRA_ALLOWED = ["adesk.com"];
    const isAllowed =
      CONFIG.ALLOWED_HOSTS.some((h: string) => domain.endsWith(h)) ||
      EXTRA_ALLOWED.some((h) => domain.endsWith(h));

    if (!isAllowed) {
      return new Response("不允许的图片来源", { status: 403 });
    }

    // 3) 目标 URL（强制 https）
    const targetUrl = `https://${imagePath}`;

    // 4) 构造转发请求头
    const reqHeaders: HeadersInit = {
      // 某些 CDN 对 UA 敏感
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    };

    // ✅ 针对 A·Desk 源补齐 Referer/Origin，避免防盗链
    if (domain.endsWith("adesk.com")) {
      (reqHeaders as any)["Referer"] = "https://service.picasso.adesk.com/";
      (reqHeaders as any)["Origin"]  = "https://service.picasso.adesk.com";
    }

    // 5) 发起转发请求
    const upstream = await fetch(targetUrl, { headers: reqHeaders, redirect: "follow" });
    if (!upstream.ok) {
      return new Response(`图片获取失败: ${upstream.status}`, { status: 502 });
    }

    // 6) 类型校验（部分源返回 octet-stream 也允许透传）
    const ct = upstream.headers.get("Content-Type") || "";
    const isImage =
      ct.startsWith("image/") || ct === "" || ct === "application/octet-stream";
    if (!isImage) {
      return new Response("不支持的资源类型", { status: 415 });
    }

    // 7) 透传响应体，统一附加 CORS/缓存头，移除可能干扰的安全头
    const out = new Headers(upstream.headers);
    out.set("Access-Control-Allow-Origin", "*");
    out.set("Cache-Control", "public, max-age=86400");
    out.delete("Content-Security-Policy");
    out.delete("X-Frame-Options");
    out.delete("Set-Cookie");

    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (err: any) {
    console.error("图片代理失败:", err?.message || err);
    return new Response("图片代理失败", { status: 502 });
  }
}
