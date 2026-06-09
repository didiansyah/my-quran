#!/bin/bash
# My-Quran MCP Server — Poke Tunnel Starter
# Starts the MCP server and exposes it via npx poke tunnel

set -e

cd "$(dirname "$0")/../mcp-server"

echo "🔧 Building My-Quran MCP server..."
pnpm build

echo "🚀 Starting Poke tunnel on port 3000..."
npx poke tunnel --port 3000 -- node dist/index.js
