async function get<T>(path: string): Promise<T> {
  const resp = await fetch(path, { headers: { Accept: "application/json" } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

// 简单的 query 构造工具
function qs(obj: Record<string, any>) {
  const s = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") s.append(k, String(v));
  });
  const str = s.toString();
  return str ? `?${str}` : "";
}

export const api = {
  categories: () => get<{ data: any[] }>("/api/categories"),
  latest: (start = 0, count = 20) =>
    get<{ data: any[] }>(`/api/latest${qs({ start, count })}`),
  byCid: (cid: number, start = 0, count = 20) =>
    get<{ data: any[] }>(`/api/wallpapers${qs({ cid, start, count })}`),
  random: (cid?: number, count = 12) =>
    get<{ data: any[] }>(`/api/random${qs({ cid, count })}`), // ✅ 修复这里
};

// 手机数据源（A·Desk）
export const mobileApi = {
  categories: () => get<{ data: any[] }>("/mobile/categories"),
  latest: (start = 0, count = 24, order: "new" | "hot" = "new") =>
    get<{ data: any[] }>(`/mobile/latest${qs({ start, count, order })}`),
  byCid: (cid: string, start = 0, count = 24, order: "new" | "hot" = "new") =>
    get<{ data: any[] }>(
      `/mobile/byCategory${qs({ cid, start, count, order })}`
    ),
};