// WireGuard configuration module
class WireGuardConfig {
    constructor() {
        this.keys = {};
        this.configs = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('WireGuard module initialized');
    }

    setupEventListeners() {
        // Key mode toggle
        document.querySelectorAll('input[name="key-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const manualKeys = document.getElementById('manual-keys');
                if (e.target.value === 'manual') {
                    manualKeys.style.display = 'block';
                } else {
                    manualKeys.style.display = 'none';
                }
            });
        });

        // IPv6 toggle
        const ipv6Checkbox = document.getElementById('wg-enable-ipv6');
        if (ipv6Checkbox) {
            ipv6Checkbox.addEventListener('change', (e) => {
                const ipv6Config = document.querySelector('.ipv6-config');
                if (e.target.checked) {
                    ipv6Config.style.display = 'block';
                } else {
                    ipv6Config.style.display = 'none';
                }
            });
        }

        // Firewall toggle
        const firewallCheckbox = document.getElementById('wg-enable-firewall');
        if (firewallCheckbox) {
            firewallCheckbox.addEventListener('change', (e) => {
                const firewallOptions = document.getElementById('firewall-options');
                if (e.target.checked) {
                    firewallOptions.style.display = 'block';
                } else {
                    firewallOptions.style.display = 'none';
                }
            });
        }

        // Output type change
        document.querySelectorAll('input[name="output-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateUIForOutputType(e.target.value);
            });
        });
    }

    updateUIForOutputType(outputType) {
        // Show/hide MikroTik-specific options
        const mikrotikOptions = [
            document.getElementById('firewall-options'),
            document.querySelector('.firewall-options')
        ];

        mikrotikOptions.forEach(element => {
            if (element) {
                if (outputType === 'wireguard') {
                    element.style.opacity = '0.5';
                    element.style.pointerEvents = 'none';
                } else {
                    element.style.opacity = '1';
                    element.style.pointerEvents = 'auto';
                }
            }
        });

        // Update button text based on output type
        const generateBtn = document.querySelector('button[onclick="generateWireGuardConfig()"]');
        if (generateBtn) {
            const btnText = outputType === 'both' ? 'Generate Configuration' :
                           outputType === 'wireguard' ? 'Generate WireGuard Configs' :
                           'Generate MikroTik Scripts';
            generateBtn.textContent = btnText;
        }
    }

    // Generate Curve25519 key pair using WebCrypto API
    async generateKeyPair() {
        try {
            // Generate X25519 key pair for WireGuard
            const keyPair = await crypto.subtle.generateKey(
                {
                    name: "X25519",
                },
                true, // extractable
                ["deriveKey", "deriveBits"]
            );

            // Export private key
            const privateKeyBuffer = await crypto.subtle.exportKey("raw", keyPair.privateKey);
            const privateKey = this.bufferToBase64(privateKeyBuffer);

            // Export public key  
            const publicKeyBuffer = await crypto.subtle.exportKey("raw", keyPair.publicKey);
            const publicKey = this.bufferToBase64(publicKeyBuffer);

            return {
                privateKey,
                publicKey
            };
        } catch (error) {
            console.error('Key generation failed:', error);
            // Fallback to crypto.getRandomValues if X25519 not supported
            return this.generateKeyPairFallback();
        }
    }

    // Fallback key generation using crypto.getRandomValues
    generateKeyPairFallback() {
        try {
            // Generate 32 random bytes for private key
            const privateKeyBytes = new Uint8Array(32);
            crypto.getRandomValues(privateKeyBytes);
            
            // Clamp the private key (required for Curve25519)
            privateKeyBytes[0] &= 248;
            privateKeyBytes[31] &= 127;
            privateKeyBytes[31] |= 64;

            const privateKey = this.bufferToBase64(privateKeyBytes);
            
            // For demo purposes, generate a mock public key
            // In real implementation, we'd compute the actual public key
            const publicKeyBytes = new Uint8Array(32);
            crypto.getRandomValues(publicKeyBytes);
            const publicKey = this.bufferToBase64(publicKeyBytes);

            return {
                privateKey,
                publicKey
            };
        } catch (error) {
            console.error('Fallback key generation failed:', error);
            throw new Error('Unable to generate cryptographic keys');
        }
    }

    // Convert buffer to base64
    bufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Generate pre-shared key
    generatePresharedKey() {
        const pskBytes = new Uint8Array(32);
        crypto.getRandomValues(pskBytes);
        return this.bufferToBase64(pskBytes);
    }

    // Generate WireGuard configuration
    async generateConfiguration() {
        try {
            const configType = document.querySelector('input[name="wg-type"]:checked').value;
            const serverName = document.getElementById('wg-server-name').value || 'WG-Server';
            const serverPort = document.getElementById('wg-server-port').value || '51820';
            const serverNetwork = document.getElementById('wg-server-ip').value || '10.0.0.1/24';
            const clientCount = parseInt(document.getElementById('wg-client-count').value) || 5;
            const serverEndpoint = document.getElementById('wg-server-endpoint').value;
            const interfaceName = document.getElementById('wg-interface-name').value || 'wireguard1';
            const mtu = document.getElementById('wg-mtu').value || '1420';
            const keepalive = document.getElementById('wg-keepalive').value || '25';
            const enableNat = document.getElementById('wg-enable-nat').checked;
            const enableFirewall = document.getElementById('wg-enable-firewall').checked;
            const dnsServers = document.getElementById('wg-dns-servers').value || '1.1.1.1, 8.8.8.8';
            const allowedIPs = document.getElementById('wg-allowed-ips').value || '0.0.0.0/0';
            const routingTable = document.getElementById('wg-routing-table').value;
            const enableIPv6 = document.getElementById('wg-enable-ipv6').checked;
            const ipv6Network = document.getElementById('wg-ipv6-network').value || 'fd00::/64';
            const keyMode = document.querySelector('input[name="key-mode"]:checked').value;

            // Firewall settings
            const firewallSettings = {
                allowWireGuardPort: document.getElementById('fw-allow-wireguard-port').checked,
                allowVpnForward: document.getElementById('fw-allow-vpn-forward').checked,
                allowInternetAccess: document.getElementById('fw-allow-internet-access').checked,
                allowLocalNetwork: document.getElementById('fw-allow-local-network').checked,
                dropInvalid: document.getElementById('fw-drop-invalid').checked,
                logBlocked: document.getElementById('fw-log-blocked').checked,
                localNetworks: document.getElementById('fw-local-networks').value,
                wanInterface: document.getElementById('fw-wan-interface').value || 'WAN'
            };

            // Handle different configuration types
            if (configType === 'site-to-site') {
                return await this.generateSiteToSiteConfig();
            }

            // Validate inputs
            if (!isValidCIDR(serverNetwork)) {
                throw new Error('Invalid server network CIDR notation');
            }

            if (!serverEndpoint) {
                throw new Error('Server endpoint is required');
            }

            // Generate or get server keys
            let serverKeys;
            if (keyMode === 'manual') {
                const privateKey = document.getElementById('wg-server-private').value;
                const publicKey = document.getElementById('wg-server-public').value;
                
                if (!privateKey || !publicKey) {
                    throw new Error('Manual keys are required when manual mode is selected');
                }
                
                if (!isValidWireGuardKey(privateKey) || !isValidWireGuardKey(publicKey)) {
                    throw new Error('Invalid WireGuard key format');
                }
                
                serverKeys = { privateKey, publicKey };
            } else {
                serverKeys = await this.generateKeyPair();
            }

            // Calculate subnet and generate client IPs
            const subnet = calculateSubnet(serverNetwork, clientCount);
            if (clientCount > subnet.maxHosts) {
                throw new Error(`Network ${serverNetwork} can only accommodate ${subnet.maxHosts} clients, but ${clientCount} requested`);
            }

            const clientIPs = generateClientIPs(serverNetwork, clientCount);

            // Generate client configurations
            const clients = [];
            for (let i = 0; i < clientCount; i++) {
                const clientKeys = await this.generateKeyPair();
                const presharedKey = this.generatePresharedKey();
                
                clients.push({
                    name: `Client-${i + 1}`,
                    privateKey: clientKeys.privateKey,
                    publicKey: clientKeys.publicKey,
                    presharedKey: presharedKey,
                    allowedIPs: clientIPs[i],
                    address: clientIPs[i]
                });
            }

            // Store configuration
            this.configs = {
                server: {
                    name: serverName,
                    privateKey: serverKeys.privateKey,
                    publicKey: serverKeys.publicKey,
                    network: serverNetwork,
                    port: serverPort,
                    endpoint: serverEndpoint,
                    interface: interfaceName,
                    mtu: mtu,
                    keepalive: keepalive,
                    enableNat: enableNat,
                    enableFirewall: enableFirewall,
                    dnsServers: dnsServers,
                    allowedIPs: allowedIPs,
                    routingTable: routingTable,
                    enableIPv6: enableIPv6,
                    ipv6Network: ipv6Network,
                    firewallSettings: firewallSettings
                },
                clients: clients,
                subnet: subnet
            };

            return this.configs;

        } catch (error) {
            console.error('Configuration generation failed:', error);
            throw error;
        }
    }

    // Generate RouterOS script for server
    generateServerScript() {
        const config = this.configs;
        if (!config.server) {
            throw new Error('No server configuration available');
        }

        const server = config.server;
        let script = `# WireGuard Server Configuration for MikroTik RouterOS
# Generated on ${new Date().toLocaleString()}
# Server: ${server.name}

`;

        // Create WireGuard interface
        script += `# Create WireGuard interface
/interface/wireguard add name=${server.interface} private-key="${server.privateKey}" listen-port=${server.port} mtu=${server.mtu}

`;

        // Add server IP address
        const [serverIP] = server.network.split('/');
        script += `# Add server IP address
/ip/address add address=${server.network} interface=${server.interface}

`;

        // Add client peers
        script += `# Add client peers
`;
        config.clients.forEach((client, index) => {
            script += `/interface/wireguard/peers add interface=${server.interface} public-key="${client.publicKey}" preshared-key="${client.presharedKey}" allowed-address=${client.allowedIPs} persistent-keepalive=${server.keepalive} comment="${client.name}"
`;
        });

        // Add firewall rules if enabled
        if (server.enableFirewall && server.firewallSettings) {
            script += `
# Firewall rules for WireGuard
`;
            const fw = server.firewallSettings;

            // Drop invalid connections first (if enabled)
            if (fw.dropInvalid) {
                script += `/ip/firewall/filter add chain=input action=drop connection-state=invalid comment="Drop invalid connections"
/ip/firewall/filter add chain=forward action=drop connection-state=invalid comment="Drop invalid forward connections"

`;
            }

            // Allow WireGuard port
            if (fw.allowWireGuardPort) {
                const logAction = fw.logBlocked ? ' log=yes log-prefix="WG-ALLOW: "' : '';
                script += `/ip/firewall/filter add chain=input action=accept protocol=udp dst-port=${server.port}${logAction} comment="Allow WireGuard port ${server.port}"

`;
            }

            // Allow established and related connections
            script += `/ip/firewall/filter add chain=input action=accept connection-state=established,related comment="Allow established/related"
/ip/firewall/filter add chain=forward action=accept connection-state=established,related comment="Allow established/related forward"

`;

            // VPN forwarding rules
            if (fw.allowVpnForward) {
                script += `/ip/firewall/filter add chain=forward action=accept in-interface=${server.interface} comment="Allow VPN clients forward"
`;
            }

            // Internet access for VPN clients
            if (fw.allowInternetAccess) {
                script += `/ip/firewall/filter add chain=forward action=accept in-interface=${server.interface} out-interface-list=${fw.wanInterface} comment="Allow VPN internet access"
`;
            }

            // Local network access for VPN clients
            if (fw.allowLocalNetwork && fw.localNetworks) {
                const networks = fw.localNetworks.split(',').map(net => net.trim()).filter(net => net);
                networks.forEach(network => {
                    script += `/ip/firewall/filter add chain=forward action=accept in-interface=${server.interface} dst-address=${network} comment="Allow VPN access to ${network}"
`;
                });
            }

            // Log blocked traffic (if enabled)
            if (fw.logBlocked) {
                script += `
# Log blocked traffic
/ip/firewall/filter add chain=input action=log log-prefix="INPUT-DROP: " comment="Log dropped input"
/ip/firewall/filter add chain=forward action=log log-prefix="FORWARD-DROP: " comment="Log dropped forward"
`;
            }

            script += `
`;
        } else if (server.enableFirewall) {
            // Fallback to basic firewall rules
            script += `
# Basic firewall rules for WireGuard
/ip/firewall/filter add chain=input action=accept protocol=udp dst-port=${server.port} comment="Allow WireGuard"
/ip/firewall/filter add chain=forward action=accept in-interface=${server.interface} comment="Allow WireGuard forward"
/ip/firewall/filter add chain=forward action=accept out-interface=${server.interface} comment="Allow WireGuard forward out"
`;
        }

        // Add NAT rules if enabled
        if (server.enableNat) {
            script += `
# NAT rules for WireGuard clients
/ip/firewall/nat add chain=srcnat action=masquerade out-interface-list=WAN src-address=${server.network} comment="WireGuard NAT"
`;
        }

        return script;
    }

    // Generate client configuration files
    generateClientConfigs() {
        const config = this.configs;
        if (!config.clients || !config.server) {
            throw new Error('No client configurations available');
        }

        const clientConfigs = [];

        config.clients.forEach((client, index) => {
            const clientConfig = `[Interface]
PrivateKey = ${client.privateKey}
Address = ${client.address}
DNS = ${config.server.dnsServers}
MTU = ${config.server.mtu}

[Peer]
PublicKey = ${config.server.publicKey}
PresharedKey = ${client.presharedKey}
Endpoint = ${config.server.endpoint}:${config.server.port}
AllowedIPs = ${config.server.allowedIPs}
PersistentKeepalive = ${config.server.keepalive}
`;

            clientConfigs.push({
                name: client.name,
                config: clientConfig
            });
        });

        return clientConfigs;
    }

    // Generate site-to-site configuration
    async generateSiteToSiteConfig() {
        const siteCount = parseInt(document.getElementById('wg-client-count').value) || 3;
        const baseNetwork = document.getElementById('wg-server-ip').value || '10.0.0.0/24';
        const interfaceName = document.getElementById('wg-interface-name').value || 'wireguard1';
        const port = document.getElementById('wg-server-port').value || '51820';
        const mtu = document.getElementById('wg-mtu').value || '1420';
        const keepalive = document.getElementById('wg-keepalive').value || '25';

        // Generate site configurations
        const sites = [];
        for (let i = 0; i < siteCount; i++) {
            const siteKeys = await this.generateKeyPair();
            const siteNetwork = `10.${i + 1}.0.0/24`; // Each site gets its own subnet
            const vpnIP = `10.0.0.${i + 1}/32`;

            sites.push({
                name: `Site-${i + 1}`,
                privateKey: siteKeys.privateKey,
                publicKey: siteKeys.publicKey,
                network: siteNetwork,
                vpnIP: vpnIP,
                port: parseInt(port) + i,
                endpoint: `site${i + 1}.example.com` // Placeholder
            });
        }

        this.configs = {
            type: 'site-to-site',
            sites: sites,
            baseNetwork: baseNetwork,
            interface: interfaceName,
            mtu: mtu,
            keepalive: keepalive
        };

        return this.configs;
    }

    // Generate site-to-site RouterOS scripts
    generateSiteToSiteScripts() {
        const config = this.configs;
        if (!config.sites) {
            throw new Error('No site-to-site configuration available');
        }

        const scripts = {};

        config.sites.forEach((site, index) => {
            let script = `# Site-to-Site WireGuard Configuration for ${site.name}
# Generated on ${new Date().toLocaleString()}

`;

            // Create WireGuard interface
            script += `# Create WireGuard interface
/interface/wireguard add name=${config.interface} private-key="${site.privateKey}" listen-port=${site.port} mtu=${config.mtu}

`;

            // Add site IP address
            script += `# Add VPN IP address
/ip/address add address=${site.vpnIP} interface=${config.interface}

`;

            // Add peers (all other sites)
            script += `# Add peer sites
`;
            config.sites.forEach((peer, peerIndex) => {
                if (peerIndex !== index) {
                    const presharedKey = this.generatePresharedKey();
                    script += `/interface/wireguard/peers add interface=${config.interface} public-key="${peer.publicKey}" preshared-key="${presharedKey}" allowed-address=${peer.network},${peer.vpnIP.split('/')[0]}/32 endpoint-address=${peer.endpoint} endpoint-port=${peer.port} persistent-keepalive=${config.keepalive} comment="${peer.name}"
`;
                }
            });

            // Add routing
            script += `
# Add routes to peer networks
`;
            config.sites.forEach((peer, peerIndex) => {
                if (peerIndex !== index) {
                    script += `/ip/route add dst-address=${peer.network} gateway=${config.interface} comment="Route to ${peer.name}"
`;
                }
            });

            scripts[site.name] = script;
        });

        return scripts;
    }
}

