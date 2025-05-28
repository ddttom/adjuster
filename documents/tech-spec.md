# Project Specification

## Project Overview

A dual-interface Electron application that provides both a local desktop interface and a web-accessible interface. With shared state and functionality between both interfaces.

The initial implementation is a web page saying 'Hello world'

## Technical Specifications

### Core Technologies

- Electron (v28.0.0)
- Node.js (v18+)
- Modern JavaScript (ES2022+)
- HTML5/CSS3
- Jest (v29.0.0) for testing
- Supertest for integration testing

### Module System Implementation

#### Main Process (CommonJS with ES Module Interop)

- Use CommonJS require() for Electron-specific imports
- Use createRequire(import.meta.url) for CommonJS interop
- Import ES modules using dynamic import()
- Maintain CommonJS module.exports pattern
- Always use absolute paths with path.resolve()
- Handle module loading errors with try/catch blocks
- Implement proper application lifecycle management:
  - Quit application when all windows are closed (cross-platform)
  - Clean up resources before quitting
  - Handle window recreation on macOS when dock icon is clicked
- Manage web server lifecycle:
  - Start web server when application launches
  - Stop web server when application quits
  - Handle server errors gracefully

#### Renderer Process (Pure ES Modules)

- Use import/export syntax exclusively
- No CommonJS require() allowed
- Use dynamic import() for code splitting
- Follow strict ES module guidelines
- Use path.resolve() for all file paths
- Implement proper error handling for module loading
- CSS files must be linked via HTML link tags, never imported as JavaScript modules

  ```html
  <!-- Correct CSS usage -->
  <link rel="stylesheet" href="styles.css">
  ```

  ```javascript
  // Incorrect CSS usage (will cause MIME type errors)
  import './styles.css';
  ```

#### Preload Scripts (CommonJS with ES Module Interop)

- Use CommonJS require() for Electron APIs
- Use createRequire(import.meta.url) for CommonJS interop
- Maintain context isolation requirements
- Follow Electron security best practices
- Use absolute paths for all file references
- Implement error handling for IPC communication

#### Web Server (ES Modules)

- Use import/export syntax exclusively
- No CommonJS require() allowed
- Use ES module patterns for Express routes
- Maintain security headers and CORS configuration
- Use single-line strings for security headers
- Implement proper error handling for route handlers

#### Shared Services (ES Modules)

- Use import/export syntax exclusively
- No CommonJS require() allowed
- Follow strict ES module guidelines
- Maintain clear separation of concerns
- Use path.resolve() for all file paths
- Implement comprehensive error handling

### Path Resolution Guidelines

- Always use path.resolve() for absolute paths
- Use path.join() for constructing relative paths
- Never use string concatenation for paths
- Validate paths before using them
- Handle path resolution errors gracefully
- Use consistent path resolution patterns across the project

### Security Header Implementation

- Use single-line strings for security headers
- Validate header values before setting them
- Implement proper error handling for header operations
- Use Content Security Policy (CSP) headers
- Follow OWASP security header recommendations
- Test headers in development and production

### Interface Specifications

1. Desktop Interface:
   - Native Electron application
   - Window-based UI
   - Secure IPC communication
   - System integration capabilities

2. Web Interface:
   - HTTP server running on port 3000
   - Accessible at <http://0.0.0.0:3000>
   - External network accessibility
   - Responsive web design

## Architecture

### Process Architecture

- **Main Process** (CommonJS with ES Module Interop)
  - Application lifecycle management
  - Window creation and management
  - Web server implementation
  - System-level operations

- **Renderer Process** (ES Modules)
  - UI rendering and interaction
  - Client-side logic
  - Communication with main process via preload

- **Preload Scripts** (CommonJS with ES Module Interop)
  - Secure IPC bridge
  - API exposure to renderer
  - Context isolation enforcement

- **Web Server Process** (ES Modules)
  - Built-in HTTP server
  - Static file serving from renderer directory
  - Security headers implementation
  - CORS configuration

### Security Architecture

- Context isolation enabled
- Secure IPC communication channels
- Content Security Policy (CSP) headers
- Input validation on both interfaces
- CORS configuration for web API
- Strict path resolution

## Development Guidelines

### Code Organization

- ES Modules for renderer/services
- CommonJS with ES Module Interop for main/preload scripts
- Clear separation of concerns
- Modular architecture

### Style Guidelines

