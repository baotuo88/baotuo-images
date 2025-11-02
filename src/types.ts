export type Category = { id: number; name: string; count: number; order: number; is_hot: boolean };
export type Wallpaper = {
id: number; class_id: number; resolution?: string; tag: string; utag: string;
url: string; url_thumb: string; url_mid: string; create_time?: string;
img_1024_768?: string; img_1280_800?: string; img_1280_1024?: string; img_1366_768?: string;
img_1440_900?: string; img_1600_900?: string;
custom_urls: Record<string, string>;
};