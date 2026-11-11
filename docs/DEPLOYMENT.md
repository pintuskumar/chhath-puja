# Deployment

The site is a **static export** (`next build` → `./out`). Any static host works; there is no server runtime.

## GitHub Pages (optional)

The Pages deploy job only runs when the repository variable `DEPLOY_PAGES` is `true` (Settings → Secrets and variables → Actions → Variables). `.github/workflows/ci.yml` builds a sub-path version (`NEXT_PUBLIC_BASE_PATH=/<repo>`) and deploys it with `actions/deploy-pages`.

One-time setup (repository admin):

1. **Settings → Pages → Build and deployment → Source: “GitHub Actions”.**
2. **Settings → Environments → `github-pages` → Deployment branches**: allow the branch you deploy from (by default only the default branch can deploy).
3. Re-run the **CI** workflow (or push). The site appears at `https://<owner>.github.io/<repo>/`.

## Vercel (primary)

`vercel.json` is included. Steps:

1. vercel.com → **Add New… → Project** → import `pintuskumar/chhath-puja`.
2. Leave the detected settings as they are (`vercel.json` sets framework, install/build commands and the `out` directory). **Root Directory:** the repo root.
3. **Deploy.** Every push to any branch gets a preview URL; the production branch gets the production domain.

Notes:
* `NEXT_PUBLIC_SITE_URL` is optional. If it isn't set, the build uses Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`) for canonical URLs, sitemap and robots. Set it once you add a custom domain.
* Do **not** set `NEXT_PUBLIC_BASE_PATH` on Vercel.
* The build runs `check:content` first, so a missing translation fails the deploy.
* `vercel.json` adds long-term caching for `/_next/static/*` and security headers (CSP, nosniff, referrer policy, frame options).

## Netlify / Cloudflare Pages

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
