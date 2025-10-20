/**
 * Configuration Import Parser
 * Parses WireGuard and MikroTik RouterOS configurations for import
 */

class ConfigImportParser {
    constructor() {
        this.importedData = null;
    }

    /**
     * Parse configuration text and detect format
     * @param {string} configText - Configuration text to parse
     * @returns {object|null} Parsed configuration data or null if invalid
     */
    parse(configText) {
        if (!configText || !configText.trim()) {
            throw new Error('Configuration text is empty');
        }

        // Detect format
        if (this.isWireGuardConfig(configText)) {
            return this.parseWireGuardConfig(configText);
        } else if (this.isMikroTikConfig(configText)) {
            return this.parseMikroTikConfig(configText);
        } else {
            throw new Error('Unrecognized configuration format. Supported formats: WireGuard .conf, MikroTik .rsc');
        }
    }

    /**
     * Check if text is WireGuard format
     * @param {string} text
     * @returns {boolean}
     */
    isWireGuardConfig(text) {
        return /\[Interface\]/i.test(text) || /\[Peer\]/i.test(text);
    }

    /**
     * Check if text is MikroTik format
     * @param {string} text
     * @returns {boolean}
     */
    isMikroTikConfig(text) {
        return /\/interface\s+wireguard/i.test(text) ||
               /add\s+interface=/i.test(text);
    }

    /**
     * Parse WireGuard configuration
     * @param {string} configText
     * @returns {object} Parsed data
     */
    parseWireGuardConfig(configText) {
        const result = {
            format: 'wireguard',
            type: null,
            server: {},
            clients: [],
            peers: [],
            interface: {},
            routing: {}
        };

        const lines = configText.split('\n');
        let currentSection = null;
        let currentPeer = null;
        let interfaceData = {};

        for (let line of lines) {
            line = line.trim();

            // Skip comments and empty lines
            if (!line || line.startsWith('#') || line.startsWith(';')) continue;

            // Section headers
            if (line.match(/^\[Interface\]/i)) {
                currentSection = 'interface';
                currentPeer = null;
                continue;
            } else if (line.match(/^\[Peer\]/i)) {
                currentSection = 'peer';
                if (currentPeer) {
                    result.peers.push(currentPeer);
                }
                currentPeer = {};
                continue;
            }

            // Parse key-value pairs
            const match = line.match(/^(\w+)\s*=\s*(.+)$/);
            if (!match) continue;

            const [, key, value] = match;
            const trimmedValue = value.trim();

            if (currentSection === 'interface') {
                this.parseInterfaceField(key, trimmedValue, interfaceData, result);
            } else if (currentSection === 'peer') {
                this.parsePeerField(key, trimmedValue, currentPeer);
            }
        }

        // Add last peer if exists
        if (currentPeer && Object.keys(currentPeer).length > 0) {
            result.peers.push(currentPeer);
        }

        // Determine configuration type
        result.type = result.peers.length > 0 ? 'client-server' : 'site-to-site';

        // Set server data from interface
        if (interfaceData.address) {
            result.server.ip = interfaceData.address;
        }
        if (interfaceData.listenPort) {
            result.server.port = interfaceData.listenPort;
        }
        if (interfaceData.privateKey) {
            result.server.keys = result.server.keys || {};
            result.server.keys.privateKey = interfaceData.privateKey;
        }

        // Set interface settings
        result.interface.mtu = interfaceData.mtu;
        result.interface.dns = interfaceData.dns;

        return result;
    }

    /**
     * Parse interface field from WireGuard config
     */
    parseInterfaceField(key, value, interfaceData, result) {
        switch (key.toLowerCase()) {
            case 'address':
                interfaceData.address = value;
                break;
            case 'privatekey':
                interfaceData.privateKey = value;
                break;
            case 'listenport':
                interfaceData.listenPort = parseInt(value);
                break;
            case 'mtu':
                interfaceData.mtu = parseInt(value);
                break;
            case 'dns':
                interfaceData.dns = value;
                break;
            case 'table':
                result.routing.routingTable = value;
                break;
        }
    }

