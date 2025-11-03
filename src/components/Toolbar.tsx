type Props = {
  categories: { id: string | number; name: string; is_hot?: boolean }[];
  activeCid: string | number | null;
  onChangeCid: (cid: any) => void;
};

export default function Toolbar({ categories, activeCid, onChangeCid }: Props) {
  return (
    <div className="bg-black/60 border border-white/10 rounded-2xl p-3 mb-6">
      <div className="flex flex-wrap gap-2 items-center">
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
            {c.is_hot ? <span className="ml-1 text-xs text-yellow-300">★</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
