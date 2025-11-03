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
  const MOBILE_POOL_FETCH = 200; // 开启“手机壁纸”时一次性抓取量

  const [cats, setCats] = useState<any[]>([]);
  const [cid, setCid] = useState<number | null>(null);

  const [items, setItems] = useState<any[]>([]);  // 当前页展示的条目
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  const [mobileOnly, setMobileOnly] = useState(false); // 竖屏筛选（手机壁纸）
  const [mobilePool, setMobilePool] = useState<any[]>([]); // 手机壁纸模式下的本地池
  const [mobileTotalPages, setMobileTotalPages] = useState(0);

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

  // 切换分类或开关“手机壁纸” -> 回到第一页，并重算池
  useEffect(() => {
    setPage(0);
    setMobilePool([]);
    setMobileTotalPages(0);
  }, [cid, mobileOnly]);

  // 加载数据
  useEffect(() => {
    let canceled = false;

    async function loadNormal() {
      setLoading(true);
      try {
        const start = page * PAGE_SIZE;
        const res =
          cid === null
            ? await api.latest(start, PAGE_SIZE)
            : await api.byCid(cid, start, PAGE_SIZE);
        const data = res.data || [];
        setItems(data);
        setHasNext(data.length >= PAGE_SIZE);
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    async function loadMobilePoolAndSlice() {
      setLoading(true);
      try {
        // 只在第一次或切换分类/开关时拉取一次大池
        let pool = mobilePool;
        if (pool.length === 0) {
          const res =
            cid === null
              ? await api.latest(0, MOBILE_POOL_FETCH)
              : await api.byCid(cid, 0, MOBILE_POOL_FETCH);
          const raw = res.data || [];
          // 过滤竖屏（高>宽）
          pool = raw.filter((it: any) => {
            const p = parseRes(it.resolution);
            return p ? p.h > p.w : false;
          });
          setMobilePool(pool);
          setMobileTotalPages(Math.max(1, Math.ceil(pool.length / PAGE_SIZE)));
        }

        // 本地分页切片
        const start = page * PAGE_SIZE;
        const pageItems = pool.slice(start, start + PAGE_SIZE);
        setItems(pageItems);
        setHasNext(start + PAGE_SIZE < pool.length);
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    if (mobileOnly) {
      loadMobilePoolAndSlice();
    } else {
      loadNormal();
    }

    return () => {
      canceled = true;
    };
  }, [page, cid, mobileOnly]); // 依赖三者

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

  const currentPageDisplay = mobileOnly
    ? Math.min(page + 1, Math.max(1, mobileTotalPages))
    : page + 1;
  const totalPagesDisplay = mobileOnly ? Math.max(1, mobileTotalPages) : undefined;

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
          <span className="text-white/60 text-sm">
            第 {currentPageDisplay}
            {totalPagesDisplay ? ` / ${totalPagesDisplay}` : ""} 页
          </span>
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

        {/* 手机壁纸模式且没有数据时的提示 */}
        {mobileOnly && !loading && items.length === 0 && (
          <div className="text-center text-white/60 mt-4">
            这一页没有竖屏图片，试试切换分类或点击下一页～
          </div>
        )}
      </main>
    </div>
  );
}
