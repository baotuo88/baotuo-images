import { MOBILE_BASE, jres, jerr, normalizeMobile } from "./_helpers";

export async function onRequest({ request }: { request: Request }) {
  try {
    const sp = new URL(request.url).searchParams;
    const limit = Math.min(Math.max(parseInt(sp.get("count") || "24") || 24, 1), 100);
    const start = Math.max(parseInt(sp.get("start") || "0") || 0, 0);
    const order = sp.get("order") || "new";

    const url = `${MOBILE_BASE}/v1/vertical/vertical?limit=${limit}&skip=${start}&adult=false&first=${start}&order=${order}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const json: any = await resp.json();
    const arr = json?.res?.vertical || json?.vertical || [];
    const data = arr.map(normalizeMobile);

    return jres({ errno: 0, errmsg: "成功", start, count: limit, data });
  } catch (e: any) {
    return jerr("获取手机壁纸失败", 500, e?.message);
  }
}
