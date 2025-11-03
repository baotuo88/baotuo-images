import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import WallCard from "./components/WallCard";
import { api } from "./api";

// 解析 "2560x1440" -> {w:2560,h:1440}
function parseRes(res?: string) {
  if (!res) return null;
  const m = res.match(/^(\d+)\s*x\s*(\d+)$/i);
  if (!m) return null;
  return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
}

export default function App() {
  const PAGE_SIZE = 24;

  const [cats, setCats] = useState<any[]>([]);
  const [cid, setCid] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mobileOnly, setMobileOnly] = useState(false); // 竖屏筛选

  // 分类
  useEffect(() => {
    let canceled = false;
    api
      .categories()
      .then((res) => !canceled && setCats(res.data || []))
      .catch(() => !canceled && setCats([]));
    return () => {
      canceled = true;
    };
  }, []);

  // 切换分类或开关竖屏 -> 回到第一页
  useEffect(() => {
    setPage(0);
  }, [cid, mobileOnly]);

  // 加载数据（分页+可选竖屏过滤）
  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      try {
        const start = page * PAGE_SIZE;
        const res =
          cid === null
            ? await api.latest(start, PAGE_SIZE)
            : await api.byCid(cid, start, PAGE_SIZE);

        let data = res.data || [];

        // 前端“手机壁纸”分类：仅展示竖屏（高>宽）
        if (mobileOnly) {
          data = data.filter((it: any) => {
            const p = parseRes(it.resolution);
            return p ? p.h > p.w : false;
          });
        }

        setItems(data);
        setHasNext((res.data || []).length >= PAGE_SIZE); // 判断是否还有下一页（以原始返回长度）
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => {
      canceled = true;
    };
    // 注意：依赖 page/cid/mobileOnly
  }, [page, cid, mobileOnly]);

  const hot = useMemo(() => cats.filter((c) => c.is_hot), [cats]);

  function prevPage() {
    setPage((p) => Math.max(0, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function nextPage() {
    if (!hasNext) return;
    setPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Header />

      <Toolbar
        categories={hot}
        activeCid={cid}
        onChangeCid={setCid}
        mobileOnly={mobileOnly}
        setMobileOnly={setMobileOnly}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {loading && items.length === 0 && (
          <div className="text-center text-white/70">加载中...</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <WallCard key={it.id} item={it} />
          ))}
        </div>

        {/* 分页器 */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={prevPage}
            disabled={page === 0 || loading}
            className={`px-4 py-2 rounded-full border ${
              page === 0 || loading
                ? "text-white/40 border-white/20 cursor-not-allowed"
                : "text-white border-white/30 hover:bg-white/10"
            }`}
          >
            上一页
          </button>
          <span className="text-white/60 text-sm">第 {page + 1} 页</span>
          <button
            onClick={nextPage}
            disabled={!hasNext || loading}
            className={`px-4 py-2 rounded-full border ${
              !hasNext || loading
                ? "text-white/40 border-white/20 cursor-not-allowed"
                : "text-white border-white/30 hover:bg-white/10"
            }`}
          >
            下一页
          </button>
        </div>
      </main>
    </div>
  );
}
