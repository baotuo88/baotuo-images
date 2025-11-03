import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import WallCard from "./components/WallCard";
import { api, /* 保证在 src/api.ts 中已导出 */ mobileApi } from "./api";

export default function App() {
  const PAGE_SIZE = 24;

  // 分类（沿用 360 的热门分类按钮）
  const [cats, setCats] = useState<any[]>([]);
  const [cid, setCid] = useState<number | null>(null);

  // 列表与分页
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  // 手机壁纸模式（切换为 A·Desk 竖屏数据源）
  const [mobileOnly, setMobileOnly] = useState(false);

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

  // 切换分类或切换“手机壁纸”，回到第 1 页
  useEffect(() => {
    setPage(0);
  }, [cid, mobileOnly]);

  // 加载数据（根据 mobileOnly 切换数据源）
  useEffect(() => {
    let canceled = false;

    async function loadDesktop() {
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

    async function loadMobile() {
      setLoading(true);
      try {
        const start = page * PAGE_SIZE;
        // 如果未来加了“手机分类”，这里可切换为 mobileApi.byCid
        const res = await mobileApi.latest(start, PAGE_SIZE, "new");
        const data = res.data || [];
        if (!canceled) {
          setItems(data);
          setHasNext(data.length >= PAGE_SIZE);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    if (mobileOnly) {
      loadMobile();
    } else {
      loadDesktop();
    }

    return () => {
      canceled = true;
    };
  }, [page, cid, mobileOnly]);

  // 仅取热门分类显示（与之前一致）
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

  const currentPageDisplay = page + 1;

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
          <span className="text-white/60 text-sm">第 {currentPageDisplay} 页</span>
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

        {/* 手机壁纸模式无数据提示 */}
        {mobileOnly && !loading && items.length === 0 && (
          <div className="text-center text-white/60 mt-4">
            暂无手机壁纸，试试切换页面或稍后再来～
          </div>
        )}
      </main>
    </div>
  );
}
