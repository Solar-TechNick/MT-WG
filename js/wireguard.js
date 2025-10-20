/**
 * WireGuard Configuration Generator
 * Generates WireGuard configs, MikroTik scripts, and QR codes
 */

class WireGuardGenerator {
    constructor() {
        this.configs = {};
    }

    /**
     * Generate all configurations based on input data
     * @param {object} data Configuration data
     * @returns {Promise<object>} Generated configurations
     */
    async generate(data) {
        try {
            this.validateInputData(data);
            
            let result = {};
            
            if (data.type === 'client-server') {
                result = await this.generateClientServerConfigs(data);
            } else if (data.type === 'site-to-site') {
                result = await this.generateSiteToSiteConfigs(data);
            } else {
                throw new Error('Invalid configuration type');
            }
            
            return result;
            
        } catch (error) {
            console.error('Configuration generation failed:', error);
            throw error;
        }
    }

    /**
     * Validate input configuration data
     * @param {object} data 
     */
    validateInputData(data) {
        if (!data) throw new Error('Configuration data is required');
        if (!data.type) throw new Error('Configuration type is required');
        if (!data.server) throw new Error('Server configuration is required');
        if (!data.server.keys || !data.server.keys.privateKey) {
            throw new Error('Server keys are required');
        }
    }

    /**
     * Generate client-server configurations
     * @param {object} data 
     * @returns {Promise<object>}
     */
    async generateClientServerConfigs(data) {
        const serverConfig = this.createServerConfig(data);
        const clientConfigs = await this.createClientConfigs(data);
        const mikrotikScript = this.createMikroTikClientServerScript(data, serverConfig, clientConfigs);
        const qrCodes = await this.createQRCodes(clientConfigs);
        
        // Generate VyOS configurations
        let vyosConfigs = [];
        if (window.VyOSGenerator) {
            vyosConfigs = window.VyOSGenerator.generate(data);
        }
        
        // Generate OPNsense configurations
        let opnsenseConfigs = [];
        if (window.OPNsenseGenerator) {
            opnsenseConfigs = window.OPNsenseGenerator.generate(data);
        }

        return {
            wireguard: [
                {
                    name: 'Server Configuration',
                    content: this.formatWireGuardConfig(serverConfig, 'server')
                },
                ...clientConfigs.map((client, index) => ({
                    name: `Client ${index + 1} Configuration`,
                    content: this.formatWireGuardConfig(client, 'client')
                }))
            ],
            mikrotik: [
                {
                    name: 'MikroTik RouterOS Script',
                    content: mikrotikScript
                }
            ],
            vyos: vyosConfigs,
            opnsense: opnsenseConfigs,
            qrCodes: qrCodes
        };
    }

    /**
     * Generate site-to-site configurations
     * @param {object} data 
     * @returns {Promise<object>}
     */
    async generateSiteToSiteConfigs(data) {
        const siteConfigs = await this.createSiteConfigs(data);
        const mikrotikScripts = this.createMikroTikSiteToSiteScripts(data, siteConfigs);
        
        // Generate VyOS configurations
        let vyosConfigs = [];
        if (window.VyOSGenerator) {
            vyosConfigs = window.VyOSGenerator.generate(data);
        }
        
        // Generate OPNsense configurations
        let opnsenseConfigs = [];
        if (window.OPNsenseGenerator) {
            opnsenseConfigs = window.OPNsenseGenerator.generate(data);
        }

        return {
            wireguard: siteConfigs.map((site, index) => ({
                name: `Site ${index + 1} Configuration`,
                content: this.formatWireGuardConfig(site, 'site')
            })),
            mikrotik: mikrotikScripts.map((script, index) => ({
                name: `Site ${index + 1} MikroTik Script`,
                content: script
            })),
            vyos: vyosConfigs,
            opnsense: opnsenseConfigs,
            qrCodes: [] // Sites typically don't use QR codes
        };
    }

    /**
     * Create server configuration
     * @param {object} data 
     * @returns {object}
     */
    createServerConfig(data) {
        const peers = [];
        
        if (data.clients) {
            data.clients.forEach((client, index) => {
                const peer = {
                    comment: client.name || `Client-${index + 1}`,
                    publicKey: client.publicKey,
                    allowedIPs: client.ip
                };
                
                if (client.psk) {
                    peer.preSharedKey = client.psk;
                }
                
                peers.push(peer);
            });
        }

        return {
            name: data.server.name,
            interface: {
                privateKey: data.server.keys.privateKey,
                address: data.server.ip,
                listenPort: data.server.port,
                mtu: data.interface?.mtu || 1420
            },
            peers: peers,
            options: data.options || {}
        };
    }

