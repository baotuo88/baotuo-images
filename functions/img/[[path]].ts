// functions/img/[[path]].ts
import { CONFIG } from "../api/_config";

/**
 * 通用图片代理：
 * - 允许 360 源（来自 CONFIG.ALLOWED_HOSTS）
 * - 允许手机源 *.adesk.com，并自动补 Referer/Origin
 * - 保留 querystring，跟随重定向
 * - 统一 CORS & 缓存头
 */
export async function onRequest({
  request,
  params,
}: {
  request: Request;
  params: { path?: string | string[] };
}) {
  try {
    // 1) 解析 /img/<host>/<path...>?<query>
    const pathParam = params?.path;
    if (!pathParam) return new Response("无效的图片路径", { status: 400 });

    const imagePath = Array.isArray(pathParam) ? pathParam.join("/") : String(pathParam);
    const domainMatch = imagePath.match(/^([^/]+)\//);
    if (!domainMatch) return new Response("无效的图片路径", { status: 400 });

    const domain = domainMatch[1].toLowerCase();

    // 2) 白名单：360 + adesk
    const EXTRA_ALLOWED = ["adesk.com"];
    const allowed =
      CONFIG.ALLOWED_HOSTS.some((h: string) => domain.endsWith(h)) ||
      EXTRA_ALLOWED.some((h) => domain.endsWith(h));
    if (!allowed) return new Response("不允许的图片来源", { status: 403 });

    // 3) 还原目标 URL（强制 https + 保留原始 query）
    const inUrl = new URL(request.url);
    const target = `https://${imagePath}${inUrl.search || ""}`;

    // 4) 构造请求头
    const fwdHeaders: HeadersInit = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    // 5) A·Desk 需要 Referer/Origin
    if (domain.endsWith("adesk.com")) {
      (fwdHeaders as any).Referer = "https://service.picasso.adesk.com/";
      (fwdHeaders as any).Origin = "https://service.picasso.adesk.com";
    }

    // 6) 发起请求（跟随 30x）
    const upstream = await fetch(target, { headers: fwdHeaders, redirect: "follow" });
    if (!upstream.ok) {
      return new Response(`图片获取失败: ${upstream.status}`, { status: 502 });
    }

    // 7) 类型校验：部分源会返回 octet-stream，也放行
    const ct = upstream.headers.get("Content-Type") || "";
    const isImage = ct.startsWith("image/") || ct === "" || ct === "application/octet-stream";
    if (!isImage) return new Response("不支持的资源类型", { status: 415 });

    // 8) 透传响应体 + 统一头
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
