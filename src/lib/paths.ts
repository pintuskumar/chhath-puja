/** Base path for static hosting under a sub-path (e.g. GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pintuskumar.github.io/chhath-puja";

export const asset = (p: string) => `${BASE_PATH}${p}`;
