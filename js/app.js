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
        this.toggleDnsServerFields(); // Initialize DNS fields visibility
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
        
        // LTE elements
        this.lteProvidersContainer = document.getElementById('lteProvidersContainer');
        this.addLteProvider = document.getElementById('addLteProvider');
        this.simPin = document.getElementById('simPin');
        this.lteInterface = document.getElementById('lteInterface');
        this.authMethod = document.getElementById('authMethod');
        this.ipType = document.getElementById('ipType');
        this.enableLteNat = document.getElementById('enableLteNat');
        this.enableLteFirewall = document.getElementById('enableLteFirewall');
        this.setDefaultRoute = document.getElementById('setDefaultRoute');
        this.routeDistance = document.getElementById('routeDistance');
        this.localLanNetwork = document.getElementById('localLanNetwork');
        this.enableLteDns = document.getElementById('enableLteDns');
        this.lteDnsServers = document.getElementById('lteDnsServers');
        this.dnsServersGroup = document.getElementById('dnsServersGroup');
        this.generateLteConfig = document.getElementById('generateLteConfig');
        this.lteScriptOutput = document.getElementById('lteScriptOutput');
        this.lteOutputSection = document.getElementById('lteOutputSection');

        // LTE provider counter
        this.lteProviderCount = 1;

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
        this.vyosOutput = document.getElementById('vyosOutput');
        this.opnsenseOutput = document.getElementById('opnsenseOutput');
        this.qrOutput = document.getElementById('qrOutput');

        // Import elements
        this.configFileInput = document.getElementById('configFileInput');
        this.showPasteArea = document.getElementById('showPasteArea');
        this.clearImport = document.getElementById('clearImport');
        this.pasteArea = document.getElementById('pasteArea');
        this.configTextInput = document.getElementById('configTextInput');
        this.importFromPaste = document.getElementById('importFromPaste');
        this.cancelPaste = document.getElementById('cancelPaste');
        this.importPreview = document.getElementById('importPreview');
        this.importPreviewText = document.getElementById('importPreviewText');
        this.applyImport = document.getElementById('applyImport');
        this.discardImport = document.getElementById('discardImport');

        // Store imported data
        this.importedData = null;
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

        // Import event listeners
        if (this.configFileInput) {
            this.configFileInput.addEventListener('change', (e) => this.handleFileImport(e));
        }
        if (this.showPasteArea) {
            this.showPasteArea.addEventListener('click', () => this.showPasteTextArea());
        }
        if (this.importFromPaste) {
            this.importFromPaste.addEventListener('click', () => this.handleTextImport());
        }
        if (this.cancelPaste) {
            this.cancelPaste.addEventListener('click', () => this.hidePasteTextArea());
        }
        if (this.applyImport) {
            this.applyImport.addEventListener('click', () => this.applyImportedData());
        }
        if (this.discardImport) {
            this.discardImport.addEventListener('click', () => this.discardImportedData());
        }
        if (this.clearImport) {
            this.clearImport.addEventListener('click', () => this.clearAllImport());
        }

        // LTE add provider button
        if (this.addLteProvider) {
            this.addLteProvider.addEventListener('click', () => this.addNewLteProvider());
        }

        // LTE provider change - delegate to handle dynamic providers
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('mobileProvider')) {
                this.handleProviderChange(e.target);
            }
        });

        // Initialize first provider change handler
        this.initializeLteProviderHandlers();

        // LTE configuration generation
        if (this.generateLteConfig) {
            this.generateLteConfig.addEventListener('click', () => this.generateLTEConfiguration());
        }
        
        // DNS checkbox toggle
        if (this.enableLteDns) {
            this.enableLteDns.addEventListener('change', () => this.toggleDnsServerFields());
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
        const globalDns = this.dnsServers?.value || '1.1.1.1, 8.8.8.8';
        const globalAllowedIPs = this.allowedIPs?.value || '0.0.0.0/0';
        const globalMtu = this.mtu?.value || '1420';
        const globalKeepAlive = this.keepalive?.value || '25';

        this.clientKeysList.innerHTML = '';

        for (let i = 1; i <= numClients; i++) {
            const clientDiv = document.createElement('div');
            clientDiv.className = 'client-key-item';
            clientDiv.innerHTML = `
                <div class="client-header">
                    <h5>Client ${i}</h5>
                    <button type="button" class="btn btn-small btn-secondary toggle-advanced" data-client="${i}">
                        ⚙️ Advanced Settings
                    </button>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="client${i}Name">Client Name</label>
                        <input type="text" id="client${i}Name" value="Client-${i}" placeholder="Client name">
                    </div>
                    <div class="form-group">
                        <label for="client${i}DNS">DNS Servers</label>
                        <input type="text" id="client${i}DNS" value="${globalDns}" placeholder="1.1.1.1, 8.8.8.8">
                        <small>Comma-separated DNS servers</small>
                    </div>
                    <div class="form-group">
                        <label for="client${i}AllowedIPs">Allowed IPs</label>
                        <input type="text" id="client${i}AllowedIPs" value="${globalAllowedIPs}" placeholder="0.0.0.0/0">
                        <small>0.0.0.0/0 for full tunnel</small>
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

                <!-- Advanced Settings Panel -->
                <div class="client-advanced-panel hidden" id="client${i}Advanced">
                    <h6>Advanced Configuration</h6>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="client${i}MTU">MTU</label>
                            <input type="number" id="client${i}MTU" value="${globalMtu}" min="1280" max="1500" placeholder="1420">
                            <small>Maximum Transmission Unit</small>
                        </div>
                        <div class="form-group">
                            <label for="client${i}KeepAlive">Persistent KeepAlive</label>
                            <input type="number" id="client${i}KeepAlive" value="${globalKeepAlive}" min="0" max="300" placeholder="25">
                            <small>Seconds (0 to disable)</small>
                        </div>
                        <div class="form-group">
                            <label for="client${i}CustomEndpoint">Custom Endpoint (Optional)</label>
                            <input type="text" id="client${i}CustomEndpoint" placeholder="custom-server.com:51820">
                            <small>Override server endpoint for this client</small>
                        </div>
                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="client${i}EnablePSK">
                                Enable Pre-Shared Key for this client
                            </label>
                            <small>Additional layer of security</small>
                        </div>
                        <div class="form-group">
                            <label for="client${i}PostUp">PostUp Script (Optional)</label>
                            <input type="text" id="client${i}PostUp" placeholder="iptables -A FORWARD ...">
                            <small>Command to run after interface is up</small>
                        </div>
                        <div class="form-group">
                            <label for="client${i}PostDown">PostDown Script (Optional)</label>
                            <input type="text" id="client${i}PostDown" placeholder="iptables -D FORWARD ...">
                            <small>Command to run after interface is down</small>
                        </div>
                        <div class="form-group">
                            <label for="client${i}Table">Routing Table (Optional)</label>
                            <input type="text" id="client${i}Table" placeholder="auto, off, or custom">
                            <small>WireGuard routing table setting</small>
                        </div>
                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="client${i}SaveConfig">
                                Save Config on shutdown
                            </label>
                            <small>SaveConfig = true in WireGuard config</small>
                        </div>
                    </div>
                </div>
            `;
            this.clientKeysList.appendChild(clientDiv);

            // Add event listener for advanced toggle
            const toggleBtn = clientDiv.querySelector('.toggle-advanced');
            toggleBtn.addEventListener('click', () => this.toggleClientAdvanced(i));
        }
    }

    /**
     * Toggle advanced settings for a client
     */
    toggleClientAdvanced(clientIndex) {
        const advancedPanel = document.getElementById(`client${clientIndex}Advanced`);
        const toggleBtn = document.querySelector(`.toggle-advanced[data-client="${clientIndex}"]`);

        if (advancedPanel) {
            advancedPanel.classList.toggle('hidden');

            if (advancedPanel.classList.contains('hidden')) {
                toggleBtn.textContent = '⚙️ Advanced Settings';
            } else {
                toggleBtn.textContent = '⚙️ Hide Advanced';
            }
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
            // Ensure we have client keys generated
            const numClients = parseInt(this.numClients?.value) || 5;
            if (this.config.clientKeys.length < numClients) {
                // Generate missing client keys
                console.log(`Generating ${numClients - this.config.clientKeys.length} missing client keys`);
                for (let i = this.config.clientKeys.length; i < numClients; i++) {
                    this.config.clientKeys.push({
                        name: `Client-${i + 1}`,
                        privateKey: '', // Will be generated by WireGuard module
                        publicKey: '',  // Will be generated by WireGuard module
                        psk: this.enableIndividualPSK?.checked ? '' : null
                    });
                }
            }
            
            data.clients = [];
            for (let i = 0; i < numClients; i++) {
                const clientIndex = i + 1;
                const clientData = {
                    name: document.getElementById(`client${clientIndex}Name`)?.value || `Client-${clientIndex}`,
                    ip: this.generateClientIP(clientIndex),
                    privateKey: this.config.clientKeys[i]?.privateKey || '', // Will be generated if empty
                    publicKey: this.config.clientKeys[i]?.publicKey || '',   // Will be generated if empty
                    // Per-client DNS and AllowedIPs settings
                    dns: document.getElementById(`client${clientIndex}DNS`)?.value.split(',').map(s => s.trim()) || data.dns,
                    allowedIPs: document.getElementById(`client${clientIndex}AllowedIPs`)?.value || data.allowedIPs,
                    // Advanced per-client settings
                    mtu: parseInt(document.getElementById(`client${clientIndex}MTU`)?.value) || data.interface.mtu,
                    keepalive: parseInt(document.getElementById(`client${clientIndex}KeepAlive`)?.value) || data.options.keepalive,
                    customEndpoint: document.getElementById(`client${clientIndex}CustomEndpoint`)?.value || null,
                    postUp: document.getElementById(`client${clientIndex}PostUp`)?.value || null,
                    postDown: document.getElementById(`client${clientIndex}PostDown`)?.value || null,
                    table: document.getElementById(`client${clientIndex}Table`)?.value || null,
                    saveConfig: document.getElementById(`client${clientIndex}SaveConfig`)?.checked || false
                };

                // Check if individual PSK is enabled for this client
                const enablePSKForClient = document.getElementById(`client${clientIndex}EnablePSK`)?.checked;
                if (this.enableIndividualPSK?.checked || enablePSKForClient || this.config.clientKeys[i]?.psk) {
                    clientData.psk = this.config.clientKeys[i]?.psk || ''; // Will be generated if empty
                }

                data.clients.push(clientData);
            }
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
        // Store result for download functionality
        this.lastGeneratedResult = result;
        
        // Display WireGuard configurations
        if (this.wireguardOutput && result.wireguard) {
            this.wireguardOutput.innerHTML = this.formatWireGuardOutput(result.wireguard);
        }
        
        // Display MikroTik scripts
        if (this.mikrotikOutput && result.mikrotik) {
            this.mikrotikOutput.innerHTML = this.formatMikroTikOutput(result.mikrotik);
        }
        
        // Display VyOS scripts
        if (this.vyosOutput && result.vyos) {
            this.vyosOutput.innerHTML = this.formatVyOSOutput(result.vyos);
        }
        
        // Display OPNsense scripts
        if (this.opnsenseOutput && result.opnsense) {
            this.opnsenseOutput.innerHTML = this.formatOPNsenseOutput(result.opnsense);
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

    formatVyOSOutput(scripts) {
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

    formatOPNsenseOutput(scripts) {
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

    // ==================== LTE Multi-Provider Methods ====================

    /**
     * Initialize LTE provider handlers
     */
    initializeLteProviderHandlers() {
        // Set up initial provider change handler for provider 0
        const firstProvider = document.getElementById('mobileProvider-0');
        if (firstProvider && window.LTEConfigurator) {
            this.handleProviderChange(firstProvider);
        }
    }

    /**
     * Handle mobile provider change for a specific provider
     * @param {HTMLElement} selectElement - The provider select element
     */
    handleProviderChange(selectElement) {
        const providerId = selectElement?.value;
        const providerIndex = selectElement?.dataset.providerIndex;

        if (providerId && window.LTEConfigurator) {
            const elements = {
                apnName: document.getElementById(`apnName-${providerIndex}`),
                apnUsername: document.getElementById(`apnUsername-${providerIndex}`),
                apnPassword: document.getElementById(`apnPassword-${providerIndex}`),
                authMethod: this.authMethod,
                ipType: this.ipType,
                apnProfileName: document.getElementById(`apnProfileName-${providerIndex}`)
            };

            window.LTEConfigurator.updateProviderSettings(providerId, elements);
        }
    }

    /**
     * Add a new LTE provider configuration
     */
    addNewLteProvider() {
        const providerIndex = this.lteProviderCount;
        const providerCard = this.createProviderCard(providerIndex);

        this.lteProvidersContainer.appendChild(providerCard);
        this.lteProviderCount++;

        // Scroll to new provider
        providerCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Create a new provider card element
     * @param {number} index - Provider index
     * @returns {HTMLElement} Provider card element
     */
    createProviderCard(index) {
        const card = document.createElement('div');
        card.className = 'lte-provider-card';
        card.dataset.providerIndex = index;

        card.innerHTML = `
            <div class="provider-card-header">
                <h4>Provider ${index + 1}</h4>
                <button type="button" class="btn btn-danger btn-small remove-provider" data-provider-index="${index}">
                    🗑️ Remove
                </button>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label for="mobileProvider-${index}">Mobile Provider</label>
                    <select id="mobileProvider-${index}" class="mobileProvider" data-provider-index="${index}">
                        ${this.getProviderOptions()}
                    </select>
                </div>
                <div class="form-group">
                    <label for="apnName-${index}">APN Name</label>
                    <input type="text" id="apnName-${index}" class="apnName" data-provider-index="${index}" placeholder="Automatically filled from provider">
                </div>
                <div class="form-group">
                    <label for="apnUsername-${index}">Username</label>
                    <input type="text" id="apnUsername-${index}" class="apnUsername" data-provider-index="${index}" placeholder="Optional - leave empty if not required">
                </div>
                <div class="form-group">
                    <label for="apnPassword-${index}">Password</label>
                    <input type="text" id="apnPassword-${index}" class="apnPassword" data-provider-index="${index}" placeholder="Optional - leave empty if not required">
                </div>
                <div class="form-group">
                    <label for="apnProfileName-${index}">Profile Name</label>
                    <input type="text" id="apnProfileName-${index}" class="apnProfileName" data-provider-index="${index}" placeholder="e.g., vodafone-backup">
                </div>
                <div class="form-group">
                    <label for="providerPriority-${index}">Route Distance (Priority)</label>
                    <input type="number" id="providerPriority-${index}" class="providerPriority" data-provider-index="${index}" value="${index + 1}" min="1" max="255">
                    <small>Lower = higher priority (${index + 1} = backup)</small>
                </div>
            </div>
        `;

        // Add remove button event listener
        const removeBtn = card.querySelector('.remove-provider');
        removeBtn.addEventListener('click', () => this.removeLteProvider(index));

        return card;
    }

    /**
     * Get provider options HTML
     * @returns {string} HTML options string
     */
    getProviderOptions() {
        return `
            <option value="custom">Custom Configuration</option>
            <optgroup label="Deutsche Telekom Network">
                <option value="telekom">Deutsche Telekom (Main)</option>
                <option value="telekom_alt">Deutsche Telekom (Alternative)</option>
                <option value="telekom_ipv6">Deutsche Telekom (IPv6 only)</option>
                <option value="congstar">congstar</option>
                <option value="mobilcom_debitel_telekom">mobilcom-debitel (Telekom)</option>
                <option value="klarmobil">klarmobil</option>
            </optgroup>
            <optgroup label="Vodafone Network">
                <option value="vodafone">Vodafone (Standard)</option>
                <option value="vodafone_gigacube">Vodafone GigaCube</option>
                <option value="1und1_vodafone">1&1 (Vodafone Network)</option>
                <option value="otelo">otelo</option>
                <option value="mobilcom_debitel_vodafone">mobilcom-debitel (Vodafone)</option>
            </optgroup>
            <optgroup label="O2 / Telefónica Network">
                <option value="o2">O2 / Telefónica (Contract)</option>
                <option value="o2_prepaid">O2 Prepaid</option>
                <option value="1und1_o2">1&1 (O2 Network - legacy)</option>
                <option value="aldi_talk">ALDI TALK</option>
                <option value="drillisch">Drillisch (winSIM, PremiumSIM)</option>
                <option value="freenet">freenet Mobile</option>
            </optgroup>
        `;
    }

    /**
     * Remove an LTE provider configuration
     * @param {number} index - Provider index to remove
     */
    removeLteProvider(index) {
        const card = document.querySelector(`.lte-provider-card[data-provider-index="${index}"]`);
        if (card) {
            // Prevent removing the last provider
            const remainingProviders = document.querySelectorAll('.lte-provider-card').length;
            if (remainingProviders <= 1) {
                alert('Cannot remove the last provider. At least one provider is required.');
                return;
            }

            card.remove();
        }
    }

    /**
     * Toggle DNS server fields visibility
     */
    toggleDnsServerFields() {
        if (this.dnsServersGroup && this.enableLteDns) {
            if (this.enableLteDns.checked) {
                this.dnsServersGroup.style.display = 'block';
            } else {
                this.dnsServersGroup.style.display = 'none';
            }
        }
    }

    /**
     * Generate LTE configuration
     */
    async generateLTEConfiguration() {
        try {
            if (!window.LTEConfigurator) {
                throw new Error('LTE Configurator not available');
            }

            // Collect all provider configurations
            const providerCards = document.querySelectorAll('.lte-provider-card');
            const providers = [];

            providerCards.forEach((card) => {
                const index = card.dataset.providerIndex;
                const providerSelect = document.getElementById(`mobileProvider-${index}`);
                const apnName = document.getElementById(`apnName-${index}`);
                const apnUsername = document.getElementById(`apnUsername-${index}`);
                const apnPassword = document.getElementById(`apnPassword-${index}`);
                const apnProfileName = document.getElementById(`apnProfileName-${index}`);
                const providerPriority = document.getElementById(`providerPriority-${index}`);

                providers.push({
                    provider: providerSelect?.value || 'custom',
                    apnName: apnName?.value || '',
                    apnUsername: apnUsername?.value || '',
                    apnPassword: apnPassword?.value || '',
                    apnProfileName: apnProfileName?.value || `lte-profile-${index}`,
                    routeDistance: parseInt(providerPriority?.value) || (parseInt(index) + 1)
                });
            });

            // Collect global LTE configuration data
            const config = {
                providers: providers,  // Multiple providers
                simPin: this.simPin?.value || '',
                lteInterface: this.lteInterface?.value || 'lte1',
                authMethod: this.authMethod?.value || 'chap',
                ipType: this.ipType?.value || 'ipv4',
                enableLteNat: this.enableLteNat?.checked || false,
                enableLteFirewall: this.enableLteFirewall?.checked || false,
                setDefaultRoute: this.setDefaultRoute?.checked || false,
                routeDistance: parseInt(this.routeDistance?.value) || 1,
                localLanNetwork: this.localLanNetwork?.value || '192.168.1.0/24',
                enableLteDns: this.enableLteDns?.checked || false,
                lteDnsServers: this.lteDnsServers?.value || '8.8.8.8, 1.1.1.1'
            };

            // Generate LTE script with multiple providers
            const result = window.LTEConfigurator.generateMultiProviderLTEConfig(config);

            if (result.success) {
                // Display the script
                this.displayLTEScript(result.script);
                this.showNotification(`LTE configuration generated successfully with ${providers.length} provider(s)!`, 'success');
            } else {
                throw new Error(result.error || 'LTE generation failed');
            }

        } catch (error) {
            console.error('LTE configuration generation failed:', error);
            this.showNotification('Failed to generate LTE configuration: ' + error.message, 'error');
        }
    }

    /**
     * Display LTE script in output section
     * @param {string} script 
     */
    displayLTEScript(script) {
        if (this.lteScriptOutput) {
            this.lteScriptOutput.innerHTML = `
                <div class="config-section">
                    <div class="config-header">
                        <h4>MikroTik RouterOS LTE Script</h4>
                        <button class="copy-btn" onclick="app.copyToClipboard('LTE Script', \`${script.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">Copy</button>
                    </div>
                    <div class="config-content">
                        <pre>${script}</pre>
                    </div>
                </div>
            `;
        }

        // Show LTE output section
        if (this.lteOutputSection) {
            this.lteOutputSection.classList.remove('hidden');
            this.lteOutputSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Download functionality
    copyAllConfigurations() {
        if (!this.lastGeneratedResult) {
            this.showNotification('No configurations to copy. Generate a configuration first.', 'error');
            return;
        }

        let allConfigs = '';
        
        // Add WireGuard configs
        if (this.lastGeneratedResult.wireguard) {
            allConfigs += '=== WIREGUARD CONFIGURATIONS ===\n\n';
            this.lastGeneratedResult.wireguard.forEach(config => {
                allConfigs += `${config.name}:\n${config.content}\n\n`;
            });
        }

        // Add MikroTik configs
        if (this.lastGeneratedResult.mikrotik) {
            allConfigs += '=== MIKROTIK ROUTEROS SCRIPTS ===\n\n';
            this.lastGeneratedResult.mikrotik.forEach(config => {
                allConfigs += `${config.name}:\n${config.content}\n\n`;
            });
        }

        // Add VyOS configs
        if (this.lastGeneratedResult.vyos) {
            allConfigs += '=== VYOS CONFIGURATION COMMANDS ===\n\n';
            this.lastGeneratedResult.vyos.forEach(config => {
                allConfigs += `${config.name}:\n${config.content}\n\n`;
            });
        }

        // Add OPNsense configs
        if (this.lastGeneratedResult.opnsense) {
            allConfigs += '=== OPNSENSE CONFIGURATION ===\n\n';
            this.lastGeneratedResult.opnsense.forEach(config => {
                allConfigs += `${config.name}:\n${config.content}\n\n`;
            });
        }

        navigator.clipboard.writeText(allConfigs).then(() => {
            this.showNotification('All configurations copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy to clipboard', 'error');
        });
    }

    async downloadQRCodes() {
        if (!this.lastGeneratedResult?.qrCodes || this.lastGeneratedResult.qrCodes.length === 0) {
            this.showNotification('No QR codes to download. Generate a client-server configuration first.', 'error');
            return;
        }

        const zip = new JSZip();
        
        for (const qr of this.lastGeneratedResult.qrCodes) {
            const canvas = document.querySelector(`#qr-${qr.name.replace(/\s+/g, '-')}`);
            if (canvas) {
                const dataURL = canvas.toDataURL('image/png');
                const base64Data = dataURL.split(',')[1];
                zip.file(`${qr.name.replace(/\s+/g, '-')}.png`, base64Data, {base64: true});
                zip.file(`${qr.name.replace(/\s+/g, '-')}.conf`, qr.content);
            }
        }

        try {
            const content = await zip.generateAsync({type: 'blob'});
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'wireguard-qr-codes.zip';
            link.click();
            URL.revokeObjectURL(url);
            this.showNotification('QR codes downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download failed:', error);
            this.showNotification('Failed to download QR codes', 'error');
        }
    }

    async downloadAsPDF() {
        if (!this.lastGeneratedResult) {
            this.showNotification('No configurations to download. Generate a configuration first.', 'error');
            return;
        }

        if (typeof window.jsPDF === 'undefined') {
            this.showNotification('PDF library not loaded. Downloading as text file instead.', 'warning');
            this.downloadAsTextFile();
            return;
        }

        try {
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            
            let yPosition = 20;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const maxWidth = doc.internal.pageSize.width - (margin * 2);
            
            // Title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('WireGuard & MikroTik RouterOS Configuration', margin, yPosition);
            yPosition += 15;
            
            // Date
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
            yPosition += 20;

            // WireGuard Configurations
            if (this.lastGeneratedResult.wireguard) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('WireGuard Configurations', margin, yPosition);
                yPosition += 10;
                
                for (const config of this.lastGeneratedResult.wireguard) {
                    // Check if we need a new page
                    if (yPosition > pageHeight - 60) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(config.name, margin, yPosition);
                    yPosition += 8;
                    
                    doc.setFontSize(9);
                    doc.setFont('courier', 'normal');
                    const lines = config.content.split('\n');
                    
                    for (const line of lines) {
                        if (yPosition > pageHeight - 20) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.text(line, margin, yPosition);
                        yPosition += 5;
                    }
                    yPosition += 10;
                }
            }

            // MikroTik Scripts
            if (this.lastGeneratedResult.mikrotik) {
                if (yPosition > pageHeight - 100) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('MikroTik RouterOS Scripts', margin, yPosition);
                yPosition += 10;
                
                for (const config of this.lastGeneratedResult.mikrotik) {
                    if (yPosition > pageHeight - 60) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(config.name, margin, yPosition);
                    yPosition += 8;
                    
                    doc.setFontSize(9);
                    doc.setFont('courier', 'normal');
                    const lines = config.content.split('\n');
                    
                    for (const line of lines) {
                        if (yPosition > pageHeight - 20) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.text(line, margin, yPosition);
                        yPosition += 5;
                    }
                    yPosition += 10;
                }
            }

            // VyOS Scripts
            if (this.lastGeneratedResult.vyos) {
                if (yPosition > pageHeight - 100) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('VyOS Configuration Commands', margin, yPosition);
                yPosition += 10;
                
                for (const config of this.lastGeneratedResult.vyos) {
                    if (yPosition > pageHeight - 60) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(config.name, margin, yPosition);
                    yPosition += 8;
                    
                    doc.setFontSize(9);
                    doc.setFont('courier', 'normal');
                    const lines = config.content.split('\n');
                    
                    for (const line of lines) {
                        if (yPosition > pageHeight - 20) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.text(line, margin, yPosition);
                        yPosition += 5;
                    }
                    yPosition += 10;
                }
            }

            // OPNsense Scripts
            if (this.lastGeneratedResult.opnsense) {
                if (yPosition > pageHeight - 100) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('OPNsense Configuration', margin, yPosition);
                yPosition += 10;
                
                for (const config of this.lastGeneratedResult.opnsense) {
                    if (yPosition > pageHeight - 60) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(config.name, margin, yPosition);
                    yPosition += 8;
                    
                    doc.setFontSize(9);
                    doc.setFont('courier', 'normal');
                    const lines = config.content.split('\n');
                    
                    for (const line of lines) {
                        if (yPosition > pageHeight - 20) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.text(line, margin, yPosition);
                        yPosition += 5;
                    }
                    yPosition += 10;
                }
            }

            // Add QR codes if available
            if (this.lastGeneratedResult.qrCodes && this.lastGeneratedResult.qrCodes.length > 0) {
                doc.addPage();
                yPosition = 20;
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('QR Codes for Mobile Devices', margin, yPosition);
                yPosition += 20;
                
                for (const qr of this.lastGeneratedResult.qrCodes) {
                    const canvas = document.querySelector(`#qr-${qr.name.replace(/\s+/g, '-')}`);
                    if (canvas) {
                        if (yPosition > pageHeight - 120) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'bold');
                        doc.text(qr.name, margin, yPosition);
                        yPosition += 10;
                        
                        const imgData = canvas.toDataURL('image/png');
                        doc.addImage(imgData, 'PNG', margin, yPosition, 60, 60);
                        yPosition += 70;
                    }
                }
            }

            // Save the PDF
            const filename = `wireguard-configurations-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
            this.showNotification('PDF downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('PDF generation failed:', error);
            this.showNotification('PDF generation failed. Downloading as text file instead.', 'warning');
            this.downloadAsTextFile();
        }
    }

    downloadAsTextFile() {
        let allContent = '';
        
        if (this.lastGeneratedResult.wireguard) {
            allContent += '=== WIREGUARD CONFIGURATIONS ===\n\n';
            this.lastGeneratedResult.wireguard.forEach(config => {
                allContent += `${config.name}:\n${config.content}\n\n`;
            });
        }

        if (this.lastGeneratedResult.mikrotik) {
            allContent += '=== MIKROTIK ROUTEROS SCRIPTS ===\n\n';
            this.lastGeneratedResult.mikrotik.forEach(config => {
                allContent += `${config.name}:\n${config.content}\n\n`;
            });
        }

        const blob = new Blob([allContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wireguard-configurations.txt';
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Configurations downloaded as text file!', 'success');
    }
    // ==================== Import Configuration Methods ====================

    /**
     * Handle file upload import
     */
    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            this.processImportText(text);
        } catch (error) {
            console.error('File import error:', error);
            alert('Error reading file: ' + error.message);
        }

        // Reset file input
        event.target.value = '';
    }

    /**
     * Show paste text area
     */
    showPasteTextArea() {
        this.pasteArea.classList.remove('hidden');
        this.configTextInput.value = '';
        this.configTextInput.focus();
    }

    /**
     * Hide paste text area
     */
    hidePasteTextArea() {
        this.pasteArea.classList.add('hidden');
        this.configTextInput.value = '';
    }

    /**
     * Handle text paste import
     */
    handleTextImport() {
        const text = this.configTextInput.value.trim();
        if (!text) {
            alert('Please paste a configuration first');
            return;
        }

        this.processImportText(text);
        this.hidePasteTextArea();
    }

    /**
     * Process imported configuration text
     */
    processImportText(text) {
        try {
            // Parse configuration
            this.importedData = window.ConfigImportParser.parse(text);

            // Generate preview
            const preview = window.ConfigImportParser.generatePreview(this.importedData);
            this.importPreviewText.textContent = preview;

            // Show preview
            this.importPreview.classList.remove('hidden');
            this.clearImport.classList.remove('hidden');

            console.log('Imported configuration:', this.importedData);
        } catch (error) {
            console.error('Import parsing error:', error);
            alert('Failed to parse configuration:\n' + error.message);
            this.importedData = null;
        }
    }

    /**
     * Apply imported data to form
     */
    applyImportedData() {
        if (!this.importedData) {
            alert('No imported data to apply');
            return;
        }

        try {
            const data = this.importedData;

            // Set configuration type
            if (data.type) {
                const typeRadio = document.querySelector(`input[name="configType"][value="${data.type}"]`);
                if (typeRadio) {
                    typeRadio.checked = true;
                    this.handleConfigTypeChange();
                }
            }

            // Apply server configuration
            if (data.server) {
                if (data.server.name) this.serverName.value = data.server.name;
                if (data.server.ip) this.serverIP.value = data.server.ip;
                if (data.server.port) this.listenPort.value = data.server.port;

                // Apply server keys if manual key input is enabled
                if (data.server.keys && data.server.keys.privateKey) {
                    // Enable manual key input
                    if (this.serverKeysManual.classList.contains('hidden')) {
                        this.toggleServerKeys.click();
                    }
                    this.serverPrivateKey.value = data.server.keys.privateKey;
                    if (data.server.keys.publicKey) {
                        this.serverPublicKey.value = data.server.keys.publicKey;
                    }
                }
            }

            // Apply interface settings
            if (data.interface) {
                if (data.interface.name) this.interfaceName.value = data.interface.name;
                if (data.interface.mtu) this.mtu.value = data.interface.mtu;
                if (data.interface.dns) this.dnsServers.value = data.interface.dns;
            }

            // Apply routing settings
            if (data.routing) {
                if (data.routing.enableNat !== undefined) {
                    this.enableNAT.checked = data.routing.enableNat;
                }
                if (data.routing.enableFirewall !== undefined) {
                    this.generateFirewall.checked = data.routing.enableFirewall;
                }
                if (data.routing.localNetwork) {
                    this.localNetwork.value = data.routing.localNetwork;
                }
            }

            // Apply peers data (for reference - detailed client management would need more work)
            if (data.peers && data.peers.length > 0) {
                const firstPeer = data.peers[0];
                if (firstPeer.endpoint) {
                    // Extract endpoint for client configs if server import
                    if (!this.publicEndpoint.value) {
                        this.publicEndpoint.value = firstPeer.endpoint;
                    }
                }
                if (firstPeer.allowedIPs) {
                    this.allowedIPs.value = firstPeer.allowedIPs;
                }
                if (firstPeer.keepalive) {
                    this.keepalive.value = firstPeer.keepalive;
                }
            }

            alert(`Successfully imported ${data.format.toUpperCase()} configuration!\nReview the form and generate new configs.`);

            // Hide preview
            this.importPreview.classList.add('hidden');

            // Scroll to top of form
            document.getElementById('server-config').scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error('Error applying import:', error);
            alert('Error applying imported data: ' + error.message);
        }
    }

    /**
     * Discard imported data
     */
    discardImportedData() {
        this.importedData = null;
        this.importPreview.classList.add('hidden');
        this.importPreviewText.textContent = '';
    }

    /**
     * Clear all import data and UI
     */
    clearAllImport() {
        this.importedData = null;
        this.importPreview.classList.add('hidden');
        this.importPreviewText.textContent = '';
        this.pasteArea.classList.add('hidden');
        this.configTextInput.value = '';
        this.clearImport.classList.add('hidden');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WireGuardMikroTikApp();
});

// Expose global functions for onclick handlers
window.showPage = (page) => window.app?.showPage(page);
window.showOutputTab = (tab) => window.app?.showOutputTab(tab);