    /**
     * Parse peer field from WireGuard config
     */
    parsePeerField(key, value, peer) {
        switch (key.toLowerCase()) {
            case 'publickey':
                peer.publicKey = value;
                break;
            case 'presharedkey':
                peer.psk = value;
                break;
            case 'endpoint':
                peer.endpoint = value;
                break;
            case 'allowedips':
                peer.allowedIPs = value;
                break;
            case 'persistentkeepalive':
                peer.keepalive = parseInt(value);
                break;
        }
    }

    /**
     * Parse MikroTik RouterOS configuration
     * @param {string} configText
     * @returns {object} Parsed data
     */
    parseMikroTikConfig(configText) {
        const result = {
            format: 'mikrotik',
            type: 'client-server',
            server: { keys: {} },
            clients: [],
            peers: [],
            interface: {},
            routing: {}
        };

        const lines = configText.split('\n');

        for (let line of lines) {
            line = line.trim();

            // Skip comments and empty lines
            if (!line || line.startsWith('#')) continue;

            // Parse /interface wireguard add
            if (line.match(/\/interface\s+wireguard\s+add/i)) {
                this.parseMikroTikInterface(line, result);
            }
            // Parse /interface wireguard peers add
            else if (line.match(/\/interface\s+wireguard\s+peers\s+add/i)) {
                this.parseMikroTikPeer(line, result);
            }
            // Parse /ip address add
            else if (line.match(/\/ip\s+address\s+add/i)) {
                this.parseMikroTikAddress(line, result);
            }
            // Parse /ip firewall nat add
            else if (line.match(/\/ip\s+firewall\s+nat\s+add/i)) {
                const natMatch = line.match(/action=masquerade/i);
                if (natMatch) {
                    result.routing.enableNat = true;
                }
            }
            // Parse /ip firewall filter add
            else if (line.match(/\/ip\s+firewall\s+filter\s+add/i)) {
                result.routing.enableFirewall = true;
            }
        }

        return result;
    }

