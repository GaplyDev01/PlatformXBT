# System Patterns

## How the system is built
The BrowserTools MCP system is built with a three-tiered architecture:

1. **Chrome Extension**
   - Captures browser data: screenshots, console logs, network activity, DOM elements
   - Sends data to the Node Server via WebSocket connections
   - Allows user configuration for token/truncation limits and screenshot storage

2. **Node Server**
   - Functions as middleware between Chrome extension and MCP server
   - Processes requests from MCP server for data capture
   - Handles truncation of logs to respect token limits
   - Removes sensitive data like cookies and headers before sending to LLMs

3. **MCP Server**
   - Implements the Model Context Protocol (MCP)
   - Provides standardized tools for AI clients to interact with the browser
   - Connected to MCP clients like Cursor, Cline, Zed, or Claude Desktop

## Key technical decisions
- Use of WebSockets for real-time communication between components
- Local storage of all logs to ensure privacy (no data sent to third-party services)
- Integration with Lighthouse for web auditing capabilities
- Chrome extension implementation for capturing browser state

## Architecture patterns
- Client-Server pattern for extension to node server communication
- Middleware pattern for the node server acting between extension and MCP server
- Protocol-based integration via Model Context Protocol
- Event-driven architecture for real-time browser monitoring
