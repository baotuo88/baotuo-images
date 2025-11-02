import { CONFIG } from "../api/_config";

export async function onRequest({ params }: any) {
  try {
    const rawPath = (params?.path ?? "") as string;
    if (!rawPath) return new Response("无效的图片路径", { status: 400 });

    const imagePath = String(rawPath);
    const domainMatch = imagePath.match(/^([^/]+)\//);
    if (!domainMatch) return new Response("无效的图片路径", { status: 400 });

    const domain = domainMatch[1];
    const allowed = CONFIG.ALLOWED_HOSTS.some((host) => domain.endsWith(host));
    if (!allowed) return new Response("不允许的图片来源", { status: 403 });

    const imageUrl = `https://${imagePath}`;
    const resp = await fetch(imageUrl);
    if (!resp.ok) throw new Error(`图片获取失败: ${resp.status}`);

    const ct = resp.headers.get("Content-Type") || "";
    if (!ct.startsWith("image/")) return new Response("不支持的资源类型", { status: 415 });

    const headers = new Headers(resp.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=86400");
    headers.delete("Content-Security-Policy");
    headers.delete("X-Frame-Options");
    headers.delete("Set-Cookie");

    return new Response(resp.body, { status: resp.status, headers });
  } catch {
    return new Response("图片代理失败", { status: 502 });
  }
}
