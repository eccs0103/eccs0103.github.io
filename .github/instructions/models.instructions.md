---
applyTo: "**/models/*.ts"
---

# Model Files

Every model follows a strict three-part structure per type:

## 1. Discriminator Interface

A flat registry mapping string literals to class types — used for polymorphic deserialization via `$type`:

```typescript
export interface GitHubPushActivityDiscriminator {
    "GitHubPushActivity": GitHubPushActivity;
}
```

Composite discriminators merge narrower ones:
```typescript
export interface GitHubActivityDiscriminator extends GitHubPushActivityDiscriminator, GitHubReleaseActivityDiscriminator, ... { }
```

## 2. Scheme Interface

Mirrors the raw JSON shape. Keys are snake_case matching the JSON source. Always extends its parent scheme and narrows `$type`:

```typescript
export interface GitHubPushActivityScheme extends GitHubActivityScheme {
    $type: keyof GitHubPushActivityDiscriminator;
    sha: string;
}
```

## 3. Model Class

Extends `Model` (from `adaptive-extender/core`). Uses `@Field` for each mapped property and `@Descendant(Deferred(...))` on base classes to register subtypes:

```typescript
export class GitHubPushActivity extends GitHubActivity {
    @Field(String, "sha")
    sha: string;

    constructor();
    constructor(platform: string, timestamp: Date, username: string, url: string, repository: string, sha: string);
    constructor(platform?: string, timestamp?: Date, username?: string, url?: string, repository?: string, sha?: string) {
        if (platform === undefined || timestamp === undefined || ...) {
            super();
            return;
        }
        super(platform, timestamp, username, url, repository);
        this.sha = sha;
    }
}
```

## Dual Constructor Pattern

Every model class has **exactly two overloads**:
1. **No-arg constructor** — for the serialization framework (`Model.import`)
2. **Full constructor** — for programmatic instantiation

The guard is always a single `=== undefined` check on every required parameter simultaneously. If any is `undefined`, call `super()` and return:

```typescript
constructor(a?: string, b?: Date) {
    if (a === undefined || b === undefined) {
        super();
        return;
    }
    super();
    this.a = a;
    this.b = b;
}
```

For `abstract` base classes, place the `new.target` guard **inside** the full constructor overload after `super()`.

## `@Field` Decorator

Maps JSON keys to class properties with type coercion. Use the `adaptive-extender` built-in coercers:
- `String` → string
- `Timestamp` → Date (from unix ms)
- `ArrayOf(X)` → X[]
- `Nullable(X)` → X | null
