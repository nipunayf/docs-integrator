- To host the docs site on localhost, run `npm install` once in `en`, then run `npm run start -- --host localhost` from `en` and open the localhost URL printed by Docusaurus.
- To run the local MCP server for the English docs, run `npm run build` in `en`, then `npm run mcp`. Configure MCP clients with `http://localhost:3001/mcp`:
  ```json
  {
    "mcpServers": {
      "wso2-integrator-docs": {
        "url": "http://localhost:3001/mcp"
      }
    }
  }
  ```
