---
applyTo: "**"
---

# Agent Workflow Rules

These rules are hard constraints. They apply to every task, regardless of scope or complexity.

---

## Git Policy

**Never execute any git command.** This restriction has no exceptions.

Prohibited operations include but are not limited to:
- `git add`, `git commit`, `git push`, `git pull`, `git fetch`
- `git merge`, `git rebase`, `git reset`, `git stash`, `git cherry-pick`
- `git branch`, `git checkout`, `git switch`, `git tag`
- GitHub CLI (`gh`) or any tool that reads or mutates repository state
- Any other invocation of `git` or `gh` as a subprocess

Do not stage, commit, amend, force-push, or otherwise interact with the repository history or remote.

---

## Mandatory Post-Change Verification

After completing **any** code modification, you **must** verify that the project builds and runs correctly before declaring the task done. Non-zero exit codes or TypeScript errors are blockers — fix them first, then re-verify.

### Step 1 — Build (always required)

Run unconditionally after every change:

```
npm run build
```

Expected outcome: exits with code `0`, zero TypeScript diagnostics, zero Vite build errors.  
If the build fails, diagnose and fix all errors. Do not skip or defer.

### Step 2 — Runtime verification (conditional)

Run the appropriate script based on which layer was modified:

| Modified layer                                                             | Verification command                                                       |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `feed/`, `applications/`, `environment/` (browser-side)                    | `npm run dev` — start Vite dev server and confirm it starts without errors |
| `feed/controllers/activity-controller.ts` or any walker/service it imports | `npm run walk` — execute the Node.js data walker to end                    |
| `environment/workers/telegram-media-proxy/`                                | `npm run deploy:worker:telegram:dev` (in dev)                              |

---

## Allowed Run Commands

Only use the npm scripts defined in `package.json`. Never invoke `vite`, `tsc`, `tsx`, or `wrangler` directly as CLI binaries.

| Script                               | Runtime    | Purpose                                        |
| ------------------------------------ | ---------- | ---------------------------------------------- |
| `npm run dev`                        | Browser    | Vite HMR dev server                            |
| `npm run build`                      | Local / CI | Full production build + TypeScript type check  |
| `npm run preview`                    | Browser    | Serve the production build locally             |
| `npm run walk`                       | Node.js    | Activity data walker (scraper)                 |
| `npm run deploy:worker:telegram`     | Cloudflare | Deploy Telegram media proxy to production      |
| `npm run deploy:worker:telegram:dev` | Cloudflare | Deploy Telegram media proxy to development env |

---

## Code Modification Discipline

These rules are **project-specific** additions on top of the user-level general instructions:

- Do not add comments, docstrings, or type annotations to code you did not modify.
- Do not create new files unless they are strictly necessary. Prefer editing an existing file.
- Preserve all existing `#region` / `#endregion` folding markers and file structure.
- Never add `console.log` debugging statements to production code paths.
- `resources/data/` is production data — never modify any file inside it.
