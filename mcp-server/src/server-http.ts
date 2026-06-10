/**
 * My-Quran MCP Server — HTTP/SSE (Poke tunnel)
 * Start: node dist/server-http.js
 * Poke: npx poke tunnel http://localhost:3000/sse -n my-quran
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { registerAllTools } from "./tools-registry.js";

const ASSETS_DIR = join(import.meta.dirname || __dirname, "..", "..", "assets");

const MIME: Record<string, string> = {
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
};

const PORT = parseInt(process.env.PORT || "3000", 10);

// Map sessionId → transport
const transports = new Map<string, SSEServerTransport>();

function setCors(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  setCors(res);
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url || "/", `http://localhost:${PORT}`);

  // GET / or /sse — establish SSE connection
  if ((url.pathname === "/" || url.pathname === "/sse") && req.method === "GET") {
    const server = new McpServer({ name: "my-quran", version: "0.4.0" });
    registerAllTools(server);

    const transport = new SSEServerTransport("/messages", res);
    transports.set(transport.sessionId, transport);

    res.on("close", () => {
      transports.delete(transport.sessionId);
    });

    await server.connect(transport);
    return;
  }

  // POST /messages — receive MCP messages
  if (url.pathname === "/messages" && req.method === "POST") {
    const sessionId = url.searchParams.get("sessionId");
    if (!sessionId) {
      res.writeHead(400); res.end("Missing sessionId");
      return;
    }

    const transport = transports.get(sessionId);
    if (!transport) {
      res.writeHead(404); res.end("Session not found");
      return;
    }

    await transport.handlePostMessage(req, res);
    return;
  }

  // Health check
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", version: "0.4.0", tools: 22, sessions: transports.size }));
    return;
  }

  // Static assets
  if (url.pathname.startsWith("/assets/") || url.pathname === "/favicon.ico" || url.pathname.startsWith("/android-chrome") || url.pathname.startsWith("/apple-touch-icon") || url.pathname.startsWith("/favicon-")) {
    const file = url.pathname === "/favicon.ico" ? "/favicon.ico" : url.pathname;
    const filePath = join(ASSETS_DIR, file.replace("/assets/", ""));
    if (existsSync(filePath)) {
      const ext = filePath.slice(filePath.lastIndexOf("."));
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "public, max-age=86400" });
      res.end(readFileSync(filePath));
      return;
    }
  }

  // Home page
  if (url.pathname === "/home") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<html><head><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"></head><body style="font-family:Georgia,serif;padding:2rem"><h1>🕋 My-Quran v0.4.0</h1><p>22 tools · 35+ languages · global</p><p>SSE: <code>/sse</code> | Msg: <code>/messages?sessionId=...</code></p></body></html>`);
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

async function main() {
  const httpServer = createServer(handleRequest);
  httpServer.listen(PORT, () => {
    console.error(`My-Quran v0.4.0 HTTP → http://localhost:${PORT}/sse`);
  });
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
