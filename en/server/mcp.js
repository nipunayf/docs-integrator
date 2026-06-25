const http = require('node:http');
const path = require('node:path');

const host = process.env.MCP_HOST || '127.0.0.1';
const port = Number.parseInt(process.env.MCP_PORT || '3001', 10);
const baseUrl = process.env.MCP_BASE_URL || 'https://wso2.com';

async function main() {
  const { createNodeHandler } = await import('docusaurus-plugin-mcp-server/adapters');

  const handler = createNodeHandler({
    docsPath: path.resolve(__dirname, '../build/mcp/docs.json'),
    indexPath: path.resolve(__dirname, '../build/mcp/search-index.json'),
    name: 'wso2-integrator-docs',
    version: '1.0.0',
    baseUrl,
  });

  http.createServer((req, res) => {
    if (req.url && !req.url.startsWith('/mcp')) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found. Use /mcp for the MCP endpoint.' }));
      return;
    }

    handler(req, res);
  }).listen(port, host, () => {
    console.log(`MCP server listening on http://${host}:${port}/mcp`);
  });
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exitCode = 1;
});
