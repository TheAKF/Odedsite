# ODEDSVR website (v2)

v2: legal pages rebuilt with the home page's own header, footer and stylesheet; readable text sizes (nothing under 12px) and 44px tap targets across the site. All links are relative, so every page also works when opened straight from the folder.

Static site, no build step. Upload the **contents** of this folder to the web root of `odedsvr.com`.

## Before going live
1. **Contact email**: `sahivrcontact@gmail.com` (footer, privacy, terms, accessibility).
2. **YouTube videos**: no API key needed. `/api/videos` is a small server function (`netlify/functions/videos.mjs`, or `functions/api/videos.js` on Cloudflare Pages) that reads the channel's public feed and returns the 10 latest uploads (Shorts excluded), cached 15 minutes. If the function is unavailable, the page falls back to `assets/data/videos.json`; refresh that snapshot with `node tools/update-videos.mjs` from the project folder.
3. **Domain**: canonical links, `og:image`, `sitemap.xml` and `robots.txt` all point to `https://odedsvr.com`. Change them if the domain is different.

## Hosting
- **Important:** Netlify's drag-and-drop page (app.netlify.com/drop) uploads static files only, so the video function would not run. Deploy from this folder with the CLI instead: `npx netlify-cli deploy --prod` (it reads `netlify.toml`), or connect a Git repository.
- `_headers` sets the security headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) and long caching for images and fonts. **Netlify** and **Cloudflare Pages** read it automatically. On another host, copy these headers into its config.
- `404.html` is picked up automatically by Netlify, Cloudflare Pages and GitHub Pages.
- Every page also carries a `<meta>` Content-Security-Policy, so the page still has a policy if the host ignores `_headers`.

## Structure
```
index.html              home page
privacy.html            privacy policy
terms.html              terms of use
accessibility.html      accessibility statement (Israeli IS 5568 / WCAG AA)
404.html                not-found page
og-image.jpg            1200x630 social share image
favicon*, icon-*, apple-touch-icon.png, site.webmanifest
robots.txt, sitemap.xml, _headers
assets/css/style.css    home page styles
assets/css/legal.css    legal pages + 404 layout (loaded after style.css)
assets/js/main.js       live Kick data, YouTube videos, menus, emote search
assets/js/pages.js      legal pages: mobile menu, table of contents, footer dolphin
assets/fonts/           Heebo + Outfit (self-hosted)
assets/img/             hero, mascot, badges, emotes
```

