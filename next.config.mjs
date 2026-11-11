/**
 * Static export: the whole site is pre-rendered HTML + JS chunks, so it can be
 * hosted on GitHub Pages, Netlify, Vercel, S3/CloudFront or any static server.
 * Set NEXT_PUBLIC_BASE_PATH when serving from a sub-path (e.g. "/chhath-puja").
 * @type {import('next').NextConfig}
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Absolute site URL for canonical links, sitemap and robots.
// Explicit NEXT_PUBLIC_SITE_URL wins; on Vercel fall back to the production domain.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelUrl ? `https://${vercelUrl}` : "https://pintuskumar.github.io/chhath-puja");

const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  transpilePackages: ["three"],
  env: { NEXT_PUBLIC_SITE_URL: siteUrl },
};

export default nextConfig;
