---
applyTo: "**/*.ts"
---

# TypeScript Code Style

## File Structure

Every `.ts` file must start with `"use strict"`, then the runtime context side-effect import as the **first** import, then library imports, then local imports:

```typescript
"use strict";

import "adaptive-extender/web"; // or /core, /node depending on runtime

import { Timespan } from "adaptive-extender/web";
import { type Bridge } from "../services/bridge.js";
```

Sections within a file are wrapped in `#region` / `#endregion` folding markers — one per exported class or logical group:

```typescript
//#region Activity collector
export class ActivityCollector { ... }
//#endregion
```

## Access Modifiers

- **Private state**: always ES private fields with `#` prefix — never TypeScript `private` keyword:
  ```typescript
  #roots: Set<TypeOf<Activity>> = new Set();
  #isSameGroup(current: Activity, next: Activity): boolean { ... }
  ```
- **Public members**: no annotation — default visibility assumed, never write `public`.

## Imports

- Type-only imports use `import { type X }` (required by `verbatimModuleSyntax`):
  ```typescript
  import { type Bridge } from "../services/bridge.js";
  import { type DataTable } from "../services/data-table.js";
  ```
- All local imports use `.js` extension even though source files are `.ts`.
- Named exports only — no default exports (except `vite.config.ts` and the Cloudflare Worker entry).

## Common Patterns

### Intentional unused parameters
Use `void expr` — not underscore prefix:
```typescript
async write(path: Readonly<URL>, content: string): Promise<void> {
    void path, content;
    throw new TypeError("Write operation is restricted in Web context");
}
```

### Typed constructor reference
```typescript
export type TypeOf<T> = abstract new (...args: any[]) => T;
```

### Immutable parameters
```typescript
constructor(gap: Readonly<Timespan>) { ... }
async read(path: Readonly<URL>): Promise<string | null> { ... }
```

### Optional config objects
```typescript
async render(..., options: Partial<RendererOptions> = {}): Promise<void> { ... }
```

### Unknown errors in catch blocks
```typescript
} catch (reason) {
    console.error(`Failed cause:\n${Error.from(reason)}`);
}
```

Use semantic exception types:
- `TypeError` — for contract violations / API misuse
- `ReferenceError` — for missing or null data
- `SyntaxError` — for malformed input

### Abstract class guard
`abstract` classes also enforce instantiation at runtime with `new.target`:
```typescript
constructor(platform?: string, timestamp?: Date) {
    ...
    if (new.target === Activity) throw new TypeError("Unable to create an instance of an abstract class");
    ...
}
```

### Switch indentation
`case` labels are at the same indentation level as `switch`:
```typescript
switch (refType) {
case "tag": yield new GitHubCreateTagActivity(...); break;
case "branch": yield new GitHubCreateBranchActivity(...); break;
default: throw new Error(`Invalid '${refType}' refType`);
}
```

## Async

- All I/O is `async/await`. No `.then()` chains or callbacks.
- Streaming data from walkers uses `async *` generators; consumed with `for await`.
- When running a generator walker in loops, errors are caught per-walker so other walkers continue.