    /**
     * Create client configurations
     * @param {object} data 
     * @returns {Promise<Array>}
     */
    async createClientConfigs(data) {
        const configs = [];
        
        if (!data.clients || data.clients.length === 0) {
            return configs;
        }

        for (let i = 0; i < data.clients.length; i++) {
            const client = data.clients[i];
            
            // Generate client keys if they don't exist or are empty
            let clientPrivateKey = client.privateKey;
            let clientPublicKey = client.publicKey;
            let clientPSK = client.psk;
            
            if (!clientPrivateKey || clientPrivateKey.trim() === '') {
                console.log(`Generating keys for ${client.name}`);
                const keys = await window.WireGuardCrypto.generateKeyPair();
                clientPrivateKey = keys.privateKey;
                clientPublicKey = keys.publicKey;
            }
            
            if (client.psk !== null && (!clientPSK || clientPSK.trim() === '')) {
                clientPSK = await window.WireGuardCrypto.generatePresharedKey();
            }
            
            const config = {
                name: client.name || `Client-${i + 1}`,
                interface: {
                    privateKey: clientPrivateKey,
                    address: client.ip,
                    dns: client.dns || data.dns || [],  // Use per-client DNS or fallback to global
                    mtu: data.interface?.mtu || 1420
                },
                peer: {
                    comment: data.server.name,
                    publicKey: data.server.keys.publicKey,
                    endpoint: `${data.server.endpoint}:${data.server.port}`,
                    allowedIPs: client.allowedIPs || data.allowedIPs || '0.0.0.0/0',  // Use per-client AllowedIPs or fallback to global
                    persistentKeepalive: data.options?.keepalive || 25
                }
            };
            
            if (clientPSK) {
                config.peer.preSharedKey = clientPSK;
            }
            
            configs.push(config);
        }
        
        return configs;
    }

    /**
     * Create site configurations for site-to-site
     * @param {object} data 
     * @returns {Promise<Array>}
     */
    async createSiteConfigs(data) {
        const configs = [];
        
        if (!data.sites || data.sites.length === 0) {
            return configs;
        }

        // Generate keys for each site if not provided
        for (let i = 0; i < data.sites.length; i++) {
            const site = data.sites[i];
            
            if (!site.keys) {
                site.keys = await window.WireGuardCrypto.generateKeyPair();
            }
        }

        // Create configuration for each site
        for (let i = 0; i < data.sites.length; i++) {
            const site = data.sites[i];
            const peers = [];
            
            // Add all other sites as peers
            for (let j = 0; j < data.sites.length; j++) {
                if (i !== j) {
                    const peerSite = data.sites[j];
                    peers.push({
                        comment: peerSite.name,
                        publicKey: peerSite.keys.publicKey,
                        endpoint: peerSite.ddns || `${peerSite.endpoint}:${peerSite.listenPort}`,
                        allowedIPs: peerSite.localNetwork,
                        persistentKeepalive: data.options?.keepalive || 25
                    });
                }
            }
            
            const config = {
                name: site.name,
                interface: {
                    privateKey: site.keys.privateKey,
                    address: this.generateSiteTransferIP(data.transferSubnet || '10.2.2.0/24', i),
                    listenPort: site.listenPort,
                    mtu: data.interface?.mtu || 1420
                },
                peers: peers,
                localNetwork: site.localNetwork,
                ddns: site.ddns,
                enableDDNS: site.enableDDNS
            };
            
            configs.push(config);
        }
        
        return configs;
    }

    /**
     * Generate transfer IP for site-to-site
     * @param {string} transferSubnet 
     * @param {number} siteIndex 
     * @returns {string}
     */
    generateSiteTransferIP(transferSubnet, siteIndex) {
        const [network, cidr] = transferSubnet.split('/');
        const parts = network.split('.');
        parts[3] = (parseInt(parts[3]) + siteIndex + 1).toString();
        return `${parts.join('.')}/${cidr}`;
    }

