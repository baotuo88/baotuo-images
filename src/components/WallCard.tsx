import type { Wallpaper } from "../types";

const ALLOWED = ["qhimg.com", "360img.cn", "360cdn.com"];

function shouldProxy(raw: string) {
  try {
    const u = new URL(raw);
    return ALLOWED.some((h) => u.hostname.endsWith(h));
  } catch {
    return false;
  }
}
function toProxyPath(httpsUrl: string) {
  const url = httpsUrl.replace(/^https?:\/\//, "");
  return `/img/${url}`;
}

export default function WallCard({ item }: { item: Wallpaper }) {
  const display = item.url_mid || item.url || item.url_thumb || "";
  const useProxy = shouldProxy(display);
  const imgSrc = useProxy ? toProxyPath(display) : display;

  const full = item.url || display;
  const fullHref = shouldProxy(full) ? toProxyPath(full) : full;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <img
        src={imgSrc}
        alt={item.utag || "wallpaper"}
        className="w-full h-56 object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
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
