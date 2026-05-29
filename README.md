# Jason Links

A zero-dependency personal link hub. It is just static files, so it can run from disk and deploy for free on GitHub Pages or Cloudflare Pages.

## Run locally

No install or build step is required.

Open `index.html` directly in a browser, or run a small static server from this directory:

```sh
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

To open the local preview editor:

```text
http://localhost:8080/#edit
```

## Edit links

The published source of truth is `links.js`.

For a quick browser preview, open `index.html#edit`. The editor saves changes to `localStorage` only, then lets you copy a replacement `window.LINKS_CONFIG = ...` block back into `links.js`.

## Tracking

The page records click counts locally in the visitor's browser so the editor can confirm the click tracking works. Those local counts are not shared back to you.

For real free analytics, use one of these:

- Cloudflare Web Analytics: free privacy-first page analytics with a JavaScript snippet. Add your token to `analytics.cloudflareToken` in `links.js`.
- Plausible or Google Analytics: if you add their normal script tag, `app.js` will emit a `Link click` or `link_click` event when someone opens a link.

## Deploy

Recommended zero-cost options:

- GitHub Pages for a public repo.
- Cloudflare Pages for static hosting. Static asset requests are free on Cloudflare Pages' free plan.

No build step is required.
