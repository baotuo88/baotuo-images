export default function Header() {
return (
<header className="sticky top-0 z-50 backdrop-blur bg-black/60 border-b border-white/10">
<div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
<div className="text-white text-xl font-semibold">宝拓壁纸站</div>
<div className="text-white/60 text-sm">随机 / 分类 / 原图下载 / 自定义分辨率</div>
</div>
</header>
);
}