- Modern JavaScript (ES2022+)
- No TypeScript
- Pure CSS (no preprocessors)
  - CSS files must be linked via HTML link tags
  - Never import CSS files as JavaScript modules
- Consistent code formatting
- Comprehensive inline documentation

### Path Resolution

- Main process resolves paths relative to src/main/
- Use '../' to reference files in sibling directories
- Example paths:
  - '../renderer/index.html' from src/main/
  - '../preload/index.js' from src/main/

### Error Handling

- Comprehensive error handling in all processes
- Graceful degradation
- User-friendly error messages
- Logging system implementation

### Application Lifecycle

- Implement cross-platform window management:
  - Quit application when all windows are closed
  - Clean up resources (web server, database connections, etc.)
  - Handle macOS dock icon behavior
- Ensure proper resource cleanup:
  - Close all server connections
  - Release system resources
  - Save application state
- Handle application quit scenarios:
  - Normal quit
  - Force quit
  - System shutdown

## Security Requirements

### Core Security Features

- Proper context isolation
- Secure IPC communication
- CSP headers for web interface
- Input validation on both interfaces
- CORS configuration for web API
- Content Security Policy:

  ```text
  default-src 'self';
  style-src 'self' 'unsafe-inline';
  script-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self'
  ```

### Network Security

- External accessibility via 0.0.0.0
- Port 3000 for web interface
- Basic CORS configuration
- Rate limiting (future implementation)
- HTTPS support (future implementation)

## Project Structure

```bash
project/
├── src/
│   ├── main/           # Main process (CommonJS with ES Module Interop)
│   ├── renderer/       # Renderer process (ES Modules)
│   ├── preload/        # Preload scripts (CommonJS with ES Module Interop)
│   ├── services/       # Shared business logic (ES Modules)
│   ├── public/         # Static assets (favicon, etc.)
│   ├── tests/          # Test files
│   └── scripts/        # Build and utility scripts
├── docs/               # Documentation
│   └── development-notes/ # Development notes
├── ContentID/          # Project documentation
└── log.md              # Development log
```

## Required Features

### Core Features

- Local window interface
- Web-accessible interface
- Shared state management
- Bidirectional communication
- Resource management
- Error handling
- Logging system
- Security validations

### Interface Features

- Responsive design
- Favicon support
- Developer tools access control
- Window management
- Network accessibility

## Build Process

### Development

- Hot-reload support
- Debugging tools
- Development server

### Production

- Minimal bundling
- Production optimization
- Security hardening
- Performance tuning

### NPM Scripts

- `start`: Start both Electron and web server
- `web`: Start web server only
- `desktop`: Start Electron interface only
- `test`: Run tests using Jest
- `test:watch`: Run tests in watch mode
- `test:coverage`: Run tests with coverage report

## Delivery Requirements

1. Complete source code
2. Setup instructions
3. API documentation
4. Security guidelines
5. Development notes
6. Deployment documentation
7. Maintenance guide

## Development Notes Guidelines

Development notes should be maintained as Markdown files in the `docs/development-notes/` directory. Each note should follow this structure:

```markdown
# [Short Description]

## Date
[YYYY-MM-DD]

## Author
[Your Name]

## Context
- Background information
- Related issues or features
- Relevant technical decisions

## Changes Made
- Specific code changes
- Configuration updates
- Dependencies added/removed

## Impact Analysis
- Affected components
- Potential side effects
- Performance considerations

## Testing
- Test cases added
- Manual testing performed
- Automated test coverage

## Future Considerations
- Potential improvements
- Technical debt created
- Follow-up tasks
```

## Current Implementation Details

### Web Interface

- HTTP server running on port 3000
- Accessible at <http://0.0.0.0:3000>
- Static file serving from renderer directory
- Security headers implementation
- CORS configuration
- Proper content-length headers for static files

### Desktop Interface

- Electron main window
- Secure IPC communication
- Developer tools access control
- System integration

### Testing Implementation

- Jest test runner configured
- Simplified unit tests for main process
- Integration tests for web server
- Test coverage reporting
- Continuous integration ready
- Proper mocking of Electron APIs
- Focused test cases for core functionality

### Shared Components

- Favicon implementation in renderer directory
- Error handling system
- Logging mechanism
- Security validations

## Future Roadmap

- HTTPS implementation
- Authentication system
- Rate limiting
- Improved favicon design
- Expanded test coverage
- CI/CD pipeline implementation
- End-to-end testing
- Performance benchmarking
