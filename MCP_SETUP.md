# Crescelo Model Context Protocol (MCP) Setup Guide

Connect **ChatGPT**, **Claude Desktop**, **Cursor**, **Windsurf**, and autonomous AI agents to your live **Crescelo** workspace through official Model Context Protocol (MCP) tools.

---

## 1. Quick Overview

- **Public MCP Endpoint:** `https://www.crescelo.com/api/mcp`
- **Supported Transports:** Streamable HTTP, Server-Sent Events (SSE)
- **Authentication:** Bearer Token (`Authorization: Bearer cres_mcp_<token>`)
- **Isolation:** Multi-tenant cryptographic workspace binding (never trusts model arguments)
- **Tools Count:** 13 verified production tools

---

## 2. Generating an MCP Token

1. Navigate to **Crescelo Dashboard → Channels & Integrations → ChatGPT & Claude (MCP)**.
2. Click **Generate New Token**.
3. Choose a name (e.g. `ChatGPT Assistant` or `Claude Desktop`).
4. Select the permitted permission scopes:
   - `knowledge:read` – RAG search over ingested documents, FAQs, and web pages.
   - `business:read` – Business hours, location, contact information, and overview.
   - `services:read` – Service catalog and pricing.
   - `bookings:read` – Live calendar availability and slot lookup.
   - `bookings:create` – Create new customer appointments (with two-step confirmation).
   - `bookings:modify` – Cancel or reschedule appointments (with two-step confirmation).
   - `leads:create` – CRM lead capture and intake.
   - `products:read` – WooCommerce store catalog and stock checks.
   - `analytics:read` – Conversion and appointment summaries.
5. Choose expiration period (30 days, 90 days, 1 year, or Never).
6. Click **Generate Token** and **copy the secret key immediately**. Plain text tokens are never stored in the database.

---

## 3. Client Configuration

### A. Claude Desktop

Add the Crescelo MCP server to your `claude_desktop_config.json`:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "crescelo": {
      "url": "https://www.crescelo.com/api/mcp",
      "headers": {
        "Authorization": "Bearer cres_mcp_YOUR_SECRET_TOKEN"
      }
    }
  }
}
```

Restart Claude Desktop. The hammer/tools icon will show Crescelo's 13 tools.

---

### B. ChatGPT (Custom GPTs / Actions)

1. Go to [ChatGPT Explore GPTs](https://chatgpt.com/gpts) and click **Create a GPT**.
2. Under **Configure**, scroll down to **Actions** and click **Create new action**.
3. Set **Authentication**:
   - Authentication Type: `API Key`
   - Auth Type: `Bearer`
   - API Key: `cres_mcp_YOUR_SECRET_TOKEN`
4. In the schema or MCP connector settings, provide the Crescelo MCP URL:
   ```text
   https://www.crescelo.com/api/mcp
   ```
5. Save and publish your Custom GPT.

---

### C. Cursor & Windsurf IDE

Add to your project's `.cursor/mcp.json` or global settings:

```json
{
  "mcpServers": {
    "crescelo-business": {
      "url": "https://www.crescelo.com/api/mcp",
      "transport": "streamable-http",
      "headers": {
        "Authorization": "Bearer cres_mcp_YOUR_SECRET_TOKEN"
      }
    }
  }
}
```

---

## 4. Two-Step Confirmation for Safe Actions

For write and modification tools (`create_booking`, `cancel_booking`), Crescelo enforces **Explicit Confirmation Safety**:
1. When the agent first calls `create_booking` or `cancel_booking` without `confirmed: true`, the tool returns:
   ```json
   {
     "status": "requires_confirmation",
     "requiresExplicitConfirmation": true,
     "message": "Confirmation required: Please confirm with Alice Customer before finalizing the appointment for Consultation on 2026-11-20 at 14:00."
   }
   ```
2. The AI assistant must present this to the user in chat.
3. Once the user approves ("Yes, please book that slot"), the assistant calls the tool with `confirmed: true` to finalize the booking and acquire the calendar mutex lock.

---

## 5. Verifying Connection via Curl

```bash
# Health check / manifest
curl -H "Authorization: Bearer cres_mcp_YOUR_TOKEN" https://www.crescelo.com/api/mcp

# List available tools
curl -X POST https://www.crescelo.com/api/mcp \
  -H "Authorization: Bearer cres_mcp_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```
