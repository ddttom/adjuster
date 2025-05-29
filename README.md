# Image Adjuster

An Electron desktop application for image viewing and editing with intuitive controls for transforming images.

## Repository

**GitHub**: [https://github.com/ddttom/adjuster](https://github.com/ddttom/adjuster)

## Quick Start

```bash
git clone https://github.com/ddttom/adjuster.git
cd adjuster
npm install
npm start
```

## Features

- **Folder Selection**: Choose any folder containing images to start viewing
- **Recursive Scanning**: Automatically finds images in all subdirectories
- **Image Transformations**:
  - Rotate left/right (90° increments)
  - Flip vertically
  - Mirror (flip horizontally)
  - Real-time preview of changes
- **File Management**:
  - Delete images with confirmation dialog
  - Automatic navigation after deletion
- **Navigation**:
  - Previous/Next image navigation
  - Keyboard shortcuts (arrow keys)
  - Skip functionality to advance without saving
- **Auto-Save**: Automatically saves transformations when navigating to different images
- **Supported Formats**: JPG, JPEG, PNG, GIF, BMP, WEBP, TIFF
- **Desktop Interface**: Native Electron application with intuitive controls
- **Comprehensive Logging**: Detailed logging of all user actions and operations
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

```bash
adjuster/
├── src/
│   ├── main/           # Main process (Electron)
│   │   ├── index.js    # Application entry point
│   │   └── web-server.js # Web server implementation
│   ├── renderer/       # Renderer process (UI)
│   │   ├── index.html  # Main HTML file
│   │   ├── styles.css  # Application styles
│   │   └── app.js      # Frontend JavaScript with logging
│   ├── preload/        # Preload scripts
│   │   └── index.js    # Secure IPC bridge
│   ├── services/       # Shared business logic
│   │   └── image-service.js # Image processing with logging
│   ├── public/         # Static assets
│   │   └── favicon.ico # Application icon
│   └── tests/          # Test files
│       ├── setup.js    # ES modules test setup
│       ├── setup.cjs   # CommonJS test setup
│       ├── image-service.test.js # Service tests
│       └── web-server.test.js # Server tests
├── docs/               # Documentation
│   └── development-notes/ # Development notes
├── documents/          # Technical specifications
│   └── tech-spec.md    # Technical specifications
├── babel.config.cjs    # Babel configuration for tests
├── jest.config.js      # ES modules Jest config
├── jest.config.cjs     # CommonJS Jest config
├── package.json        # Dependencies and scripts
├── LICENSE             # MIT license
└── README.md          # This file
```

## Installation

### Prerequisites

- Node.js v18 or higher
- npm or yarn package manager

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ddttom/adjuster.git
   cd adjuster
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

Start the Electron desktop application:

```bash
npm start
```

This will:

- Launch the Electron desktop window
- Display the folder selection dialog

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
| `V` | Flip vertically |
| `H` | Mirror (flip horizontally) |
| `D` / `Del` | Delete current image |
| `S` | Skip to next image |
| `?` | Show/hide help |
| `Esc` | Close help |

## Logging

The application includes comprehensive logging for all user actions and operations, making it easy to track and debug user interactions.

### Logged Operations

All major operations are logged with detailed information including:

- **📁 Folder Selection**: Timing, path, and image count
- **🔄 Image Navigation**: Direction, auto-save detection, and file names
- **↻ Rotate Operations**: Degree tracking and transformation state
- **⇅ Flip Vertical Operations**: State changes and transformation details (V key)
- **⇄ Mirror (Flip Horizontal) Operations**: State changes and transformation details (H key)
- **🗑️ Delete Operations**: File deletion with confirmation and navigation handling
- **⏭️ Skip Actions**: Pending change handling and file transitions
- **💾 Save Operations**: Duration, success/error status, and file details
- **📷 Image Loading**: Metadata, performance metrics, and file information
- **🔌 IPC Communication**: Request/response timing and data flow

### Log Format

Logs use emojis for easy visual scanning and include:

```bash
🔄 ROTATE RIGHT: 90°
   📁 File: example.jpg
   🔄 Previous rotation: 0°
   ✅ New rotation: 90°
   🎯 Total pending transformations: {rotation: 90, flipVertical: false, flipHorizontal: false}
✅ ROTATE RIGHT APPLIED: Visual preview updated
```

### Viewing Logs

Logs are displayed in the console when running the application:

```bash
npm start
```

Open Developer Tools (F12) to view detailed logs in the console, or check the terminal output for main process logs.

### Log Categories

- **✅ Success Operations**: Completed actions with timing and results
- **❌ Error Operations**: Failed actions with error details and duration
- **🔄 In-Progress**: Operations currently being processed
- **⚠️ Warnings**: Non-critical issues or blocked actions
- **📊 Performance**: Timing and performance metrics for all operations

## Building Executables

The application can be packaged into standalone executables for Windows, macOS, and Linux using Electron Builder.

### Build Commands

```bash
# Build for Windows (creates portable .exe)
npm run build:win

# Build for macOS (creates .zip)
npm run build:mac

# Build for Linux (creates .tar.gz)
npm run build:linux

# Build for all platforms
npm run build
```

### Build Output

Built executables will be placed in the `dist/` directory:

- **Windows**: `dist/Image Adjuster.exe` (portable executable)
- **macOS**: `dist/Image Adjuster.zip` (application bundle)
- **Linux**: `dist/Image Adjuster.tar.gz` (application archive)

### Requirements

- Node.js 18+ is required for building
- The build process will automatically download the required Electron binaries
- No additional dependencies are needed for the built executables

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

- **Main Process**: Uses ES modules for modern JavaScript features
- **Preload Scripts**: Uses CommonJS for Electron compatibility
- **Renderer Process**: Pure ES modules for modern JavaScript features
- **Services**: ES modules for shared business logic
- **Security**: Context isolation enabled, secure IPC communication

## Architecture

### Process Architecture

- **Main Process**: Application lifecycle, window management
- **Renderer Process**: UI rendering, user interactions
- **Preload Scripts**: Secure IPC bridge between main and renderer

### Security Features

- Context isolation enabled
- Content Security Policy (CSP) headers
- Secure IPC communication channels
- Input validation and sanitization

## Error Handling

The application includes comprehensive error handling:

- **File Access**: Handles permission errors and corrupted files
- **Empty Directories**: Graceful handling of folders with no images
- **User Feedback**: Toast notifications for all operations

## Performance Considerations

- **Image Optimization**: Large images are automatically resized for display
- **Memory Management**: Efficient image loading and cleanup
- **Lazy Loading**: Images are loaded on-demand
- **Resource Cleanup**: Proper cleanup on application exit

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

### Debug Mode

The application includes comprehensive built-in logging for all operations. To view detailed logs:

1. **Console Logs**: Open Developer Tools (F12) in the application to view frontend logs
2. **Terminal Logs**: Check the terminal where you ran `npm start` for backend logs
3. **All Operations Logged**: Every user action is logged with timing and details

Example log output:

```bash
🔄 NAVIGATION: NEXT
   📂 Current: image1.jpg (1/5)
   💾 Auto-saving pending transformations before navigation
🔄 TRANSFORM START: image1.jpg
   📁 Path: /path/to/image1.jpg
   🔧 Transformations: {rotation: 90, flipVertical: false, flipHorizontal: false}
✅ TRANSFORM SUCCESS: image1.jpg
   ⏱️  Duration: 245ms
✅ NAVIGATION SUCCESS: NEXT
   📁 Now viewing: image2.jpg
```

For additional debugging, you can also set:

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

## Screenshots

![Image Adjuster Interface](docs/screenshots/main-interface.png)
*Main application interface showing image viewer and control panel*

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the technical specifications in `documents/tech-spec.md`
3. Open an issue on GitHub: [https://github.com/ddttom/adjuster/issues](https://github.com/ddttom/adjuster/issues)
4. Check existing issues and discussions in the repository