    /**
     * Format WireGuard configuration file
     * @param {object} config 
     * @param {string} type 
     * @returns {string}
     */
    formatWireGuardConfig(config, type) {
        let content = `# ${config.name}\n# Generated by WireGuard MikroTik Configurator\n\n`;
        
        // Interface section
        content += '[Interface]\n';
        content += `PrivateKey = ${config.interface.privateKey}\n`;
        content += `Address = ${config.interface.address}\n`;
        
        if (config.interface.listenPort) {
            content += `ListenPort = ${config.interface.listenPort}\n`;
        }
        
        if (config.interface.dns && config.interface.dns.length > 0) {
            content += `DNS = ${config.interface.dns.join(', ')}\n`;
        }
        
        if (config.interface.mtu) {
            content += `MTU = ${config.interface.mtu}\n`;
        }
        
        // Add PostUp/PostDown for routing if needed
        if (type === 'server' && config.options?.enableNAT) {
            const iface = config.interface.address.split('/')[0];
            content += `PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\n`;
            content += `PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE\n`;
        }
        
        content += '\n';
        
        // Peer sections
        if (config.peers) {
            config.peers.forEach(peer => {
                content += '[Peer]\n';
                if (peer.comment) {
                    content += `# ${peer.comment}\n`;
                }
                content += `PublicKey = ${peer.publicKey}\n`;
                if (peer.preSharedKey) {
                    content += `PresharedKey = ${peer.preSharedKey}\n`;
                }
                content += `AllowedIPs = ${peer.allowedIPs}\n`;
                if (peer.endpoint) {
                    content += `Endpoint = ${peer.endpoint}\n`;
                }
                if (peer.persistentKeepalive) {
                    content += `PersistentKeepalive = ${peer.persistentKeepalive}\n`;
                }
                content += '\n';
            });
        }
        
        // Single peer for client configs
        if (config.peer) {
            content += '[Peer]\n';
            if (config.peer.comment) {
                content += `# ${config.peer.comment}\n`;
            }
            content += `PublicKey = ${config.peer.publicKey}\n`;
            if (config.peer.preSharedKey) {
                content += `PresharedKey = ${config.peer.preSharedKey}\n`;
            }
            content += `AllowedIPs = ${config.peer.allowedIPs}\n`;
            content += `Endpoint = ${config.peer.endpoint}\n`;
            if (config.peer.persistentKeepalive) {
                content += `PersistentKeepalive = ${config.peer.persistentKeepalive}\n`;
            }
        }
        
        return content.trim();
    }

    /**
     * Create MikroTik RouterOS script for client-server
     * @param {object} data 
     * @param {object} serverConfig 
     * @param {Array} clientConfigs 
     * @returns {string}
     */
    createMikroTikClientServerScript(data, serverConfig, clientConfigs) {
        let script = `# MikroTik RouterOS WireGuard Configuration\n`;
        script += `# Generated by WireGuard MikroTik Configurator\n`;
        script += `# Server: ${data.server.name}\n\n`;
        
        // Remove existing WireGuard interface
        script += `# Remove existing WireGuard interface (if any)\n`;
        script += `/interface wireguard remove [find name="${data.interface.name}"]\n\n`;
        
        // Create WireGuard interface
        script += `# Create WireGuard interface\n`;
        script += `/interface wireguard add name="${data.interface.name}" private-key="${serverConfig.interface.privateKey}" listen-port=${data.server.port}`;
        if (data.interface.mtu) {
            script += ` mtu=${data.interface.mtu}`;
        }
        script += `\n\n`;
        
        // Set interface IP address
        script += `# Configure interface IP address\n`;
        script += `/ip address add address=${data.server.ip} interface=${data.interface.name}\n\n`;
        
        // Add peers
        if (clientConfigs.length > 0) {
            script += `# Add WireGuard peers\n`;
            clientConfigs.forEach((client, index) => {
                script += `/interface wireguard peers add interface="${data.interface.name}" `;
                script += `comment="${client.name}" `;
                script += `public-key="${client.peer.publicKey}" `;
                script += `allowed-address="${client.interface.address}"`;
                
                if (client.peer.preSharedKey) {
                    script += ` preshared-key="${client.peer.preSharedKey}"`;
                }
                
                script += `\n`;
            });
            script += `\n`;
        }
        
        // Firewall rules
        if (data.options?.generateFirewall) {
            script += `# Firewall rules\n`;
            script += `/ip firewall filter add chain=input action=accept protocol=udp dst-port=${data.server.port} comment="Allow WireGuard"\n`;
            script += `/ip firewall filter add chain=forward action=accept in-interface=${data.interface.name} comment="Allow WireGuard forward"\n`;
            script += `/ip firewall filter add chain=forward action=accept out-interface=${data.interface.name} comment="Allow WireGuard forward"\n\n`;
        }
        
        // NAT rules
        if (data.options?.enableNAT) {
            script += `# NAT configuration\n`;
            script += `/ip firewall nat add chain=srcnat action=masquerade out-interface-list=WAN comment="WireGuard NAT"\n\n`;
        }
        
        // Routing
        if (!data.options?.noRoutingTable) {
            script += `# Routing (if needed)\n`;
            script += `# Add custom routes here if required\n\n`;
        }
        
        script += `# WireGuard configuration completed\n`;
        script += `# You can now connect clients using the generated configurations\n`;
        
        return script;
    }

