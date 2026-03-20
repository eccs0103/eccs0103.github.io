---
name: "Adding a New Activity Source"
description: "Step-by-step guide for adding a new activity source (platform integration) to the feed."
applyTo: "feed/**"
---

# Adding a New Activity Source

# Adding a New Activity Source

Use this skill when the user asks to integrate a new platform into the activity feed.

## Prerequisites

Before writing any code, read and understand:
- `feed/models/activity.ts` — base `Activity` model and existing discriminator hierarchy
- `feed/services/activity-walker.ts` — `ActivityWalker` abstract base class
- `feed/services/walkers-dispatcher.ts` — how walkers are registered
- `feed/view/activities-renderer.ts` — how render strategies are registered

---

## Step 1 — Define the Model

Create `feed/models/<platform>-event.ts`.

Follow the three-part structure from models.instructions.md:
1. **Discriminator interface** — maps `"PlatformActivity"` string literal to the class
2. **Scheme interface** — extends parent scheme, narrows `$type` to `keyof Discriminator`, adds raw JSON fields (snake_case)
3. **Model class** — extends `Activity` (or a platform sub-base), applies `@Field` for each property, implements the dual constructor pattern

Extend the composite `ActivityDiscriminator` in `feed/models/activity.ts` with the new discriminator.

---

## Step 2 — Implement the Walker

Create `feed/services/<platform>-walker.ts`.

```typescript
"use strict";

import "adaptive-extender/node";

import { ActivityWalker } from "./activity-walker.js";
import { type PlatformActivity } from "../models/<platform>-event.js";

export class PlatformWalker extends ActivityWalker {
    async *crawl(since: Date): AsyncIterable<PlatformActivity> {
        // fetch, paginate, yield activities
    }
}
```

Rules:
- One public method only: `async *crawl(since: Date): AsyncIterable<T>`
- All private helpers use `#` prefix
- Authentication credentials read from environment (never hardcoded)
- Early `return` when the platform returns no new data past `since`

---

## Step 3 — Register the Walker

In `feed/services/walkers-dispatcher.ts`, instantiate and register the new walker in the dispatcher constructor alongside existing walkers.

---

## Step 4 — Implement the Render Strategy

Create `feed/view/<platform>-render-strategy.ts`.

```typescript
"use strict";

import "adaptive-extender/web";

import { type ActivityRenderStrategy } from "./activities-renderer.js";
import { PlatformActivity } from "../models/<platform>-event.js";

export class PlatformRenderStrategy implements ActivityRenderStrategy<PlatformActivity> {
    render(itemContainer: HTMLElement, buffer: readonly PlatformActivity[]): void {
        // delegate to #render* private methods per subtype
    }
}
```

Rules:
- `buffer` is `readonly` — never mutate it
- Use `DOMBuilder` and `ActivityBuilder` helpers (see view.instructions.md)
- One `#render*` private method per activity subtype

---

## Step 5 — Register the Render Strategy

In `feed/view/activities-renderer.ts`, register the strategy by root class:

```typescript
this.registerStrategy(PlatformActivity, new PlatformRenderStrategy);
```

---

## Step 6 — Verify

Follow the mandatory verification steps from workflow.instructions.md:

```
npm run build
```

Then:

```
npm run walk
npm run dev
```

Confirm zero TypeScript errors, walker runs to completion, and cards render correctly in the browser.
