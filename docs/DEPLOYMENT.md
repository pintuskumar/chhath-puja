# Deployment

The site is a **static export** (`next build` → `./out`). Any static host works; there is no server runtime.

## GitHub Pages (preconfigured)

`.github/workflows/ci.yml` builds a sub-path version (`NEXT_PUBLIC_BASE_PATH=/<repo>`) and deploys it with `actions/deploy-pages`.

One-time setup (repository admin):

1. **Settings → Pages → Build and deployment → Source: “GitHub Actions”.**
2. **Settings → Environments → `github-pages` → Deployment branches**: allow the branch you deploy from (by default only the default branch can deploy).
3. Re-run the **CI** workflow (or push). The site appears at `https://<owner>.github.io/<repo>/`.

## Vercel / Netlify / Cloudflare Pages

* Build command: `npm run build`
* Output directory: `out`
* Node: 20+ (22 recommended)
* Environment: `NEXT_PUBLIC_SITE_URL=https://your-domain` (used for canonical URLs, sitemap, Open Graph). Leave `NEXT_PUBLIC_BASE_PATH` empty when serving from the domain root.

## Any static server / S3 + CloudFront

```bash
NEXT_PUBLIC_SITE_URL=https://example.org npm run build
# upload ./out
```

Recommended headers:

| Path | Header |
|---|---|
| `/_next/static/*` | `Cache-Control: public, max-age=31536000, immutable` |
| `*.html` | `Cache-Control: public, max-age=0, must-revalidate` |
| all | `Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'` (fonts are self-hosted by `next/font`) |

`trailingSlash: true` is enabled, so every route is `/<route>/index.html` and works on hosts without rewrite rules.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://pintuskumar.github.io/chhath-puja` | Absolute URL for canonical, sitemap, robots |
| `NEXT_PUBLIC_BASE_PATH` | *(empty)* | Sub-path when not hosted at the domain root |

## Release checklist

1. `npm run check:content && npm run typecheck && npm run build`
2. CI green, including Lighthouse (a11y ≥ 90, SEO ≥ 90 asserted).
3. Walk through [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) on one Android phone and one desktop browser.
4. Confirm the year's dates against a local panchang and update `date2026` in `src/content/days.ts` (and the `dates-2026` source) for the next year.
