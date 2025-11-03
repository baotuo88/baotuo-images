// 仅用于 A·Desk 手机壁纸接口
export const MOBILE_BASE = "https://service.picasso.adesk.com";

export function jres(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=600",
    },
  });
}

export function jerr(msg: string, status = 500, details?: unknown) {
  return jres(
    { errno: status, errmsg: msg, details: details ?? null, data: null },
    status
  );
}

// 统一 https，避免浏览器阻止混合内容
function toHttps(u?: string) {
  if (!u) return "";
  return u.replace(/^http:\/\//i, "https://");
}

/**
 * 将 A·Desk 返回的图片对象，映射为你项目通用的 Wallpaper 结构。
 * 关键策略：
 *  - 很多源的 img/preview/thumb 有外链防盗；wp(原图)通常可直链 → 直接用原图展示。
 *  - 所有 URL 强制 https。
 */
export function normalizeMobile(it: any) {
  // 常见字段：_id, img, thumb, preview, wp, res(或resolution)
  const fullRaw = it?.wp || it?.img || it?.preview || it?.thumb || "";
  const full = toHttps(fullRaw);

  // 为了避免中图/缩略图外链被拦截，展示也直接使用原图
  const mid = full;
  const thumb = toHttps(it?.thumb || it?.preview || full);

  // 分辨率可能缺失；保底为空字符串
  const resolution = it?.res || it?.resolution || "";

  return {
    id: String(it?.id || it?._id || it?.hash || Math.random().toString(36).slice(2)),
    class_id: it?.category || it?.cid || "", // 可选
    resolution,
    tag: it?.tag || "",
    utag: it?.tag || it?.cate || it?.category_name || "",
    url: full,          // 原图直链（不经过 /img/ 代理）
    url_thumb: thumb,   // 备用
    url_mid: mid,       // 与原图一致，保证能显示
    create_time: it?.atime || it?.utime || "",

    // 兼容前端现有的额外字段（不会用到也无妨）
    img_1024_768: "",
    img_1280_800: "",
    img_1280_1024: "",
    img_1366_768: "",
    img_1440_900: "",
    img_1600_900: "",
    custom_urls: {},
  };
}
