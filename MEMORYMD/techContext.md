# Technical Context

## Technologies used
- **Node.js**: Used for both the Node Server and MCP Server
- **Chrome Extension**: Browser extension for capturing web data
- **WebSockets**: For real-time communication between components
- **Puppeteer**: For headless browser automation (used in auditing tools)
- **Lighthouse**: For running web audits (accessibility, performance, SEO, best practices)
- **Model Context Protocol (MCP)**: For standardized communication with AI clients

## Development setup
- Node.js environment required for running the server components
- Chrome browser for the extension
- MCP client (Cursor, Cline, Zed, or Claude Desktop) for interaction
- Configuration in cline_mcp_settings.json for the MCP server

## Technical constraints
- All components must be installed and running for the system to work:
  1. Chrome Extension must be installed in the browser
  2. Node Server must be running (`npx @agentdeskai/browser-tools-server@1.2.0`)
  3. MCP Server must be configured in the MCP client settings

- WebSocket connections require proper network connectivity
- Some features may require specific permissions in Chrome
- Local screenshot storage requires appropriate file system permissions
- The headless browser instance for audits remains active for 60 seconds after the last audit call