    /**
     * Parse MikroTik interface wireguard add command
     */
    parseMikroTikInterface(line, result) {
        // Extract name
        const nameMatch = line.match(/name[=\s]+([^\s]+)/i);
        if (nameMatch) {
            result.server.name = nameMatch[1].replace(/"/g, '');
            result.interface.name = nameMatch[1].replace(/"/g, '');
        }

        // Extract listen-port
        const portMatch = line.match(/listen-port[=\s]+(\d+)/i);
        if (portMatch) {
            result.server.port = parseInt(portMatch[1]);
        }

        // Extract private-key
        const privKeyMatch = line.match(/private-key[=\s]+"?([^"\s]+)"?/i);
        if (privKeyMatch) {
            result.server.keys.privateKey = privKeyMatch[1].replace(/"/g, '');
        }

        // Extract mtu
        const mtuMatch = line.match(/mtu[=\s]+(\d+)/i);
        if (mtuMatch) {
            result.interface.mtu = parseInt(mtuMatch[1]);
        }
    }

    /**
     * Parse MikroTik peer add command
     */
    parseMikroTikPeer(line, result) {
        const peer = {};

        // Extract public-key
        const pubKeyMatch = line.match(/public-key[=\s]+"?([^"\s]+)"?/i);
        if (pubKeyMatch) {
            peer.publicKey = pubKeyMatch[1].replace(/"/g, '');
        }

        // Extract endpoint
        const endpointMatch = line.match(/endpoint-address[=\s]+([^\s]+)/i);
        const endpointPortMatch = line.match(/endpoint-port[=\s]+(\d+)/i);
        if (endpointMatch) {
            peer.endpoint = endpointMatch[1].replace(/"/g, '');
            if (endpointPortMatch) {
                peer.endpoint += ':' + endpointPortMatch[1];
            }
        }

        // Extract allowed-address
        const allowedMatch = line.match(/allowed-address[=\s]+([^\s]+)/i);
        if (allowedMatch) {
            peer.allowedIPs = allowedMatch[1].replace(/"/g, '');
        }

        // Extract preshared-key
        const pskMatch = line.match(/preshared-key[=\s]+"?([^"\s]+)"?/i);
        if (pskMatch) {
            peer.psk = pskMatch[1].replace(/"/g, '');
        }

        // Extract persistent-keepalive
        const keepaliveMatch = line.match(/persistent-keepalive[=\s]+(\d+)/i);
        if (keepaliveMatch) {
            peer.keepalive = parseInt(keepaliveMatch[1]);
        }

        // Extract comment
        const commentMatch = line.match(/comment[=\s]+"?([^"]+)"?/i);
        if (commentMatch) {
            peer.name = commentMatch[1].replace(/"/g, '');
        }

        if (Object.keys(peer).length > 0) {
            result.peers.push(peer);
        }
    }

    /**
     * Parse MikroTik IP address add command
     */
    parseMikroTikAddress(line, result) {
        const addressMatch = line.match(/address[=\s]+([^\s]+)/i);
        const interfaceMatch = line.match(/interface[=\s]+([^\s]+)/i);

        if (addressMatch && interfaceMatch) {
            const interfaceName = interfaceMatch[1].replace(/"/g, '');
            // Check if this is for the WireGuard interface
            if (result.interface.name && interfaceName === result.interface.name) {
                result.server.ip = addressMatch[1].replace(/"/g, '');
            }
        }
    }

    /**
     * Generate preview text from parsed data
     * @param {object} parsedData
     * @returns {string} Preview text
     */
    generatePreview(parsedData) {
        if (!parsedData) return '';

        let preview = `Configuration Format: ${parsedData.format.toUpperCase()}\n`;
        preview += `Configuration Type: ${parsedData.type || 'Unknown'}\n\n`;

        preview += '=== SERVER/INTERFACE ===\n';
        if (parsedData.server.name) preview += `Name: ${parsedData.server.name}\n`;
        if (parsedData.server.ip) preview += `IP Address: ${parsedData.server.ip}\n`;
        if (parsedData.server.port) preview += `Listen Port: ${parsedData.server.port}\n`;
        if (parsedData.server.keys?.privateKey) {
            preview += `Private Key: ${parsedData.server.keys.privateKey.substring(0, 20)}...\n`;
        }
        if (parsedData.interface.mtu) preview += `MTU: ${parsedData.interface.mtu}\n`;
        if (parsedData.interface.dns) preview += `DNS: ${parsedData.interface.dns}\n`;

        if (parsedData.peers && parsedData.peers.length > 0) {
            preview += `\n=== PEERS (${parsedData.peers.length}) ===\n`;
            parsedData.peers.forEach((peer, index) => {
                preview += `\nPeer ${index + 1}:\n`;
                if (peer.name) preview += `  Name: ${peer.name}\n`;
                if (peer.publicKey) preview += `  Public Key: ${peer.publicKey.substring(0, 20)}...\n`;
                if (peer.endpoint) preview += `  Endpoint: ${peer.endpoint}\n`;
                if (peer.allowedIPs) preview += `  Allowed IPs: ${peer.allowedIPs}\n`;
                if (peer.psk) preview += `  Pre-shared Key: ${peer.psk.substring(0, 20)}...\n`;
                if (peer.keepalive) preview += `  Keepalive: ${peer.keepalive}s\n`;
            });
        }

        if (parsedData.routing.enableNat) preview += `\nNAT: Enabled\n`;
        if (parsedData.routing.enableFirewall) preview += `Firewall: Enabled\n`;

        return preview;
    }
}

// Initialize global instance
window.ConfigImportParser = new ConfigImportParser();
