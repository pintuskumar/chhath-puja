/**
 * Static export: the whole site is pre-rendered HTML + JS chunks, so it can be
 * hosted on GitHub Pages, Netlify, Vercel, S3/CloudFront or any static server.
 * Set NEXT_PUBLIC_BASE_PATH when serving from a sub-path (e.g. "/chhath-puja").
 * @type {import('next').NextConfig}
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  transpilePackages: ["three"],
};

export default nextConfig;
