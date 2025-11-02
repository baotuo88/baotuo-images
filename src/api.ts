async function get<T>(path: string): Promise<T> {
const resp = await fetch(path, { headers: { "Accept": "application/json" } });
if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
return resp.json();
}


export const api = {
categories: () => get<{ data: any[] }>("/api/categories"),
latest: (start = 0, count = 20) => get<{ data: any[] }>(`/api/latest?start=${start}&count=${count}`),
byCid: (cid: number, start = 0, count = 20) => get<{ data: any[] }>(`/api/wallpapers?cid=${cid}&start=${start}&count=${count}`),
random: (cid?: number, count = 12) => get<{ data: any[] }>(`/api/random${cid ? `?cid=${cid}` : ""}&count=${count}`),
};