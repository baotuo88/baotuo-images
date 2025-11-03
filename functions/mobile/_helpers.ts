// 仅用于 A·Desk 手机壁纸接口
export const MOBILE_BASE = "https://service.picasso.adesk.com";

export function jres(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=600"
    }
  });
}

export function jerr(msg: string, status = 500, details?: unknown) {
  return jres({ errno: status, errmsg: msg, details: details ?? null, data: null }, status);
}

// 统一映射成你前端已有的 Wallpaper 结构里的关键字段
export function normalizeMobile(it: any) {
  // 常见字段：_id, img, thumb, preview, wp, res(或resolution)
  const full = it.wp || it.img || it.preview || it.thumb || "";
  const mid  = it.img || it.preview || it.thumb || full;
  const thumb = it.thumb || it.preview || mid;

  // 分辨率可能在 it.res / it.resolution / it.ratio 中没有；保底用空
  const resolution = it.res || it.resolution || "";

  return {
    id: String(it.id || it._id || it.hash || Math.random().toString(36).slice(2)),
    class_id: it.category || it.cid || "",         // 可选
    resolution,
    tag: it.tag || "",
    utag: it.tag || (it.cate || it.category_name || ""),
    url: full,           // 原图直链（不经过 /img/ 代理）
    url_thumb: thumb,
    url_mid: mid,
    create_time: it.atime || it.utime || "",
    // 兼容前端现有的额外字段（不会用到也无妨）
    img_1024_768: "",
    img_1280_800: "",
    img_1280_1024: "",
    img_1366_768: "",
    img_1440_900: "",
    img_1600_900: "",
    custom_urls: {}
  };
}
