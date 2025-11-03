import type { Wallpaper } from "../types";

function toProxyPath(httpsUrl: string) {
  const url = httpsUrl.replace(/^https?:\/\//, "");
  return `/img/${url}`;
}

export default function WallCard({ item }: { item: Wallpaper }) {
  const display = item.url_mid || item.url; // 不再按分辨率切换
  const proxied = toProxyPath(display);
  const full = toProxyPath(item.url);

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <img
        src={proxied}
        alt={item.utag || "wallpaper"}
        className="w-full h-56 object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition" />
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <a
          className="px-3 py-1.5 rounded-full text-sm bg-white text-black"
          href={full}
          target="_blank"
          rel="noreferrer"
        >
          查看原图
        </a>
        <a
          className="px-3 py-1.5 rounded-full text-sm bg-black/60 text-white border border-white/20"
          href={full}
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
