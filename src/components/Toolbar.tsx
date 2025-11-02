type Props = {
categories: { id: number; name: string; is_hot: boolean }[];
activeCid: number | null;
onChangeCid: (cid: number | null) => void;
resolution: string;
setResolution: (r: string) => void;
};


const PRESETS = [
"1920x1080",
"2560x1440",
"3840x2160",
"1366x768",
"1440x900",
];


export default function Toolbar({ categories, activeCid, onChangeCid, resolution, setResolution }: Props) {
return (
<div className="bg-black/60 border-b border-white/10">
<div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap gap-3 items-center">
<button className={`px-3 py-1.5 rounded-full text-sm border ${(activeCid===null)?'bg-white text-black':'text-white border-white/30 hover:bg-white/10'}`} onClick={()=>onChangeCid(null)}>热门</button>
<div className="flex gap-2 overflow-x-auto no-scrollbar">
{categories.map(c => (
<button key={c.id} onClick={()=>onChangeCid(c.id)}
className={`px-3 py-1.5 rounded-full text-sm border ${(activeCid===c.id)?'bg-white text-black':'text-white border-white/30 hover:bg-white/10'}`}>
{c.name}
{c.is_hot && <span className="ml-1 text-xs text-yellow-300">★</span>}
</button>
))}
</div>
<div className="ml-auto flex items-center gap-2">
<span className="text-white/60 text-sm">分辨率</span>
<select className="bg-black text-white border border-white/30 rounded-lg px-2 py-1 text-sm"
value={resolution} onChange={e=>setResolution(e.target.value)}>
{PRESETS.map(p=> <option key={p} value={p}>{p}</option>)}
</select>
</div>
</div>
</div>
);
}