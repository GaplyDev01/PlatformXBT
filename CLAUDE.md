# Development Guidelines for Claude

## Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Preview: `npm run preview`

## Code Style Guidelines
- **TypeScript**: Use strict typing, avoid `any` types
- **Imports**: Group imports (React, third-party, local) with blank line separator
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: 
  - Components: PascalCase
  - Functions/variables: camelCase
  - Files: Component files match component name
- **Error Handling**: Use try/catch for async operations
- **Components**: Prefer functional components with hooks
- **State Management**: Use React context for global state
- **CSS**: Use Tailwind CSS utility classes

## Project Structure
- `/src`: Application source code
- `/public`: Static assets
- `/dist`: Build output (do not edit)