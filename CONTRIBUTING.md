# Developer Standards & Architecture

## 1. File Structure Principles

The project follows a **Strict Separation of Concerns** between Code and Runtime Resources.

* **Root (`/`)**: Entry points (`index.html`, `feed/index.html`), TypeScript code, and styles.
* **`resources/`**: The **Mirror Directory**. Stores data (JSON) and assets used dynamically by JavaScript.
    * *Rule:* If code is in `feed/view/script.ts`, its data must be in `resources/feed/view/data.json`.
* **`assets/`**: Shared static assets (Logos, Fonts) referenced explicitly in HTML/CSS.
* **`dist/`**: Production build output (Never edit manually).

## 2. Path Strategies (Strict Rules)

### HTML & CSS (Static References)
Always use **Relative Paths**. This ensures compatibility with GitHub Pages and local development.
* ✅ Good: `<img src="./icon.png">`, `url('../assets/logo.png')`
* ❌ Bad: `<img src="/assets/logo.png">` (Absolute paths break on GitHub Pages)

### TypeScript (Dynamic References)
**Strict Rule:** Never import non-code files (JSON/Images). Never use `import.meta.url`.
Always use **Runtime URL Resolution** via `document.baseURI`.

```typescript
// Example: Fetching a JSON file located in resources/feed/data.json
// Context: Script is running on feed/index.html

// 1. Define path relative to the current page
const dataPath = "./data.json";

// 2. Resolve against the document base (works everywhere)
const url = new URL(dataPath, document.baseURI);

fetch(url.toString())...
```

## 3. Resource Management ("The Mirror Pattern")

Since we do not import assets in TS, Vite will not bundle them automatically from the source folder.
**You must place dynamic assets in `resources/`.**

* **Scenario:** You need `config.json` for the Feed page.
* **Action:**
    1.  Place `config.json` in `resources/feed/config.json`.
    2.  Access it in TS via `new URL("./config.json", document.baseURI)`.
* **Result:** Vite copies `resources` to `dist`, maintaining the folder structure. The link remains valid.

## 4. Building New Pages (MPA)

This project uses **Vite in MPA mode**. Every new HTML entry point must be registered.

1.  Create the page: `my-folder/index.html`.
2.  Register in `vite.config.ts`:
    ```typescript
    rollupOptions: {
      input: {
        // ... existing
        myPage: resolve(__dirname, "my-folder/index.html"),
      }
    }
    ```

## 5. Coding Style (Strict ESM)
* **Modules:** Strict ESM (`import` / `export`). No `require`.
* **Types:** Type-Only imports allowed. No runtime dependencies on build tools.
* **Architecture:** SOLID, OOP. No "Magic" build variables.
