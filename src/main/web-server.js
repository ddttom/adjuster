import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Web server for providing web interface access
 */
class WebServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.port = 3000;
    this.host = '0.0.0.0';
  }

  /**
   * Initialize and configure the Express application
   */
  _initializeApp() {
    // Security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'");
      next();
    });

    // CORS configuration
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });

    // Parse JSON bodies
    this.app.use(express.json({ limit: '10mb' }));

    // Serve static files from renderer directory
    const rendererPath = path.resolve(__dirname, '../renderer');
    this.app.use(express.static(rendererPath, {
      setHeaders: (res, filePath) => {
        // Set proper content-length headers
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.html') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        } else if (ext === '.css') {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (ext === '.js') {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
      }
    }));

    // API routes
    this._setupRoutes();

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      console.error('Web server error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not found'
      });
    });
  }

  /**
   * Setup API routes
   * @private
   */
  _setupRoutes() {
    // Health check endpoint
    this.app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });

    // Get application info
    this.app.get('/api/info', (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'Image Adjuster',
          version: '1.0.0',
          description: 'Electron desktop application for image viewing and editing'
        }
      });
    });

    // Serve main page
    this.app.get('/', (req, res) => {
      const indexPath = path.resolve(__dirname, '../renderer/index.html');
      res.sendFile(indexPath);
    });
  }

  /**
   * Start the web server
   * @returns {Promise<void>}
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this._initializeApp();

        this.server = this.app.listen(this.port, this.host, () => {
          console.log(`Web server running at http://${this.host}:${this.port}`);
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('Web server error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('Failed to start web server:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop the web server
   * @returns {Promise<void>}
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Web server stopped');
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get server status
   * @returns {Object} Server status information
   */
  getStatus() {
    return {
      running: !!this.server,
      port: this.port,
      host: this.host,
      url: `http://${this.host}:${this.port}`
    };
  }
}

// Export singleton instance
export default new WebServer();
