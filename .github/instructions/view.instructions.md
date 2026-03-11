---
applyTo: "**/view/*.ts"
---

# View / Renderer Files

No framework — all DOM is built with vanilla TypeScript using the static factory helpers.

## DOMBuilder — Atomic Elements

Use `DOMBuilder` for all low-level DOM node creation:

```typescript
DOMBuilder.newText("Published ")
DOMBuilder.newLink("3 updates", new URL(`${url}/commit/${sha}`))
DOMBuilder.newLink(name, new URL(url), true)   // third arg = disabled (strikethrough)
DOMBuilder.newIcon(url)
DOMBuilder.newImage(url, altText)
DOMBuilder.print(container, `template ${expression}`)
```

Always `appendChild` the returned node to its `itemContainer` — do not mutate the node further.

## ActivityBuilder — Card Shell

Use `ActivityBuilder` for structural card assembly:

```typescript
ActivityBuilder.newContainer(parent, platforms, activity, observer)  // outer card
ActivityBuilder.newIntro(container, message)
ActivityBuilder.newOutro(container, child, message)
ActivityBuilder.newSentinel(container)
```

## Render Strategy Pattern

Each platform's renderer implements `ActivityRenderStrategy<T>`:

```typescript
export class GitHubRenderStrategy implements ActivityRenderStrategy<GitHubActivity> {
    render(itemContainer: HTMLElement, buffer: readonly GitHubActivity[]): void { ... }
}
```

- `buffer` is a `readonly` array — never mutate it.
- Private `#render*` methods handle individual activity subtypes, dispatched from `render()`.
- Strategies are registered on `ActivitiesRenderer` by root class:
  ```typescript
  this.registerStrategy(GitHubActivity, new GitHubRenderStrategy);
  ```

## Cooperative Rendering

Use `requestAnimationFrame` for deferred rendering loops — never block the main thread with synchronous iteration over large sets:

```typescript
if (hasMore) return requestAnimationFrame(this.#render.bind(this, context));
```

## CSS

Apply CSS classes through composition — utility-style, no inline styles:

```
.activity  .layer  .rounded  .with-padding  .with-gap  .awaiting-reveal
```

Use `IntersectionObserver` to trigger `.awaiting-reveal` → reveal transitions.
