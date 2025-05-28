/**
 * Tests for Web Server
 */

import request from 'supertest';
import webServer from '../main/web-server.js';

describe('WebServer', () => {
  let server;

  beforeAll(async () => {
    // Start the web server for testing
    await webServer.start();
    server = webServer.app;
  });

  afterAll(async () => {
    // Stop the web server after tests
    await webServer.stop();
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        status: 'healthy'
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Info Endpoint', () => {
    it('should return application information', async () => {
      const response = await request(server)
        .get('/api/info')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          name: 'Image Adjuster',
          version: '1.0.0',
          description: 'Electron desktop application for image viewing and editing'
        }
      });
    });
  });

  describe('Security Headers', () => {
    it('should set proper security headers', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should set CORS headers', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
    });
  });

  describe('Static File Serving', () => {
    it('should serve the main HTML file', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/html');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(server)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Not found'
      });
    });

    it('should handle OPTIONS requests', async () => {
      await request(server)
        .options('/api/health')
        .expect(200);
    });
  });

  describe('Server Status', () => {
    it('should return correct server status', () => {
      const status = webServer.getStatus();

      expect(status).toMatchObject({
        running: true,
        port: 3000,
        host: '0.0.0.0',
        url: 'http://0.0.0.0:3000'
      });
    });
  });
});
