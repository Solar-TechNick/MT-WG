#!/usr/bin/env python3
"""
Simple CORS proxy server for MikroTik REST API
This allows the browser to connect through localhost, avoiding CORS issues
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.error
import json
import base64
from urllib.parse import urlparse, parse_qs

class CORSProxyHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers to allow browser requests"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '3600')

    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        """Proxy GET requests"""
        self._proxy_request('GET')

    def do_POST(self):
        """Proxy POST requests"""
        self._proxy_request('POST')

    def do_PUT(self):
        """Proxy PUT requests"""
        self._proxy_request('PUT')

    def do_DELETE(self):
        """Proxy DELETE requests"""
        self._proxy_request('DELETE')

    def do_PATCH(self):
        """Proxy PATCH requests"""
        self._proxy_request('PATCH')

    def _proxy_request(self, method):
        """Proxy the request to MikroTik router"""
        try:
            # Parse the request path
            # Expected format: /proxy?url=http://192.168.8.41/rest/system/identity
            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)

            if 'url' not in params:
                self.send_error(400, 'Missing url parameter')
                return

            target_url = params['url'][0]

            # Get request body if present
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None

            # Get authorization header
            auth_header = self.headers.get('Authorization')

            # Create request
            req = urllib.request.Request(target_url, data=body, method=method)

            if auth_header:
                req.add_header('Authorization', auth_header)

            if body:
                req.add_header('Content-Type', 'application/json')

            # Disable SSL verification for self-signed certs
            import ssl
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            # Make the request
            if target_url.startswith('https'):
                response = urllib.request.urlopen(req, context=ctx, timeout=10)
            else:
                response = urllib.request.urlopen(req, timeout=10)

            # Read response
            response_data = response.read()

            # Send response to client
            self.send_response(response.status)
            self._set_cors_headers()
            self.send_header('Content-Type', response.headers.get('Content-Type', 'application/json'))
            self.send_header('Content-Length', len(response_data))
            self.end_headers()
            self.wfile.write(response_data)

            print(f"✅ {method} {target_url} -> {response.status}")

        except urllib.error.HTTPError as e:
            print(f"❌ HTTP Error: {e.code} - {e.reason}")
            self.send_response(e.code)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            error_body = e.read() if hasattr(e, 'read') else b'{}'
            self.wfile.write(error_body)

        except Exception as e:
            print(f"❌ Error: {type(e).__name__}: {e}")
            self.send_response(500)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            error_msg = json.dumps({'error': str(e)}).encode()
            self.wfile.write(error_msg)

    def log_message(self, format, *args):
        """Custom log format"""
        pass  # Suppress default logging, we use custom prints

if __name__ == '__main__':
    PORT = 8081

    print("="*60)
    print("MikroTik CORS Proxy Server")
    print("="*60)
    print(f"Proxy running on: http://localhost:{PORT}")
    print(f"Web app running on: http://localhost:8080")
    print("")
    print("Configure the app to use proxy:")
    print("  Proxy URL: http://localhost:8081/proxy")
    print("")
    print("Press Ctrl+C to stop")
    print("="*60)
    print("")

    server = HTTPServer(('localhost', PORT), CORSProxyHandler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nShutting down proxy server...")
        server.shutdown()
