/**
 * MikroTik RouterOS REST API Client
 * Provides connection and command execution for MikroTik routers
 *
 * Requirements:
 * - RouterOS v7.1+ with REST API support
 * - Enable HTTP service: /ip/service/set www disabled=no
 * - Enable HTTPS service (recommended): /ip/service/set www-ssl disabled=no
 * - REST API is accessed at: http(s)://router-ip/rest
 * - Uses HTTP Basic Authentication
 */

class MikroTikAPI {
    constructor() {
        this.connected = false;
        this.baseUrl = null;
        this.credentials = null;
        this.sessionToken = null;
        this.useProxy = false;
        this.proxyUrl = 'http://localhost:8081/proxy';
    }

    /**
     * Enable CORS proxy mode
     * @param {string} proxyUrl - Proxy server URL (default: http://localhost:8081/proxy)
     */
    enableProxy(proxyUrl = 'http://localhost:8081/proxy') {
        this.useProxy = true;
        this.proxyUrl = proxyUrl;
        console.log('[MikroTik API] Proxy enabled:', proxyUrl);
    }

    /**
     * Disable CORS proxy mode
     */
    disableProxy() {
        this.useProxy = false;
        console.log('[MikroTik API] Proxy disabled');
    }

    /**
     * Connect to MikroTik router
     * @param {string} host - Router IP or hostname
     * @param {string} username - RouterOS username
     * @param {string} password - RouterOS password
     * @param {number} port - REST API port (default: 443 for HTTPS, 80 for HTTP)
     * @param {boolean} useSSL - Use HTTPS (default: true)
     * @returns {Promise<boolean>}
     */
    async connect(host, username, password, port = null, useSSL = true) {
        try {
            // Build base URL
            const protocol = useSSL ? 'https' : 'http';
            const defaultPort = useSSL ? 443 : 80;
            const apiPort = port || defaultPort;

            this.baseUrl = `${protocol}://${host}:${apiPort}/rest`;
            this.credentials = btoa(`${username}:${password}`); // Base64 encode

            // Test connection by fetching system identity (GET /rest/system/identity)
            const response = await this.executeCommand('/system/identity', 'GET');

            // Response can be either:
            // - Object: {"name":"MikroTik"} or {".id":"*1", "name":"MikroTik"}
            // - Array: [{".id":"*1", "name":"MikroTik"}]
            if (response) {
                if (Array.isArray(response) && response.length > 0) {
                    this.connected = true;
                    return true;
                } else if (typeof response === 'object' && (response.name || response['.id'])) {
                    this.connected = true;
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('MikroTik API connection failed:', error);
            console.error('Error type:', error.constructor.name);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            this.connected = false;

            // Provide helpful error messages
            if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
                throw new Error('Connection failed: Cannot reach router.\n\nPossible causes:\n1. Router IP/hostname is incorrect\n2. www or www-ssl service is not enabled\n3. Router is not accessible from this network\n4. CORS is blocking the request\n\nSolution: Access this page from http://' + host + '/ or enable CORS on router');
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                throw new Error('Authentication failed: Invalid username or password');
            } else if (error.message.includes('403')) {
                throw new Error('Access forbidden: User does not have API access permissions');
            } else if (error.message.includes('404')) {
                throw new Error('REST API not found: Ensure RouterOS v7.1+ and www-ssl service is enabled');
            } else {
                throw new Error(`Connection failed: ${error.message}`);
            }
        }
    }

    /**
     * Disconnect from router
     */
    disconnect() {
        this.connected = false;
        this.baseUrl = null;
        this.credentials = null;
        this.sessionToken = null;
    }

    /**
     * Check if connected to router
     * @returns {boolean}
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Execute a RouterOS command via REST API
     * @param {string} path - API path (e.g., '/system/identity/print')
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
     * @param {object} data - Request data
     * @returns {Promise<any>}
     */
    async executeCommand(path, method = 'GET', data = null) {
        if (!this.baseUrl) {
            throw new Error('Not connected to router. Call connect() first.');
        }

        // Build target URL
        const targetUrl = `${this.baseUrl}${path}`;

        // If proxy is enabled, route through proxy
        const url = this.useProxy ? `${this.proxyUrl}?url=${encodeURIComponent(targetUrl)}` : targetUrl;

        const headers = {
            'Authorization': `Basic ${this.credentials}`,
            'Content-Type': 'application/json'
        };

        const options = {
            method: method,
            headers: headers,
            mode: 'cors',
            credentials: 'omit'
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            console.log(`[MikroTik API] ${method} ${targetUrl}${this.useProxy ? ' (via proxy)' : ''}`);
            const response = await fetch(url, options);

            console.log(`[MikroTik API] Response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[MikroTik API] Error response: ${errorText}`);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Handle empty responses
            const text = await response.text();
            console.log(`[MikroTik API] Response body:`, text);

            if (!text) {
                return { success: true };
            }

            return JSON.parse(text);
        } catch (error) {
            console.error('[MikroTik API] Command failed:', error);
            console.error('[MikroTik API] Error name:', error.name);
            console.error('[MikroTik API] Error message:', error.message);
            throw error;
        }
    }

    /**
     * Execute a raw RouterOS command using POST /rest/execute
     * This is more reliable for complex commands
     * @param {string} command - RouterOS CLI command
     * @returns {Promise<any>}
     */
    async executeRawCommand(command) {
        // Clean up the command
        command = command.trim();

        // Remove line continuation backslashes
        command = command.replace(/\\\s*\n\s*/g, ' ');

        // Skip empty lines and comments
        if (!command || command.startsWith('#')) {
            return { skipped: true };
        }

        // Use POST to execute the command
        // According to the docs, POST can access all console commands
        try {
            const response = await fetch(`${this.baseUrl}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.credentials}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ command: command })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : { success: true };
        } catch (error) {
            // Fallback to parsing and converting to REST API
            return await this.parseAndExecuteCommand(command);
        }
    }

    /**
     * Execute multiple RouterOS commands in sequence
     * @param {Array<string>} commands - Array of RouterOS CLI commands
     * @returns {Promise<Array>}
     */
    async executeScript(commands) {
        const results = [];

        for (const command of commands) {
            try {
                // Try to parse and execute command via REST API
                const result = await this.parseAndExecuteCommand(command);
                results.push({ command, success: true, result });
            } catch (error) {
                results.push({ command, success: false, error: error.message });
                // Continue executing remaining commands even if one fails
            }
        }

        return results;
    }

    /**
     * Parse RouterOS CLI command and execute via REST API
     * @param {string} command - RouterOS CLI command
     * @returns {Promise<any>}
     */
    async parseAndExecuteCommand(command) {
        // Remove comments
        command = command.split('#')[0].trim();

        if (!command || command.startsWith('#')) {
            return { skipped: true };
        }

        // Handle line continuation (backslash)
        command = command.replace(/\\\s*\n\s*/g, ' ');

        // Parse command into path and parameters
        const parsed = this.parseCommand(command);

        if (!parsed) {
            throw new Error(`Unable to parse command: ${command}`);
        }

        // Execute via REST API
        return await this.executeCommand(parsed.path, parsed.method, parsed.data);
    }

    /**
     * Parse RouterOS CLI command to REST API format
     * @param {string} command - CLI command
     * @returns {object|null}
     */
    parseCommand(command) {
        // Remove leading/trailing whitespace
        command = command.trim();

        // Extract the path (everything before parameters)
        const pathMatch = command.match(/^([\/\w-]+(?:\/[\/\w-]+)*)/);
        if (!pathMatch) return null;

        let path = pathMatch[1];
        const remainder = command.substring(path.length).trim();

        // Determine method based on command verb
        let method = 'POST';

        if (path.endsWith('/print')) {
            method = 'GET';
            path = path.replace('/print', '');
        } else if (path.endsWith('/add')) {
            method = 'PUT';
            path = path.replace('/add', '');
        } else if (path.endsWith('/set')) {
            method = 'PATCH';
            path = path.replace('/set', '');
        } else if (path.endsWith('/remove')) {
            method = 'DELETE';
            path = path.replace('/remove', '');
        } else if (path.endsWith('/enable')) {
            method = 'PATCH';
            path = path.replace('/enable', '');
        } else if (path.endsWith('/disable')) {
            method = 'PATCH';
            path = path.replace('/disable', '');
        }

        // Parse parameters
        const data = this.parseParameters(remainder);

        return { path, method, data };
    }

    /**
     * Parse command parameters
     * @param {string} paramString - Parameter string
     * @returns {object}
     */
    parseParameters(paramString) {
        const params = {};

        // Match key=value pairs, handling quoted values
        const regex = /(\w+(?:-\w+)*)=(?:"([^"]*)"|(\S+))/g;
        let match;

        while ((match = regex.exec(paramString)) !== null) {
            const key = match[1];
            const value = match[2] || match[3]; // Quoted or unquoted value
            params[key] = value;
        }

        return params;
    }

    /**
     * Get system information from router
     * @returns {Promise<object>}
     */
    async getSystemInfo() {
        try {
            const [identity, resource, routerboard] = await Promise.all([
                this.executeCommand('/system/identity', 'GET'),
                this.executeCommand('/system/resource', 'GET'),
                this.executeCommand('/system/routerboard', 'GET').catch(() => null)
            ]);

            // Helper function to extract first item if array, otherwise return object
            const extractData = (data) => {
                if (!data) return null;
                return Array.isArray(data) ? data[0] : data;
            };

            const identityData = extractData(identity);
            const resourceData = extractData(resource);
            const routerboardData = extractData(routerboard);

            console.log('[MikroTik API] System info data:', {
                identity: identityData,
                resource: resourceData,
                routerboard: routerboardData
            });

            return {
                identity: identityData?.name || 'Unknown',
                version: resourceData?.version || 'Unknown',
                model: routerboardData?.model || resourceData?.['board-name'] || resourceData?.['architecture-name'] || 'Unknown',
                uptime: resourceData?.uptime || 'Unknown',
                cpuLoad: resourceData?.['cpu-load'] || 0
            };
        } catch (error) {
            console.error('Failed to get system info:', error);
            throw error;
        }
    }

    /**
     * Apply WireGuard configuration
     * @param {string} script - RouterOS script
     * @returns {Promise<object>}
     */
    async applyWireGuardConfig(script) {
        const commands = script.split('\n').filter(cmd => {
            const trimmed = cmd.trim();
            return trimmed && !trimmed.startsWith('#');
        });

        return await this.executeScript(commands);
    }

    /**
     * Apply WiFi configuration
     * @param {string} script - RouterOS script
     * @returns {Promise<object>}
     */
    async applyWiFiConfig(script) {
        const commands = script.split('\n').filter(cmd => {
            const trimmed = cmd.trim();
            return trimmed && !trimmed.startsWith('#');
        });

        return await this.executeScript(commands);
    }

    /**
     * Apply LTE configuration
     * @param {string} script - RouterOS script
     * @returns {Promise<object>}
     */
    async applyLTEConfig(script) {
        const commands = script.split('\n').filter(cmd => {
            const trimmed = cmd.trim();
            return trimmed && !trimmed.startsWith('#');
        });

        return await this.executeScript(commands);
    }

    /**
     * Test connection to router
     * @returns {Promise<object>}
     */
    async testConnection() {
        try {
            const info = await this.getSystemInfo();
            return {
                success: true,
                connected: true,
                info: info
            };
        } catch (error) {
            return {
                success: false,
                connected: false,
                error: error.message
            };
        }
    }
}

// Export for global use
window.MikroTikAPI = MikroTikAPI;

// Create global instance
window.mikrotikAPI = new MikroTikAPI();
