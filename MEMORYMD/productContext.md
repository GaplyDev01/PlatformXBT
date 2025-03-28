# Product Context

## Why this project exists
- We're setting up the BrowserTools MCP server from AgentDeskAI to enhance AI tools with browser interaction capabilities.
- This enables AI agents to monitor and interact with browsers, making them more aware of web content.

## What problems it solves
- Enables AI tools to capture and analyze browser data through a Chrome extension
- Provides browser monitoring and interaction capabilities to AI-powered applications
- Allows AI to capture screenshots, console logs, network activity, and analyze DOM elements
- Facilitates auditing web pages for accessibility, performance, SEO, and best practices

## How it should work
- The system consists of three components:
  1. Chrome Extension: Captures browser data (screenshots, logs, network activity, DOM)
  2. Node Server: Intermediary server facilitating communication between the Chrome extension and MCP server
  3. MCP Server: Provides standardized tools for AI clients to interact with the browser

- The workflow follows: MCP Client → MCP Server → Node Server → Chrome Extension
- All logs are stored locally and not sent to third-party services
