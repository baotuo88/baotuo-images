import { CONFIG } from "./_config";
import { jsonResponse, errorResponse, normalize } from "./_helpers";


export async function onRequest({ request }: { request: Request }) {
const { searchParams } = new URL(request.url);
const cid = searchParams.get("cid");
const count = Math.min(Math.max(parseInt(searchParams.get("count") || "10") || 10, 1), 50);


try {
let all: any[] = [];
if (cid) {
const params = new URLSearchParams({ c: "WallPaper", a: "getAppsByCategory", cid, start: "0", count: "100", from: "360chrome" });
const url = `${CONFIG.API_BASE}?${params.toString()}`;
const resp = await fetch(url);
const json: any = await resp.json();
all = json.data || [];
} else {
const requests = CONFIG.HOT_CATEGORIES.map(async (catId) => {
const params = new URLSearchParams({ c: "WallPaper", a: "getAppsByCategory", cid: String(catId), start: "0", count: "20", from: "360chrome" });
const url = `${CONFIG.API_BASE}?${params.toString()}`;
try {
const resp = await fetch(url);
const json: any = await resp.json();
return json.data || [];
} catch {
return [];
}
});
const results = await Promise.all(requests);
all = results.flat();
}


if (all.length === 0) throw new Error("暂无可用壁纸");


const unique = Array.from(new Map(all.map((i) => [i.id, i])).values());
// shuffle
for (let i = unique.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[unique[i], unique[j]] = [unique[j], unique[i]];
}
const selected = unique.slice(0, Math.min(count, unique.length));
const data = selected.map(normalize);


return jsonResponse({ errno: 0, errmsg: "成功", meta: { count: data.length, pool_size: unique.length, cid: cid || null }, data });
} catch (err: any) {
return errorResponse("获取随机壁纸失败", 500, err.message);
}
}