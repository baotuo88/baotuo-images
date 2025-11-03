// functions/img/[[path]].ts
import { CONFIG } from "../api/_config";

export async function onRequest({
  request,
  params,
}: {
  request: Request;
  params: { path?: string | string[] };
}) {
  try {
    const pathParam = params?.path;
    if (!pathParam) return new Response("无效的图片路径", { status: 400 });

    const imagePath = Array.isArray(pathParam) ? pathParam.join("/") : String(pathParam);
    const m = imagePath.match(/^([^/]+)\//);
    if (!m) return new Response("无效的图片路径", { status: 400 });

    const domain = m[1].toLowerCase();

    // 允许的域：360 原有 + adesk
    const EXTRA_ALLOWED = ["adesk.com"];
    const allowed =
      CONFIG.ALLOWED_HOSTS.some((h: string) => domain.endsWith(h)) ||
      EXTRA_ALLOWED.some((h) => domain.endsWith(h));
    if (!allowed) return new Response("不允许的图片来源", { status: 403 });

    const inUrl = new URL(request.url);
    const query = inUrl.search || "";

    const headers: HeadersInit = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };
    if (domain.endsWith("adesk.com")) {
      (headers as any).Referer = "https://service.picasso.adesk.com/";
      (headers as any).Origin = "https://service.picasso.adesk.com";
    }

    // 封装一次取图（支持 http/https）
    async function fetchOnce(scheme: "https" | "http") {
      const url = `${scheme}://${imagePath}${query}`;
      return fetch(url, { headers, redirect: "follow" });
    }

    // 先 HTTPS，若遇到 525/526/530 或 TLS 异常则回退到 HTTP
    let upstream: Response;
    try {
      upstream = await fetchOnce("https");
      if ([525, 526, 530].includes(upstream.status)) {
        // TLS 失败，降级到 http
        upstream = await fetchOnce("http");
      }
    } catch (e) {
      // 抛出异常也尝试 http
      upstream = await fetchOnce("http");
    }

    if (!upstream.ok) {
      return new Response(`图片获取失败: ${upstream.status}`, { status: 502 });
    }

    const ct = upstream.headers.get("Content-Type") || "";
    const isImage = ct.startsWith("image/") || ct === "" || ct === "application/octet-stream";
    if (!isImage) return new Response("不支持的资源类型", { status: 415 });

    const out = new Headers(upstream.headers);
    out.set("Access-Control-Allow-Origin", "*");
    out.set("Cache-Control", "public, max-age=86400");
    out.delete("Content-Security-Policy");
    out.delete("X-Frame-Options");
    out.delete("Set-Cookie");

    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (err: any) {
    return new Response("图片代理失败", { status: 502 });
  }
}
