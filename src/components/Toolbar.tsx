type Props = {
  categories: { id: number; name: string; is_hot: boolean }[];
  activeCid: number | null;
  onChangeCid: (cid: number | null) => void;
  mobileOnly: boolean;
  setMobileOnly: (v: boolean) => void;
};

export default function Toolbar({
  categories,
  activeCid,
  onChangeCid,
  mobileOnly,
  setMobileOnly,
}: Props) {
  return (
    <div className="bg-black/60 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap gap-3 items-center">
        {/* 热门 */}
        <button
          className={`px-3 py-1.5 rounded-full text-sm border ${
            activeCid === null
              ? "bg-white text-black"
              : "text-white border-white/30 hover:bg-white/10"
          }`}
          onClick={() => onChangeCid(null)}
        >
          热门
        </button>

        {/* 分类按钮 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onChangeCid(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                activeCid === c.id
                  ? "bg-white text-black"
                  : "text-white border-white/30 hover:bg-white/10"
              }`}
            >
              {c.name}
              {c.is_hot && <span className="ml-1 text-xs text-yellow-300">★</span>}
            </button>
          ))}
        </div>

        {/* 手机壁纸开关（竖屏筛选） */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setMobileOnly(!mobileOnly)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              mobileOnly
                ? "bg-white text-black"
                : "text-white border-white/30 hover:bg-white/10"
            }`}
            title="仅显示竖屏（高>宽）的图片"
          >
            手机壁纸
          </button>
        </div>
      </div>
    </div>
  );
}
