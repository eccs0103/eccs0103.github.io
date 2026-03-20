# Workspace Instructions

## Project Overview

Personal GitHub Pages site built as a **Multi-Page Application (MPA)** using **Vite + TypeScript**.
Three distinct runtime layers:

| Layer                     | Path                                      | Runtime             |
| ------------------------- | ----------------------------------------- | ------------------- |
| Browser app / feed viewer | `feed/`, `applications/`                  | Browser             |
| Data walker / scraper     | `feed/controllers/activity-controller.ts` | Node.js (via `tsx`) |
| CDN proxy                 | `workers/telegram-media-proxy/`           | Cloudflare Workers  |

The entire project depends on the **`adaptive-extender`** library for:
- `Model` base class with `@Field` / `@Descendant` / `@Deferred` decorators (serialization + polymorphism)
- `Controller` lifecycle (`run()`, `catch()`, `static launch()`)
- Augmented globals: `Error.from`, `Timespan`, `Array.import`, `Nullable`, `Timestamp`, etc.

## Folder Conventions

Each app section (`feed/`, `applications/*/`) follows the same vertical slice:
- `models/` — data shapes and serialization contracts
- `services/` — business logic, walkers, bridges, data access
- `controllers/` — entry points (Node.js CLI or wiring)
- `view/` — DOM rendering

Shared infrastructure lives in `environment/` (Vite config, plugins, analytics).

## Core Architecture Patterns

### Runtime Context Declaration
Every `.ts` file begins with `"use strict"` followed by the runtime side-effect import as the very first import:
- `import "adaptive-extender/core"` — universal
- `import "adaptive-extender/web"` — browser only
- `import "adaptive-extender/node"` — Node.js only

### Bridge Pattern
I/O is abstracted behind a `Bridge` (abstract class or interface). Each context has its own concrete:
`ServerBridge` (uses `fs/promises`) vs `ClientBridge` (uses `fetch`, throws on write).

### Walker Pattern
Each data source has a walker that extends `ActivityWalker`. Walkers expose a single public method:
`async *crawl(since: Date): AsyncIterable<Activity>`. The `ActivityDispatcher` connects and orchestrates them.

### Strategy Pattern
DOM rendering is split across `ActivityRenderStrategy<T>` implementations, one per platform.
Each is registered by activity root class on the `ActivitiesRenderer`.

## Language

Always TypeScript. Never plain `.js` files (except generated output). No JSX.

## Agent Rules

Behavioral rules are defined in `.github/instructions/workflow.instructions.md` (`applyTo: "**"`).  
Key constraints (always enforced):
- **No git.** Never run any `git` or `gh` command.
- **Mandatory build verification.** After every change, `npm run build` must exit `0` with zero TypeScript errors.
- **Project scripts only.** Use only the npm scripts in `package.json` — never invoke `vite`, `tsc`, `tsx`, or `wrangler` directly.

## Skills

| Skill               | File                                            | Use when                                 |
| ------------------- | ----------------------------------------------- | ---------------------------------------- |
| Add activity source | `.github/prompts/add-activity-source.prompt.md` | Integrating a new platform into the feed |
