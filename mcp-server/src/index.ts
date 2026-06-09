/**
 * My-Quran MCP Server — stdio transport (for local/cli use)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools-registry.js";
import { SUPPORTED_LANGUAGES } from "./services/languages.js";

const server = new McpServer({ name: "my-quran", version: "0.4.0" });
registerAllTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`My-Quran v0.4.0 stdio — ${SUPPORTED_LANGUAGES.length} languages`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
