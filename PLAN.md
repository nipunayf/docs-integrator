# PLAN: Expose MCP Server for WSO2 Integrator Docs

## Objective

Add `docusaurus-plugin-mcp-server` to the `en/` Docusaurus site so that internal developers
using Cursor, Claude Code, or any MCP-compatible client can run `docs_search` and `docs_fetch`
against the full WSO2 Integrator documentation corpus.

---

## Constraints

| Constraint | Status |
|---|---|
| Docusaurus version | 3.9.2 ✓ (plugin requires 3.x) |
| Node.js in CI | 20 ✓ (plugin requires >= 20) |
| Node.js locally | 22 ✓ |
| Deployment platform | **Custom / self-hosted** — no built-in handler; needs custom server |
| Scope | `en/` only (not `eip-patterns/`) |
| Content exclusions | None — index the full site |
| Existing plugins | `docusaurus-plugin-markdown-export` stays; MCP is additive |

---

## Steps

### 1. Install the package

```bash
cd en/
npm install docusaurus-plugin-mcp-server
```

Verify the installed version supports a custom Node.js runtime adapter (file-path mode),
since there is no Vercel/Netlify/Cloudflare handler for this deployment.

---

### 2. Configure the plugin in `en/docusaurus.config.ts`

```ts
plugins: [
  './src/plugins/connector-versions',
  './plugins/docusaurus-plugin-markdown-export',
  './src/plugins/expose-sidebars',
  [
    'docusaurus-plugin-mcp-server',
    {
      outputDir: 'mcp',
      server: {
        name: 'wso2-integrator-docs',
        version: '1.0.0',
      },
      // Tune after inspecting built HTML if default selectors miss content
      contentSelectors: ['article', 'main'],
      excludeSelectors: ['nav', 'header', 'footer', '.theme-doc-toc-mobile'],
    },
  ],
],
```

---

### 3. Run a build and inspect the artifact

```bash
npm run build
ls build/mcp/
```

Expected: an index file and page data under `build/mcp/`. Spot-check a few pages to confirm
content was captured correctly. If content is missing, revisit `contentSelectors`.

---

### 4. Write a custom MCP HTTP server

Because the site is self-hosted, there is no built-in handler. Create a minimal Node.js
HTTP server that loads the build artifact and serves the MCP protocol.

**File:** `en/server/mcp.js`

```js
// Uses the plugin's Node.js runtime adapter (file-path mode)
const { createNodeHandler } = require('docusaurus-plugin-mcp-server/runtime');
const http = require('http');
const path = require('path');

const dataDir = path.resolve(__dirname, '../build/mcp');

const handler = createNodeHandler({ dataDir });

http.createServer(handler).listen(3001, () => {
  console.log('MCP server listening on http://localhost:3001/mcp');
});
```

> **Note:** Verify the exact export name (`createNodeHandler`) from the installed package.
> Check `node_modules/docusaurus-plugin-mcp-server/` for the runtime entrypoint.

---

### 5. Test locally

1. Build the docs: `npm run build`
2. Start the MCP server: `node server/mcp.js`
3. Configure a local MCP client (Claude Code or Cursor) to point at `http://localhost:3001/mcp`
4. Run a test query via the client:
   - `docs_search` with a known term (e.g. "HTTP connector")
   - `docs_fetch` with a URL returned from the search

---

### 6. Document connection instructions

Add an entry to the project `README.md` or `AGENTS.md` so internal devs know how to connect:

```json
// .mcp.json or Claude Code settings
{
  "mcpServers": {
    "wso2-integrator-docs": {
      "url": "http://<host>:3001/mcp"
    }
  }
}
```

---

## Risks & Open Questions

| Risk | Mitigation |
|---|---|
| `createNodeHandler` may not exist | Check plugin's exported runtime API before coding the server |
| WSO2 layout diverges from default selectors | Inspect `build/mcp/` content after step 3; tune selectors if pages are empty |
| MCP server needs a persistent host | Decide where it runs in prod (same host as docs, or sidecar container) — out of scope for this plan |
| Plugin updates may break the build | Pin the dependency version in `package.json` |

---

## Out of Scope

- Hosting the MCP server in production (infra decision needed separately)
- Adding MCP to `eip-patterns/`
- Replacing `docusaurus-plugin-markdown-export`
- Auth/access control on the MCP endpoint
    