import type { Wallpaper } from "../types";

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
  return `/img/${url}`; // querystring 会被保留在前端路径上，后端会拼回去
}
const pick = (...xs: Array<string | undefined>) => xs.find(Boolean) || "";

export default function WallCard({ item }: { item: Wallpaper }) {
  const rawFull = pick(item.url, item.url_mid, item.url_thumb);
  const rawMid = pick(item.url_mid, item.url, item.url_thumb);

  const proxyFull = shouldProxy(rawFull);
  const proxyMid = shouldProxy(rawMid);

  // 展示优先：代理域 → 中图，其它域 → 原图
  const displayRaw = proxyMid || proxyFull ? rawMid : rawFull;

  const imgSrc =
    proxyMid || (proxyFull && displayRaw === rawFull)
      ? toProxyPath(displayRaw)
      : displayRaw;

  const fullHref = proxyFull ? toProxyPath(rawFull) : rawFull;

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const el = e.currentTarget;
    if (el.dataset.fallbackApplied === "1") return;
    el.dataset.fallbackApplied = "1";
    el.src = fullHref; // 兜底：直接切到原图
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
