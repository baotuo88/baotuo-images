import { useEffect, useMemo, useState } from "react";
import Toolbar from "../components/Toolbar";
import WallCard from "../components/WallCard";
import { api } from "../api";

export default function DesktopPage() {
  const PAGE_SIZE = 24;

  const [cats, setCats] = useState<any[]>([]);
  const [cid, setCid] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  // 加载 360 分类
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

  // 分类切换回第一页
  useEffect(() => {
    setPage(0);
  }, [cid]);

  // 拉数据
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
        const data = res.data || [];
        if (!canceled) {
          setItems(data);
          setHasNext(data.length >= PAGE_SIZE);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => {
      canceled = true;
    };
  }, [cid, page]);

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
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 text-white/60">随机 / 分类 / 原图下载</div>

      <Toolbar
        categories={hot}
        activeCid={cid}
        onChangeCid={setCid}
      />

      {loading && items.length === 0 && (
        <div className="text-center text-white/70 mt-6">加载中...</div>
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
  );
}
