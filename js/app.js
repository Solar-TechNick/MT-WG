/**
 * Modern WireGuard MikroTik Configurator
 * Main Application Controller
 */

class WireGuardMikroTikApp {
    constructor() {
        this.config = {
            serverKeys: {},
            clientKeys: [],
            siteKeys: [],
            theme: 'dark'
        };
        
        this.init();
    }

    init() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeTheme();
        this.generateInitialKeys();
        this.updateClientSubnet();
        this.showPage('wireguard');
        
        // Initialize tooltips after everything is loaded
        setTimeout(() => {
            this.initializeTooltips();
        }, 500);
    }

    initializeElements() {
        // Theme elements
        this.themeToggle = document.getElementById('themeToggle');
        
        // Navigation elements
        this.navButtons = document.querySelectorAll('.nav-button');
        this.pageContents = document.querySelectorAll('.page-content');
        
        // Configuration type elements
        this.configTypeRadios = document.querySelectorAll('input[name="configType"]');
        this.serverConfig = document.getElementById('server-config');
        this.clientConfig = document.getElementById('client-config');
        this.siteConfig = document.getElementById('site-config');
        
        // Form elements
        this.serverName = document.getElementById('serverName');
        this.serverIP = document.getElementById('serverIP');
        this.listenPort = document.getElementById('listenPort');
        this.publicEndpoint = document.getElementById('publicEndpoint');
        
        // Key management elements
        this.toggleServerKeys = document.getElementById('toggleServerKeys');
        this.serverKeysManual = document.getElementById('serverKeysManual');
        this.serverKeysAuto = document.getElementById('serverKeysAuto');
        this.serverPrivateKey = document.getElementById('serverPrivateKey');
        this.serverPublicKey = document.getElementById('serverPublicKey');
        
        this.numClients = document.getElementById('numClients');
        this.clientSubnet = document.getElementById('clientSubnet');
        this.dnsServers = document.getElementById('dnsServers');
        this.allowedIPs = document.getElementById('allowedIPs');
        
        this.toggleClientKeys = document.getElementById('toggleClientKeys');
        this.clientKeysManagement = document.getElementById('clientKeysManagement');
        this.enableIndividualPSK = document.getElementById('enableIndividualPSK');
        this.clientKeysList = document.getElementById('clientKeysList');
        
        // Site-to-site elements
        this.numSites = document.getElementById('numSites');
        this.transferSubnet = document.getElementById('transferSubnet');
        this.sitesContainer = document.getElementById('sitesContainer');
        
        // RouterOS settings
        this.interfaceName = document.getElementById('interfaceName');
        this.globalPSK = document.getElementById('globalPSK');
        this.localNetwork = document.getElementById('localNetwork');
        
        // Advanced options
        this.enablePSK = document.getElementById('enablePSK');
        this.noRoutingTable = document.getElementById('noRoutingTable');
        this.enableNAT = document.getElementById('enableNAT');
        this.generateFirewall = document.getElementById('generateFirewall');
        this.mtu = document.getElementById('mtu');
        this.keepalive = document.getElementById('keepalive');
        
        // Action buttons
        this.generateKeys = document.getElementById('generateKeys');
        this.generateConfig = document.getElementById('generateConfig');
        
        // Output elements
        this.outputSection = document.getElementById('outputSection');
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.wireguardOutput = document.getElementById('wireguardOutput');
        this.mikrotikOutput = document.getElementById('mikrotikOutput');
        this.qrOutput = document.getElementById('qrOutput');
    }

    attachEventListeners() {
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('change', () => this.toggleTheme());
        }
        
        // Navigation
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            });
        });
        
        // Configuration type change
        this.configTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleConfigTypeChange());
        });
        
        // Key management toggles
        if (this.toggleServerKeys) {
            this.toggleServerKeys.addEventListener('click', () => this.toggleServerKeyManagement());
        }
        
        if (this.toggleClientKeys) {
            this.toggleClientKeys.addEventListener('click', () => this.toggleClientKeyManagement());
        }
        
        // Dynamic field updates
        if (this.serverIP) {
            this.serverIP.addEventListener('input', () => this.updateClientSubnet());
        }
        
        if (this.numClients) {
            this.numClients.addEventListener('change', () => this.updateClientKeysList());
        }
        
        if (this.numSites) {
            this.numSites.addEventListener('change', () => this.updateSitesContainer());
        }
        
        // Action buttons
        if (this.generateKeys) {
            this.generateKeys.addEventListener('click', () => this.generateNewKeys());
        }
        
        if (this.generateConfig) {
            this.generateConfig.addEventListener('click', () => this.generateConfiguration());
        }
        
        // Output tabs
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.showOutputTab(tab);
            });
        });
        
        // Input validation
        this.setupInputValidation();
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        if (this.themeToggle) {
            this.themeToggle.checked = savedTheme === 'dark';
        }
    }

    toggleTheme() {
        const newTheme = this.config.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        this.config.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (this.themeToggle) {
            this.themeToggle.checked = theme === 'dark';
        }
    }

    showPage(pageName) {
        // Hide all pages
        this.pageContents.forEach(page => {
            page.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        this.navButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected page
        const selectedPage = document.getElementById(`${pageName}-page`);
        if (selectedPage) {
            selectedPage.classList.add('active');
            selectedPage.classList.add('fade-in');
        }
        
        // Activate corresponding nav button
        const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    handleConfigTypeChange() {
        const selectedType = document.querySelector('input[name="configType"]:checked')?.value;
        
        if (selectedType === 'site-to-site') {
            this.clientConfig.classList.add('hidden');
            this.siteConfig.classList.remove('hidden');
            this.updateSitesContainer();
        } else {
            this.siteConfig.classList.add('hidden');
            this.clientConfig.classList.remove('hidden');
            this.updateClientKeysList();
        }
    }

    toggleServerKeyManagement() {
        const isManual = !this.serverKeysManual.classList.contains('hidden');
        
        if (isManual) {
            this.serverKeysManual.classList.add('hidden');
            this.serverKeysAuto.classList.remove('hidden');
            this.toggleServerKeys.textContent = 'Manual Input';
        } else {
            this.serverKeysManual.classList.remove('hidden');
            this.serverKeysAuto.classList.add('hidden');
            this.toggleServerKeys.textContent = 'Auto Generate';
        }
    }

    toggleClientKeyManagement() {
        const isVisible = !this.clientKeysManagement.classList.contains('hidden');
        
        if (isVisible) {
            this.clientKeysManagement.classList.add('hidden');
            this.toggleClientKeys.textContent = 'Manage Keys';
        } else {
            this.clientKeysManagement.classList.remove('hidden');
            this.toggleClientKeys.textContent = 'Hide Keys';
            this.updateClientKeysList();
        }
    }

    updateClientSubnet() {
        if (!this.serverIP || !this.clientSubnet) return;
        
        const serverIP = this.serverIP.value;
        const match = serverIP.match(/^(\d+\.\d+\.\d+)\.\d+\/(\d+)$/);
        
        if (match) {
            const [, networkBase, cidr] = match;
            this.clientSubnet.value = `${networkBase}.2-${networkBase}.254/${cidr}`;
        }
    }

    updateClientKeysList() {
        if (!this.clientKeysList) return;
        
        const numClients = parseInt(this.numClients.value) || 0;
        this.clientKeysList.innerHTML = '';
        
        for (let i = 1; i <= numClients; i++) {
            const clientDiv = document.createElement('div');
            clientDiv.className = 'client-key-item';
            clientDiv.innerHTML = `
                <h5>Client ${i}</h5>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="client${i}Name">Client Name</label>
                        <input type="text" id="client${i}Name" value="Client-${i}" placeholder="Client name">
                    </div>
                    <div class="form-group">
                        <label for="client${i}PrivateKey">Private Key</label>
                        <input type="text" id="client${i}PrivateKey" placeholder="Auto-generated" readonly>
                    </div>
                    <div class="form-group">
                        <label for="client${i}PublicKey">Public Key</label>
                        <input type="text" id="client${i}PublicKey" placeholder="Auto-generated" readonly>
                    </div>
                    ${this.enableIndividualPSK?.checked ? `
                    <div class="form-group">
                        <label for="client${i}PSK">Pre-Shared Key</label>
                        <input type="text" id="client${i}PSK" placeholder="Auto-generated" readonly>
                    </div>
                    ` : ''}
                </div>
            `;
            this.clientKeysList.appendChild(clientDiv);
        }
    }

    updateSitesContainer() {
        if (!this.sitesContainer) return;
        
        const numSites = parseInt(this.numSites.value) || 0;
        this.sitesContainer.innerHTML = '';
        
        for (let i = 1; i <= numSites; i++) {
            const siteDiv = document.createElement('div');
            siteDiv.className = 'site-item section';
            siteDiv.innerHTML = `
                <h4>Site ${i} Configuration</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="site${i}Name">Site Name</label>
                        <input type="text" id="site${i}Name" value="Site-${i}" placeholder="Site name">
                    </div>
                    <div class="form-group">
                        <label for="site${i}Endpoint">Public Endpoint</label>
                        <input type="text" id="site${i}Endpoint" placeholder="site${i}.example.com or IP">
                    </div>
                    <div class="form-group">
                        <label for="site${i}LocalNetwork">Local Network</label>
                        <input type="text" id="site${i}LocalNetwork" value="192.168.${i}.0/24" placeholder="192.168.${i}.0/24">
                    </div>
                    <div class="form-group">
                        <label for="site${i}ListenPort">Listen Port</label>
                        <input type="number" id="site${i}ListenPort" value="${51820 + i - 1}" min="1024" max="65535">
                    </div>
                    <div class="form-group">
                        <label for="site${i}DDNS">Dynamic DNS (DDNS)</label>
                        <input type="text" id="site${i}DDNS" placeholder="Optional DDNS hostname">
                        <small>For sites with dynamic IP addresses</small>
                    </div>
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" id="site${i}EnableDDNS">
                            Enable DDNS Updates
                        </label>
                    </div>
                </div>
            `;
            this.sitesContainer.appendChild(siteDiv);
        }
    }

    async generateInitialKeys() {
        try {
            if (window.WireGuardCrypto) {
                this.config.serverKeys = await window.WireGuardCrypto.generateKeyPair();
            }
        } catch (error) {
            console.warn('Could not generate initial keys:', error);
        }
    }

    async generateNewKeys() {
        try {
            if (!window.WireGuardCrypto) {
                throw new Error('Crypto module not available');
            }

            // Generate server keys
            this.config.serverKeys = await window.WireGuardCrypto.generateKeyPair();
            
            if (this.serverPrivateKey) {
                this.serverPrivateKey.value = this.config.serverKeys.privateKey;
            }
            if (this.serverPublicKey) {
                this.serverPublicKey.value = this.config.serverKeys.publicKey;
            }

            // Generate client keys
            const numClients = parseInt(this.numClients?.value) || 0;
            this.config.clientKeys = [];
            
            for (let i = 0; i < numClients; i++) {
                const keyPair = await window.WireGuardCrypto.generateKeyPair();
                const psk = this.enableIndividualPSK?.checked ? 
                    await window.WireGuardCrypto.generatePresharedKey() : null;
                
                this.config.clientKeys.push({
                    name: `Client-${i + 1}`,
                    ...keyPair,
                    psk
                });

                // Update UI
                const privateKeyInput = document.getElementById(`client${i + 1}PrivateKey`);
                const publicKeyInput = document.getElementById(`client${i + 1}PublicKey`);
                const pskInput = document.getElementById(`client${i + 1}PSK`);
                
                if (privateKeyInput) privateKeyInput.value = keyPair.privateKey;
                if (publicKeyInput) publicKeyInput.value = keyPair.publicKey;
                if (pskInput && psk) pskInput.value = psk;
            }

            this.showNotification('New keys generated successfully!', 'success');
            
        } catch (error) {
            console.error('Key generation failed:', error);
            this.showNotification('Failed to generate keys: ' + error.message, 'error');
        }
    }

    async generateConfiguration() {
        try {
            if (!window.WireGuardGenerator) {
                throw new Error('WireGuard generator not available');
            }

            // Collect configuration data
            const configData = this.collectConfigurationData();
            
            // Generate configurations
            const result = await window.WireGuardGenerator.generate(configData);
            
            // Display output
            this.displayConfigurations(result);
            
            // Show output section
            this.outputSection.classList.remove('hidden');
            this.outputSection.scrollIntoView({ behavior: 'smooth' });
            
            this.showNotification('Configuration generated successfully!', 'success');
            
        } catch (error) {
            console.error('Configuration generation failed:', error);
            this.showNotification('Failed to generate configuration: ' + error.message, 'error');
        }
    }

    collectConfigurationData() {
        const configType = document.querySelector('input[name="configType"]:checked')?.value || 'client-server';
        
        const data = {
            type: configType,
            server: {
                name: this.serverName?.value || 'WireGuard Server',
                ip: this.serverIP?.value || '10.0.0.1/24',
                port: parseInt(this.listenPort?.value) || 51820,
                endpoint: this.publicEndpoint?.value || '',
                keys: this.config.serverKeys
            },
            interface: {
                name: this.interfaceName?.value || 'wireguard1',
                mtu: parseInt(this.mtu?.value) || 1420
            },
            options: {
                enablePSK: this.enablePSK?.checked || false,
                noRoutingTable: this.noRoutingTable?.checked || false,
                enableNAT: this.enableNAT?.checked || true,
                generateFirewall: this.generateFirewall?.checked || true,
                keepalive: parseInt(this.keepalive?.value) || 25
            },
            dns: this.dnsServers?.value.split(',').map(s => s.trim()) || ['1.1.1.1', '8.8.8.8'],
            allowedIPs: this.allowedIPs?.value || '0.0.0.0/0'
        };

        if (configType === 'client-server') {
            data.clients = this.config.clientKeys.map((client, index) => ({
                ...client,
                name: document.getElementById(`client${index + 1}Name`)?.value || client.name,
                ip: this.generateClientIP(index + 1)
            }));
        } else {
            data.sites = this.collectSiteData();
        }

        return data;
    }

    collectSiteData() {
        const numSites = parseInt(this.numSites?.value) || 0;
        const sites = [];
        
        for (let i = 1; i <= numSites; i++) {
            const site = {
                name: document.getElementById(`site${i}Name`)?.value || `Site-${i}`,
                endpoint: document.getElementById(`site${i}Endpoint`)?.value || '',
                localNetwork: document.getElementById(`site${i}LocalNetwork`)?.value || `192.168.${i}.0/24`,
                listenPort: parseInt(document.getElementById(`site${i}ListenPort`)?.value) || (51820 + i - 1),
                ddns: document.getElementById(`site${i}DDNS`)?.value || '',
                enableDDNS: document.getElementById(`site${i}EnableDDNS`)?.checked || false
            };
            sites.push(site);
        }
        
        return sites;
    }

    generateClientIP(clientNumber) {
        const serverIP = this.serverIP?.value || '10.0.0.1/24';
        const match = serverIP.match(/^(\d+\.\d+\.\d+)\.\d+\/(\d+)$/);
        
        if (match) {
            const [, networkBase, cidr] = match;
            return `${networkBase}.${clientNumber + 1}/${cidr}`;
        }
        
        return `10.0.0.${clientNumber + 1}/24`;
    }

    displayConfigurations(result) {
        // Display WireGuard configurations
        if (this.wireguardOutput && result.wireguard) {
            this.wireguardOutput.innerHTML = this.formatWireGuardOutput(result.wireguard);
        }
        
        // Display MikroTik scripts
        if (this.mikrotikOutput && result.mikrotik) {
            this.mikrotikOutput.innerHTML = this.formatMikroTikOutput(result.mikrotik);
        }
        
        // Display QR codes
        if (this.qrOutput && result.qrCodes) {
            this.displayQRCodes(result.qrCodes);
        }
    }

    formatWireGuardOutput(configs) {
        return configs.map(config => `
            <div class="config-section">
                <div class="config-header">
                    <h4>${config.name}</h4>
                    <button class="copy-btn" onclick="app.copyToClipboard('${config.name}', \`${config.content.replace(/`/g, '\\`')}\`)">Copy</button>
                </div>
                <div class="config-content">
                    <pre>${config.content}</pre>
                </div>
            </div>
        `).join('');
    }

    formatMikroTikOutput(scripts) {
        return scripts.map(script => `
            <div class="config-section">
                <div class="config-header">
                    <h4>${script.name}</h4>
                    <button class="copy-btn" onclick="app.copyToClipboard('${script.name}', \`${script.content.replace(/`/g, '\\`')}\`)">Copy</button>
                </div>
                <div class="config-content">
                    <pre>${script.content}</pre>
                </div>
            </div>
        `).join('');
    }

    async displayQRCodes(qrData) {
        this.qrOutput.innerHTML = '<div class="qr-container"></div>';
        const container = this.qrOutput.querySelector('.qr-container');
        
        for (const qr of qrData) {
            const qrDiv = document.createElement('div');
            qrDiv.className = 'qr-item';
            qrDiv.innerHTML = `
                <h4>${qr.name}</h4>
                <canvas id="qr-${qr.name.replace(/\s+/g, '-')}"></canvas>
                <button class="copy-btn" onclick="app.copyToClipboard('${qr.name}', \`${qr.content.replace(/`/g, '\\`')}\`)">Copy Config</button>
            `;
            container.appendChild(qrDiv);
            
            // Generate QR code
            const canvas = qrDiv.querySelector('canvas');
            if (window.QRCode) {
                try {
                    await window.QRCode.toCanvas(canvas, qr.content, {
                        width: 200,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });
                } catch (error) {
                    console.error('QR code generation failed:', error);
                }
            }
        }
    }

    showOutputTab(tabName) {
        // Hide all tab contents
        this.tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Activate corresponding tab button
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    async copyToClipboard(name, content) {
        try {
            await navigator.clipboard.writeText(content);
            this.showNotification(`${name} copied to clipboard!`, 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showNotification('Copy failed. Please copy manually.', 'error');
        }
    }

    setupInputValidation() {
        // IP validation
        const ipInputs = document.querySelectorAll('input[type="text"]');
        ipInputs.forEach(input => {
            if (input.id.includes('IP') || input.id.includes('Network') || input.id.includes('Subnet')) {
                input.addEventListener('blur', (e) => this.validateIP(e.target));
            }
        });
        
        // Port validation
        const portInputs = document.querySelectorAll('input[type="number"]');
        portInputs.forEach(input => {
            if (input.id.includes('Port')) {
                input.addEventListener('input', (e) => this.validatePort(e.target));
            }
        });
    }

    validateIP(input) {
        const value = input.value.trim();
        if (!value) return;
        
        const isValid = this.isValidIPOrCIDR(value);
        
        if (isValid) {
            input.classList.remove('error');
            input.classList.add('valid');
        } else {
            input.classList.add('error');
            input.classList.remove('valid');
        }
    }

    validatePort(input) {
        const value = parseInt(input.value);
        const min = parseInt(input.min) || 1;
        const max = parseInt(input.max) || 65535;
        
        if (value >= min && value <= max) {
            input.classList.remove('error');
            input.classList.add('valid');
        } else {
            input.classList.add('error');
            input.classList.remove('valid');
        }
    }

    isValidIPOrCIDR(value) {
        // Basic IP/CIDR validation
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
        return ipRegex.test(value);
    }

    initializeTooltips() {
        // Tooltips are handled by CSS :hover
        console.log('Tooltips initialized');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WireGuardMikroTikApp();
});

// Expose global functions for onclick handlers
window.showPage = (page) => window.app?.showPage(page);
window.showOutputTab = (tab) => window.app?.showOutputTab(tab);