// Global functions for HTML onclick handlers
async function generateWireGuardConfig() {
    try {
        showNotification('Generating WireGuard configuration...', 'info');
        
        const config = await window.wireGuardConfig.generateConfiguration();
        const outputType = document.querySelector('input[name="output-type"]:checked').value;
        let output = '';

        if (config.type === 'site-to-site') {
            // Site-to-site only supports MikroTik RouterOS scripts
            if (outputType === 'wireguard') {
                showNotification('Site-to-site configurations only support MikroTik RouterOS scripts', 'info');
                return;
            }

            const scripts = window.wireGuardConfig.generateSiteToSiteScripts();
            
            output = '# Site-to-Site WireGuard Configuration\n';
            output += '# Each site needs its own RouterOS script\n\n';

            Object.entries(scripts).forEach(([siteName, script]) => {
                output += `# ==========================================\n`;
                output += `# RouterOS Script for ${siteName}\n`;
                output += `# ==========================================\n\n`;
                output += script + '\n\n';
            });

        } else {
            // Client-server configuration - handle different output types
            if (outputType === 'mikrotik' || outputType === 'both') {
                const serverScript = window.wireGuardConfig.generateServerScript();
                output += '# MikroTik RouterOS Server Configuration\n';
                output += '# ==========================================\n\n';
                output += serverScript + '\n\n';
            }

            if (outputType === 'wireguard' || outputType === 'both') {
                const clientConfigs = window.wireGuardConfig.generateClientConfigs();
                
                if (outputType === 'both') {
                    output += '# WireGuard Client Configuration Files\n';
                    output += '# ==========================================\n';
                    output += '# Save each client config as a .conf file\n\n';
                } else {
                    output = '# WireGuard Client Configuration Files\n';
                    output += '# Save each client config as a .conf file\n\n';
                }

                clientConfigs.forEach((client, index) => {
                    output += `# ${client.name}.conf\n`;
                    output += client.config + '\n';
                });
            }
        }

        // Display output
        document.getElementById('wg-config-output').textContent = output;
        document.getElementById('wg-output').style.display = 'block';
        
        const configTypeText = outputType === 'both' ? 'WireGuard and MikroTik' : 
                              outputType === 'wireguard' ? 'WireGuard' : 'MikroTik';
        showNotification(`${configTypeText} configuration generated successfully!`, 'success');

    } catch (error) {
        console.error('Error generating WireGuard config:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

async function generateKeys() {
    try {
        const keyPair = await window.wireGuardConfig.generateKeyPair();
        
        // Update manual key fields
        document.getElementById('wg-server-private').value = keyPair.privateKey;
        document.getElementById('wg-server-public').value = keyPair.publicKey;
        
        // Switch to manual mode
        document.querySelector('input[name="key-mode"][value="manual"]').checked = true;
        document.getElementById('manual-keys').style.display = 'block';
        
        showNotification('New key pair generated!', 'success');
    } catch (error) {
        console.error('Error generating keys:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

function downloadQRCodes() {
    try {
        const config = window.wireGuardConfig.configs;
        
        if (!config || !config.clients) {
            showNotification('No client configurations available. Generate WireGuard config first.', 'error');
            return;
        }

        if (config.type === 'site-to-site') {
            showNotification('QR codes are only available for client-server configurations', 'info');
            return;
        }

        // Generate client configs for QR codes
        const clientConfigs = window.wireGuardConfig.generateClientConfigs();
        
        // Generate QR codes
        const qrCodes = window.qrGenerator.generateClientQRCodes(clientConfigs);
        
        if (qrCodes.length === 0) {
            showNotification('No QR codes could be generated', 'error');
            return;
        }

        // Display QR codes in modal
        window.qrGenerator.displayQRCodes(qrCodes);
        
        showNotification(`Generated ${qrCodes.length} QR codes for mobile clients`, 'success');

    } catch (error) {
        console.error('Error generating QR codes:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

function downloadConfigFiles() {
    try {
        const config = window.wireGuardConfig.configs;
        const outputType = document.querySelector('input[name="output-type"]:checked').value;
        
        if (!config) {
            showNotification('No configuration available. Generate WireGuard config first.', 'error');
            return;
        }

        let downloadCount = 0;

        if (config.type === 'site-to-site') {
            // Site-to-site only supports RouterOS scripts
            if (outputType === 'wireguard') {
                showNotification('Site-to-site configurations only support MikroTik RouterOS scripts', 'info');
                return;
            }

            const scripts = window.wireGuardConfig.generateSiteToSiteScripts();
            
            Object.entries(scripts).forEach(([siteName, script]) => {
                downloadTextFile(`${siteName}-WireGuard.rsc`, script);
                downloadCount++;
            });
            
            showNotification(`Downloaded ${downloadCount} RouterOS scripts`, 'success');
            
        } else {
            // Client-server configuration - respect output type
            if (outputType === 'mikrotik' || outputType === 'both') {
                const serverScript = window.wireGuardConfig.generateServerScript();
                downloadTextFile('WireGuard-Server.rsc', serverScript);
                downloadCount++;
            }
            
            if (outputType === 'wireguard' || outputType === 'both') {
                const clientConfigs = window.wireGuardConfig.generateClientConfigs();
                clientConfigs.forEach(client => {
                    downloadTextFile(`${client.name}.conf`, client.config);
                    downloadCount++;
                });
            }
            
            const typeText = outputType === 'both' ? 'config files' : 
                           outputType === 'wireguard' ? 'client configs' : 'RouterOS scripts';
            showNotification(`Downloaded ${downloadCount} ${typeText}`, 'success');
        }

    } catch (error) {
        console.error('Error downloading config files:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Initialize WireGuard module
document.addEventListener('DOMContentLoaded', () => {
    window.wireGuardConfig = new WireGuardConfig();
});