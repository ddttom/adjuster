# Image Adjuster

A dual-interface Electron desktop application for image viewing and editing that provides both a local desktop interface and a web-accessible interface with shared functionality.

## Features

- **Folder Selection**: Choose any folder containing images to start viewing
- **Recursive Scanning**: Automatically finds images in all subdirectories
- **Image Transformations**: 
  - Rotate left/right (90° increments)
  - Flip vertically
  - Real-time preview of changes
- **Navigation**: 
  - Previous/Next image navigation
  - Keyboard shortcuts (arrow keys)
  - Skip functionality to advance without saving
- **Auto-Save**: Automatically saves transformations when navigating to different images
- **Supported Formats**: JPG, JPEG, PNG, GIF, BMP, WEBP, TIFF
- **Dual Interface**: Both desktop Electron app and web interface
- **Error Handling**: Comprehensive error handling with user feedback

## Technical Specifications

- **Electron**: v28.0.0 for desktop application
- **Node.js**: v18+ required
- **Modern JavaScript**: ES2022+ with ES modules
- **No TypeScript**: Maintains simplicity and reduces build complexity
- **Pure CSS**: No preprocessors, clean and maintainable styles
- **Security**: Context isolation, CSP headers, secure IPC communication
- **Testing**: Jest with comprehensive test coverage

## Project Structure

```
image-adjuster/
├── src/
│   ├── main/           # Main process (Electron)
│   │   ├── index.js    # Application entry point
│   │   └── web-server.js # Web server implementation
│   ├── renderer/       # Renderer process (UI)
│   │   ├── index.html  # Main HTML file
│   │   ├── styles.css  # Application styles
│   │   └── app.js      # Frontend JavaScript
│   ├── preload/        # Preload scripts
│   │   └── index.js    # Secure IPC bridge
│   ├── services/       # Shared business logic
│   │   └── image-service.js # Image processing service
│   ├── public/         # Static assets
│   │   └── favicon.ico # Application icon
│   └── tests/          # Test files
│       ├── setup.js    # Test configuration
│       ├── image-service.test.js
│       └── web-server.test.js
├── documents/
│   └── tech-spec.md    # Technical specifications
├── package.json        # Dependencies and scripts
├── jest.config.js      # Test configuration
└── README.md          # This file
```

## Installation

### Prerequisites

- Node.js v18 or higher
- npm or yarn package manager

### Setup

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd image-adjuster
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Electron globally (optional)**
   ```bash
   npm install -g electron
   ```

## Usage

### Desktop Application

Start the Electron desktop application:

```bash
npm start
```

This will:
- Launch the Electron desktop window
- Start the web server on port 3000
- Display the folder selection dialog

### Web Interface Only

Start just the web server:

```bash
npm run web
```

Then open your browser to: `http://localhost:3000`

### Desktop Only

Start just the Electron application without the web server:

```bash
npm run desktop
```

## Application Workflow

1. **Folder Selection**: Click "Select Folder" to choose a directory containing images
2. **Image Viewing**: The application will scan recursively and display the first image
3. **Navigation**: Use the Previous/Next buttons or arrow keys to navigate
4. **Transformations**: Apply rotations and flips using the control buttons
5. **Auto-Save**: Changes are automatically saved when navigating to a different image
6. **Skip**: Use the Skip button to advance without saving pending changes

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` | Previous image |
| `→` | Next image |
| `R` | Rotate right 90° |
| `L` | Rotate left 90° |
| `F` | Flip vertically |
| `S` | Skip to next image |
| `?` | Show/hide help |
| `Esc` | Close help |

## Development

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Development Mode

For development with hot-reload and debugging:

1. Set environment variable:
   ```bash
   export NODE_ENV=development
   ```

2. Start the application:
   ```bash
   npm start
   ```

This will open DevTools automatically for debugging.

### Code Organization

- **Main Process**: Uses CommonJS with ES Module interop for Electron compatibility
- **Renderer Process**: Pure ES modules for modern JavaScript features
- **Services**: ES modules for shared business logic
- **Security**: Context isolation enabled, secure IPC communication

## Architecture

### Process Architecture

- **Main Process**: Application lifecycle, window management, web server
- **Renderer Process**: UI rendering, user interactions
- **Preload Scripts**: Secure IPC bridge between main and renderer
- **Web Server**: HTTP server for web interface access

### Security Features

- Context isolation enabled
- Content Security Policy (CSP) headers
- Secure IPC communication channels
- Input validation on both interfaces
- CORS configuration for web API

## Error Handling

The application includes comprehensive error handling:

- **File Access**: Handles permission errors and corrupted files
- **Empty Directories**: Graceful handling of folders with no images
- **Network Issues**: Web server error handling and recovery
- **User Feedback**: Toast notifications for all operations

## Performance Considerations

- **Image Optimization**: Large images are automatically resized for display
- **Memory Management**: Efficient image loading and cleanup
- **Lazy Loading**: Images are loaded on-demand
- **Resource Cleanup**: Proper cleanup on application exit

## Browser Compatibility

The web interface supports:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

1. **"Failed to select folder"**
   - Ensure you have read permissions for the selected directory
   - Try selecting a different folder

2. **"No supported images found"**
   - Verify the folder contains JPG, PNG, GIF, BMP, WEBP, or TIFF files
   - Check subdirectories are accessible

3. **"Failed to save changes"**
   - Ensure you have write permissions for the image files
   - Check if files are not read-only

4. **Web interface not accessible**
   - Verify port 3000 is not in use by another application
   - Check firewall settings if accessing from another device

### Debug Mode

Enable debug logging by setting:
```bash
export DEBUG=image-adjuster:*
```

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the technical specifications in `documents/tech-spec.md`
3. Check existing issues in the project repository
