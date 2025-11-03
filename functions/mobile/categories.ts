import { MOBILE_BASE, jres, jerr } from "./_helpers";

export async function onRequest() {
  try {
    const url = `${MOBILE_BASE}/v1/vertical/category`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json: any = await resp.json();

    const arr = json?.res?.category || json?.category || [];
    const data = arr.map((c: any) => ({
      id: String(c?.id || c?.cid || c?._id || ""),
      name: c?.name || c?.title || "分类",
      is_hot: !!c?.hot
    }));

    return jres({ errno: 0, errmsg: "成功", total: data.length, data });
  } catch (e: any) {
    return jerr("获取手机分类失败", 500, e?.message);
  }
}
