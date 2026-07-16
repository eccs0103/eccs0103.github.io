# Moving hosting to Cloudflare Pages — full setup guide

This is a step-by-step walkthrough for someone who has **never used Cloudflare**. It covers every screen you'll see, what the numbers on the dashboard mean, and the exact values to type. Follow it top to bottom, in order. Nothing here costs money.

---

## 3. Build settings — exact values to enter

You'll see a form. Fill it in **exactly** like this:

| Field                      | Value                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Project name**           | `eccs0103-github-io` (or anything — this becomes part of your free `*.pages.dev` URL)                                    |
| **Production branch**      | `main`                                                                                                                   |
| **Framework preset**       | `None` (leave as-is or select "None" explicitly — do not pick "Vite" from the list, the project has a custom Vite setup) |
| **Build command**          | `npm run build`                                                                                                          |
| **Build output directory** | `dist`                                                                                                                   |
| **Root directory**         | `/` (leave default — the repo root)                                                                                      |

Click **"Environment variables (advanced)"** to expand it, and add one variable (belt-and-suspenders with the `.node-version` file already in the repo):

| Variable name  | Value |
| -------------- | ----- |
| `NODE_VERSION` | `24`  |

**Do not add any other environment variables here.** The build itself needs no API keys or secrets — those all belong to the separate GitHub Actions cron job, which you are not touching.

Click **"Save and Deploy"**.

---

> **Reality check:** Cloudflare's Git integration may create this project as a **"Workers (with static assets)"** deployment rather than classic "Pages", because it sees `wrangler` already listed as a devDependency in this repo (used for the separate Telegram media-proxy Worker). You'll know this happened if the build log shows `Worker Name: personal-webpage` and a final step `Executing user deploy command: npx wrangler deploy`. This is fine — it's Cloudflare's modern recommended path and works identically for a static site — but it means deployment is driven by a `wrangler.jsonc` config file, not by dashboard "Output directory" settings alone.
>
> This repo already includes a root **`wrangler.jsonc`** (created for you) that tells `wrangler deploy` to publish `./dist` as a plain static-assets site — no server-side Worker code, same as GitHub Pages. If your very first deploy attempt failed with an `npm error ERESOLVE ... wrangler@4.111.0 ... @cloudflare/workers-types` error, that was wrangler trying to *auto-generate* this same config via an interactive wizard before it existed, and that wizard's self-upgrade step conflicted with this repo's pinned dependency versions. Once `wrangler.jsonc` is committed and pushed, that wizard never runs and the error goes away — just push again (see step 6).

---

## 4. Watch the first build

You'll be taken to a build log screen — this is your first look at Cloudflare's UI for **watching a deployment happen live**. Here's what you're looking at:

- **Build log** (the scrolling text): this is literally the output of `npm install` then `npm run build` running on Cloudflare's machine. If something is wrong, the error will be here, in plain text — same as if you ran it locally.
- Expected duration: 1–3 minutes for this project.
- When it finishes, you'll see a green **"Success"** and a button like **"Visit site"** — this opens your new URL, something like `https://eccs0103-github-io.pages.dev`.

**Checklist — verify all of these on the new URL before doing anything else:**
- [ ] Home page loads (`/`)
- [ ] Feed page loads and shows activity cards (`/feed/`)
- [ ] A Telegram media item in the feed (photo/video/audio) actually loads — this proves the existing media-proxy Worker still works correctly with the new host
- [ ] `/shortcuts/vscode-quartz/` loads
- [ ] `/applications/209-birthdays/` loads

If any of these fail, **do not proceed to cutover (step 7)** — the old GitHub Pages site is still live and unaffected, so there's no rush and no risk.

---

## 5. Understanding the dashboard (metrics, deployments, rollback)

Once the project exists, its dashboard has a few tabs. Here's what each means in plain language:

- **Deployments tab**: a list of every build Cloudflare has run, newest first, each tied to a git commit. Every push to `main` — including the automated commits from your feed-collector cron — creates a new row here automatically.
  - Each deployment has a **"..." menu → "Rollback to this deployment"**. This instantly makes an *older* build live again without rebuilding — useful if a bad commit ever breaks the site; click rollback on the last good one and you're back online in seconds.