    /**
     * Create MikroTik RouterOS scripts for site-to-site
     * @param {object} data 
     * @param {Array} siteConfigs 
     * @returns {Array<string>}
     */
    createMikroTikSiteToSiteScripts(data, siteConfigs) {
        return siteConfigs.map((site, index) => {
            let script = `# MikroTik RouterOS WireGuard Site-to-Site Configuration\n`;
            script += `# Site: ${site.name}\n`;
            script += `# Generated by WireGuard MikroTik Configurator\n\n`;
            
            // Remove existing interface
            script += `# Remove existing WireGuard interface (if any)\n`;
            script += `/interface wireguard remove [find name="${data.interface.name}"]\n\n`;
            
            // Create interface
            script += `# Create WireGuard interface\n`;
            script += `/interface wireguard add name="${data.interface.name}" private-key="${site.interface.privateKey}" listen-port=${site.interface.listenPort}`;
            if (data.interface.mtu) {
                script += ` mtu=${data.interface.mtu}`;
            }
            script += `\n\n`;
            
            // Set IP address
            script += `# Configure interface IP address\n`;
            script += `/ip address add address=${site.interface.address} interface=${data.interface.name}\n\n`;
            
            // Add peers
            if (site.peers.length > 0) {
                script += `# Add WireGuard peers\n`;
                site.peers.forEach(peer => {
                    script += `/interface wireguard peers add interface="${data.interface.name}" `;
                    script += `comment="${peer.comment}" `;
                    script += `public-key="${peer.publicKey}" `;
                    script += `allowed-address="${peer.allowedIPs}" `;
                    script += `endpoint-address="${peer.endpoint.split(':')[0]}" `;
                    script += `endpoint-port=${peer.endpoint.split(':')[1]}`;
                    
                    if (peer.persistentKeepalive) {
                        script += ` persistent-keepalive=${peer.persistentKeepalive}`;
                    }
                    
                    script += `\n`;
                });
                script += `\n`;
            }
            
            // Routes for remote networks
            script += `# Routes to remote sites\n`;
            site.peers.forEach(peer => {
                script += `/ip route add dst-address=${peer.allowedIPs} gateway=${data.interface.name}\n`;
            });
            script += `\n`;
            
            // DDNS configuration if enabled
            if (site.enableDDNS && site.ddns) {
                script += `# Dynamic DNS configuration\n`;
                script += `# Configure your DDNS provider settings here\n`;
                script += `# Example for common providers:\n`;
                script += `# /tool cloud ddns-update-status\n\n`;
            }
            
            // Firewall rules
            if (data.options?.generateFirewall) {
                script += `# Firewall rules\n`;
                script += `/ip firewall filter add chain=input action=accept protocol=udp dst-port=${site.interface.listenPort} comment="Allow WireGuard ${site.name}"\n`;
                script += `/ip firewall filter add chain=forward action=accept in-interface=${data.interface.name} comment="Allow WireGuard ${site.name} forward"\n`;
                script += `/ip firewall filter add chain=forward action=accept out-interface=${data.interface.name} comment="Allow WireGuard ${site.name} forward"\n\n`;
            }
            
            script += `# ${site.name} configuration completed\n`;
            
            return script;
        });
    }

    /**
     * Create QR codes for client configurations
     * @param {Array} clientConfigs 
     * @returns {Promise<Array>}
     */
    async createQRCodes(clientConfigs) {
        const qrCodes = [];
        
        for (const client of clientConfigs) {
            qrCodes.push({
                name: client.name,
                content: this.formatWireGuardConfig(client, 'client')
            });
        }
        
        return qrCodes;
    }

    /**
     * Export configurations as downloadable files
     * @param {object} configurations 
     * @returns {object}
     */
    exportConfigurations(configurations) {
        const files = [];
        
        // WireGuard configurations
        if (configurations.wireguard) {
            configurations.wireguard.forEach(config => {
                files.push({
                    name: `${config.name.replace(/\s+/g, '_')}.conf`,
                    content: config.content,
                    type: 'text/plain'
                });
            });
        }
        
        // MikroTik scripts
        if (configurations.mikrotik) {
            configurations.mikrotik.forEach(script => {
                files.push({
                    name: `${script.name.replace(/\s+/g, '_')}.rsc`,
                    content: script.content,
                    type: 'text/plain'
                });
            });
        }
        
        return files;
    }
}

// Create global instance
window.WireGuardGenerator = new WireGuardGenerator();

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WireGuardGenerator;
}