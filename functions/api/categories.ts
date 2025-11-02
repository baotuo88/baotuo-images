import { CONFIG } from "./_config";
import { jsonResponse, errorResponse } from "./_helpers";

export async function onRequest() {
  try {
    const resp = await fetch(CONFIG.CATEGORY_API);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    let result: any;
    try { result = JSON.parse(text); } catch (e: any) { throw new Error(`JSON 解析失败: ${e.message}`); }

    if (!result || (!result.data && !Array.isArray(result))) throw new Error("返回数据格式错误");

    const categories = (result.data || result).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      count: cat.count || 0,
      order: cat.order_num || 0,
      is_hot: CONFIG.HOT_CATEGORIES.includes(parseInt(cat.id)),
    }));

    return jsonResponse({ errno: 0, errmsg: "成功", total: categories.length, data: categories });
  } catch (err: any) {
    return errorResponse("获取分类失败", 500, err.message);
  }
}
