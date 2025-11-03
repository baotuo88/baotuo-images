import type { Wallpaper } from "../types";

// 需要通过 /img 代理的域名（会在代理层自动补 Referer/Origin）
const PROXY_HOSTS = ["qhimg.com", "360img.cn", "360cdn.com", "adesk.com"];

function shouldProxy(raw: string) {
  try {
    const u = new URL(raw);
    return PROXY_HOSTS.some((h) => u.hostname.endsWith(h));
  } catch {
    return false;
  }
}
function toProxyPath(httpsUrl: string) {
  const url = (httpsUrl || "").replace(/^https?:\/\//, "");
  return `/img/${url}`;
}
const pick = (...xs: Array<string | undefined>) => xs.find(Boolean) || "";

/**
 * 展示策略：
 * - 360/adesk 等在 PROXY_HOSTS 里：走代理；展示优先中图，其次原图；下载/查看用原图
 * - 其他域名：直接用原图（不少源缩略/中图会防外链）
 * - 失败兜底：img onError 自动切换成原图（同样按域名决定是否走代理）
 */
export default function WallCard({ item }: { item: Wallpaper }) {
  const rawFull = pick(item.url, item.url_mid, item.url_thumb);
  const rawMid  = pick(item.url_mid, item.url, item.url_thumb);

  // 是否应走代理（按域名判断）
  const proxyFull = shouldProxy(rawFull);
  const proxyMid  = shouldProxy(rawMid);

  // 选择用于 <img> 的展示地址：
  //  - 需要代理：优先中图，其次原图
  //  - 不需要代理：优先原图，其次中图
  const displayRaw = proxyMid || proxyFull ? rawMid : rawFull;

  const imgSrc   = (proxyMid || (proxyFull && displayRaw === rawFull))
    ? toProxyPath(displayRaw)
    : displayRaw;

  // 查看/下载永远指向原图
  const fullHref = proxyFull ? toProxyPath(rawFull) : rawFull;

  // 失败兜底：加载失败时切换到原图（再失败就不再处理）
  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const el = e.currentTarget;
    if (el.dataset.fallbackApplied === "1") return;
    el.dataset.fallbackApplied = "1";
    el.src = fullHref;
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <img
        src={imgSrc}
        alt={item.utag || "wallpaper"}
        className="w-full h-56 object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={handleError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition" />
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <a
          className="px-3 py-1.5 rounded-full text-sm bg-white text-black"
          href={fullHref}
          target="_blank"
          rel="noreferrer"
        >
          查看原图
        </a>
        <a
          className="px-3 py-1.5 rounded-full text-sm bg-black/60 text-white border border-white/20"
          href={fullHref}
          download
        >
          下载
        </a>
        {item.resolution && (
          <span className="ml-auto text-white/70 text-xs">原始: {item.resolution}</span>
        )}
      </div>
    </div>
  );
}
