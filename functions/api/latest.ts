import { CONFIG } from "./_config";
import { jsonResponse, errorResponse, normalize } from "./_helpers";


export async function onRequest({ request }: { request: Request }) {
const { searchParams } = new URL(request.url);
const start = Math.max(parseInt(searchParams.get("start") || "0") || 0, 0);
const count = Math.min(Math.max(parseInt(searchParams.get("count") || "20") || 20, 1), 100);
try {
const params = new URLSearchParams({ c: "WallPaper", a: "getAppsByOrder", order: "create_time", start: String(start), count: String(count), from: "360chrome" });
const url = `${CONFIG.API_BASE}?${params.toString()}`;
const resp = await fetch(url);
if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
const json: any = await resp.json();
if (!json.data || !Array.isArray(json.data)) throw new Error("返回数据格式错误");
const data = json.data.map(normalize);
return jsonResponse({ errno: 0, errmsg: "成功", meta: { total: json.total, start, count }, data });
} catch (err: any) {
return errorResponse("获取最新壁纸失败", 500, err.message);
}
}