- **Build log**: click any deployment to see its full build output, same screen as step 4.
- **Custom domains tab**: where you'd attach your own domain name (optional, see step 8).
- **Settings tab**: where the build command / output directory / env vars from step 3 live if you ever need to change them.

### "Metrics" / Web Analytics
Cloudflare Pages doesn't auto-enable traffic analytics — you already have Google Analytics wired into the site (`analytics-service.ts`), so you don't strictly need Cloudflare's own analytics. If you want it anyway (it's free, privacy-friendly, no cookies, and separate from Google's):
1. On the project dashboard, look for **"Metrics"** or **"Analytics"** in the sidebar of that project.
2. Enable **"Web Analytics"** — it's a single toggle, no code changes needed for Pages projects (Cloudflare injects it automatically at the edge).
3. What you'll see there: **requests** (page loads), **page views**, **unique visitors**, and **bandwidth** — all free-tier, no limit on Pages.

### Free plan limits (so you know when "control" costs money)
- **Builds**: 500 per month, free. Your only trigger for new builds is (a) your own pushes and (b) the 30-min cron's commits — roughly 48/day max if every cron run finds new data, well under the limit even before accounting for many runs finding nothing new.
- **Bandwidth / requests**: unlimited and free for static Pages hosting.
- None of this requires a credit card unless you later opt into paid features (like Workers Paid, which this hybrid setup does not need).

---

## 6. Commit the two new files (if not already committed)

This repo now contains `resources/_headers` and `.node-version` (already created for you). Make sure they're committed and pushed to `main` — Cloudflare needs them present in the branch it builds from. If they're only sitting locally, commit and push as you normally would.

---

## 7. Cutover — turn off the old publisher (do this LAST, only after step 4's checklist is all green)

Right now **both** GitHub Pages and Cloudflare Pages are capable of publishing this site from the same repo — that's fine and safe (they don't conflict, they're just two unrelated deployments), but you don't want to keep paying attention to two systems forever.

To retire GitHub Pages:
1. Delete (or rename to disable) `.github/workflows/deploy.yml` in the repo. This is the workflow that built and pushed to GitHub Pages — with it gone, GitHub Pages stops updating (it will keep serving its last build until you also disable Pages itself, or forever if you leave it, but nothing will update it).
2. Optional cleanup: in the GitHub repo → **Settings → Pages**, set "Source" to "None" to fully turn off GitHub Pages hosting.
3. **Do not touch** `.github/workflows/update-feed.yml` — the cron job keeps running exactly as before; its commits now trigger Cloudflare builds instead of GitHub Pages builds, automatically, with zero changes needed on its end.

If anything goes wrong after cutover, the rollback is: restore `deploy.yml` from git history (`git revert` the deletion) and re-enable GitHub Pages in repo settings — the old system comes right back.

---

## 8. Optional: custom domain

You cannot keep the exact address `eccs0103.github.io` on Cloudflare (that domain is GitHub's). Your options:
- **Keep the free `*.pages.dev` address** — simplest, works immediately, no extra steps.
- **Attach a domain you own** (if you buy one, e.g. from Cloudflare Registrar or elsewhere):
  1. Project dashboard → **Custom domains** tab → **"Set up a custom domain"**.
  2. Enter the domain, follow the on-screen DNS instructions (if the domain's DNS is already on Cloudflare, it's one click; otherwise you add a CNAME record at your registrar).
  3. TLS certificate is issued automatically and free — no action needed.

This step is entirely optional and can be done anytime after cutover, with no risk to the working site.

---

## Summary — what you are NOT touching

To be explicit, since the whole point of this migration was "don't break anything":
- `update-feed.yml` (the 30-min scraper cron) — **unchanged**.
- All GitHub Actions secrets/variables for that job — **unchanged, stay in GitHub**.
- `environment/workers/telegram-media-proxy/` (the Cloudflare Worker already serving Telegram media) — **unchanged**, deployed the same way as always via `npm run deploy:media-proxy`.
- Your local `.env` file — **unchanged**, never leaves your machine, was never in git.
- Google Analytics — **unchanged**, host-agnostic.

Only the "who builds and serves the static files" question changes, from GitHub Pages to Cloudflare Pages.
