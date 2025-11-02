import { useEffect, useMemo, useRef, useState } from "react";
const [loading, setLoading] = useState(false);
const [resolution, setResolution] = useState("1920x1080");
const sentinel = useRef<HTMLDivElement | null>(null);


useEffect(() => {
api.categories().then((res) => setCats(res.data || [])).catch(() => setCats([]));
}, []);


// 初次或切换分类时重置
useEffect(() => {
setItems([]); setPage(0);
}, [cid]);


// 加载数据
useEffect(() => {
let canceled = false;
async function load() {
setLoading(true);
try {
const start = page * 24;
const res = cid === null ? await api.latest(start, 24) : await api.byCid(cid, start, 24);
if (!canceled) setItems((prev) => [...prev, ...(res.data || [])]);
} finally {
if (!canceled) setLoading(false);
}
}
load();
return () => { canceled = true; };
}, [cid, page]);


// 无限滚动
useEffect(() => {
const el = sentinel.current;
if (!el) return;
const obs = new IntersectionObserver((entries) => {
entries.forEach((e) => {
if (e.isIntersecting) setPage((p) => p + 1);
});
}, { rootMargin: "1000px" });
obs.observe(el);
return () => obs.disconnect();
}, []);


const hot = useMemo(() => cats.filter((c) => c.is_hot), [cats]);


return (
<div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
<Header />
<Toolbar categories={hot} activeCid={cid} onChangeCid={setCid} resolution={resolution} setResolution={setResolution} />


<main className="mx-auto max-w-7xl px-4 py-6">
{items.length === 0 && loading && <div className="text-center text-white/70">加载中...</div>}
<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
{items.map((it) => (
<WallCard key={it.id} item={it} resolution={resolution} />
))}
</div>
<div ref={sentinel} className="h-10" />
{loading && <div className="text-center py-6 text-white/60">加载更多...</div>}
</main>
</div>
);
}