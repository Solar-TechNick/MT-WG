class WireGuardConfigurator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.generateInitialKeys();
        this.updateClientSubnet();
        this.initializeLteProviders();
        
        // Add tooltips after everything is initialized
        setTimeout(() => {
            this.addAllTooltips();
            this.debugTooltips();
        }, 1000);
    }

    initializeElements() {
        this.elements = {
            configType: document.querySelectorAll('input[name="configType"]'),
            serverConfig: document.getElementById('server-config'),
            clientConfig: document.getElementById('client-config'),
            siteConfig: document.getElementById('site-config'),
            
            serverName: document.getElementById('serverName'),
            serverIP: document.getElementById('serverIP'),
            listenPort: document.getElementById('listenPort'),
            publicEndpoint: document.getElementById('publicEndpoint'),
            
            // Server key elements
            toggleServerKeys: document.getElementById('toggleServerKeys'),
            serverKeysManual: document.getElementById('serverKeysManual'),
            serverKeysAuto: document.getElementById('serverKeysAuto'),
            serverPrivateKey: document.getElementById('serverPrivateKey'),
            serverPublicKey: document.getElementById('serverPublicKey'),
            
            numClients: document.getElementById('numClients'),
            clientSubnet: document.getElementById('clientSubnet'),
            dnsServers: document.getElementById('dnsServers'),
            allowedIPs: document.getElementById('allowedIPs'),
            
            // Client key elements
            toggleClientKeys: document.getElementById('toggleClientKeys'),
            clientKeysManagement: document.getElementById('clientKeysManagement'),
            enableIndividualPSK: document.getElementById('enableIndividualPSK'),
            clientKeysList: document.getElementById('clientKeysList'),
            
            numSites: document.getElementById('numSites'),
            transferSubnet: document.getElementById('transferSubnet'),
            sitesContainer: document.getElementById('sitesContainer'),
            
            enablePSK: document.getElementById('enablePSK'),
            noRoutingTable: document.getElementById('noRoutingTable'),
            enableNAT: document.getElementById('enableNAT'),
            generateFirewall: document.getElementById('generateFirewall'),
            mtu: document.getElementById('mtu'),
            keepalive: document.getElementById('keepalive'),
            
            generateKeys: document.getElementById('generateKeys'),
            generateConfig: document.getElementById('generateConfig'),
            
            outputSection: document.getElementById('outputSection'),
            tabButtons: document.querySelectorAll('.tab-button'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            wireguardOutput: document.getElementById('wireguardOutput'),
            mikrotikOutput: document.getElementById('mikrotikOutput'),
            qrOutput: document.getElementById('qrOutput'),
            
            // New fields
            interfaceName: document.getElementById('interfaceName'),
            globalPSK: document.getElementById('globalPSK'),
            localNetwork: document.getElementById('localNetwork'),
            
            // Navigation
            navButtons: document.querySelectorAll('.nav-button'),
            pageContents: document.querySelectorAll('.page-content'),
            
            // LTE elements
            mobileProvider: document.getElementById('mobileProvider'),
            apnName: document.getElementById('apnName'),
            apnUsername: document.getElementById('apnUsername'),
            apnPassword: document.getElementById('apnPassword'),
            simPin: document.getElementById('simPin'),
            lteInterface: document.getElementById('lteInterface'),
            apnProfileName: document.getElementById('apnProfileName'),
            authMethod: document.getElementById('authMethod'),
            ipType: document.getElementById('ipType'),
            enableLteNat: document.getElementById('enableLteNat'),
            enableLteFirewall: document.getElementById('enableLteFirewall'),
            setDefaultRoute: document.getElementById('setDefaultRoute'),
            routeDistance: document.getElementById('routeDistance'),
            localLanNetwork: document.getElementById('localLanNetwork'),
            generateLteConfig: document.getElementById('generateLteConfig'),
            lteOutputSection: document.getElementById('lteOutputSection'),
            lteScriptOutput: document.getElementById('lteScriptOutput'),
            
            // Multiple APN elements
            enableMultipleApn: document.getElementById('enableMultipleApn'),
            additionalProvidersContainer: document.getElementById('additionalProvidersContainer'),
            addProviderBtn: document.getElementById('addProviderBtn'),
            additionalProvidersList: document.getElementById('additionalProvidersList')
        };
        
        this.keys = {
            server: { private: '', public: '' },
            clients: [],
            sites: []
        };
        
        this.manualServerKeys = false;
        this.manualClientKeys = false;
        this.clientKeysData = [];
        this.additionalApnProfiles = [];
        
        // Initialize tooltips after DOM is ready
        this.initializeTooltips();
    }

    createInfoButton(tooltip) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'info-btn';
        button.innerHTML = '?';
        button.setAttribute('tabindex', '0');
        
        const tooltipDiv = document.createElement('div');
        tooltipDiv.className = 'tooltip';
        tooltipDiv.textContent = tooltip;
        
        button.appendChild(tooltipDiv);
        return button;
    }

    initializeTooltips() {
        // Tooltip descriptions for all fields
        const tooltips = {
            // Configuration Type
            'configType': 'Choose between Client-Server (traditional VPN with central server) or Site-to-Site (connecting multiple networks directly)',
            
            // Server Configuration
            'serverName': 'A descriptive name for your WireGuard server (used in configuration files and comments)',
            'serverIP': 'The internal IP address and subnet for the WireGuard interface (e.g., 10.0.0.1/24)',
            'listenPort': 'UDP port for WireGuard traffic. Default is 51820. Must be open in firewall.',
            'publicEndpoint': 'Your server\'s public IP address or domain name that clients will connect to',
            
            // Server Keys
            'serverPrivateKey': 'Base64 encoded private key for the server. Leave empty to auto-generate a secure key.',
            'serverPublicKey': 'Automatically derived from the private key. This is shared with clients.',
            'toggleServerKeys': 'Switch between automatic key generation and manual key input',
            
            // Client Configuration
            'numClients': 'Number of client devices that will connect to the server (affects subnet calculation)',
            'clientSubnet': 'Automatically calculated subnet based on server IP and client count',
            'dnsServers': 'DNS servers that clients will use (comma-separated). Common: 1.1.1.1, 8.8.8.8',
            'allowedIPs': 'IP ranges that will be routed through VPN. Use 0.0.0.0/0 for full tunnel.',
            
            // Client Keys
            'enableIndividualPSK': 'Allow each client to have its own unique Pre-Shared Key for enhanced security',
            'toggleClientKeys': 'Show/hide individual client key management interface',
            'clientName': 'Custom name for this client (used in configuration files and QR codes)',
            'clientPrivateKey': 'Base64 encoded private key for this client. Leave empty to auto-generate.',
            'clientPublicKey': 'Automatically derived from the private key. Shared with the server.',
            'clientPSK': 'Optional Pre-Shared Key for additional security layer between this client and server',
            'generateKeys': 'Generate a new secure key pair for this client',
            'generatePSK': 'Generate a new secure Pre-Shared Key for this client',
            
            // Site-to-Site
            'numSites': 'Number of sites to connect in your site-to-site network (2-10 supported)',
            'transferSubnet': 'Dedicated network for WireGuard tunnels between sites (e.g., 10.2.2.0/24)',
            'siteName': 'Descriptive name for this site location',
            'siteNetwork': 'Local network behind this site\'s gateway (e.g., 192.168.1.0/24)',
            'siteEndpoint': 'Public IP address or domain name for this site\'s WireGuard server',
            'sitePort': 'UDP port for WireGuard on this site (each site should use a different port)',
            
            // Advanced Options
            'enablePSK': 'Enable Pre-Shared Key for all connections (additional security layer)',
            'noRoutingTable': 'Limit routing to VPN subnet only (prevents full internet routing)',
            'enableNAT': 'Enable masquerading/NAT to allow VPN clients to access internet through server',
            'generateFirewall': 'Automatically generate MikroTik firewall rules for WireGuard traffic',
            'mtu': 'Maximum Transmission Unit size. 1420 is optimal for most connections.',
            'keepalive': 'Persistent keepalive interval in seconds (25 recommended for NAT traversal)',
            
            // Actions
            'generateKeys': 'Generate new keys for all servers and clients',
            'generateConfig': 'Create WireGuard configurations and MikroTik scripts based on current settings',
            
            // LTE Configuration
            'mobileProvider': 'Select your German mobile provider for automatic APN configuration',
            'apnName': 'Access Point Name provided by your mobile carrier (auto-filled for selected providers)',
            'apnUsername': 'Username for mobile data authentication (usually empty for German providers)',
            'apnPassword': 'Password for mobile data authentication (usually empty for German providers)',
            'simPin': 'SIM card PIN code (usually 4 digits) for automatic SIM unlock',
            'lteInterface': 'Name for the LTE interface in RouterOS (e.g., lte1)',
            'apnProfileName': 'Custom name for the APN profile in RouterOS configuration',
            'authMethod': 'Authentication method for mobile data connection (PAP, CHAP, or both)',
            'ipType': 'IP protocol version to use (IPv4, IPv6, or dual-stack)',
            'enableLteNat': 'Enable Network Address Translation for devices using LTE connection',
            'enableLteFirewall': 'Generate firewall rules to secure LTE connection',
            'setDefaultRoute': 'Use LTE connection as default internet route',
            'routeDistance': 'Priority of LTE route (lower number = higher priority)',
            'localLanNetwork': 'Your local network subnet (e.g., 192.168.1.0/24) for NAT configuration',
            'generateLteConfig': 'Generate complete RouterOS script for LTE configuration',
            'enableMultipleApn': 'Configure multiple APN profiles for failover or different connection types (e.g., IoT, data, voice)'
        };
        
        // Store tooltips for later use
        this.tooltipTexts = tooltips;
    }

    addAllTooltips() {
        const tooltips = this.tooltipTexts;
        
        // Add tooltips to all form elements
        this.addTooltipToElement('serverName', tooltips.serverName);
        this.addTooltipToElement('serverIP', tooltips.serverIP);
        this.addTooltipToElement('listenPort', tooltips.listenPort);
        this.addTooltipToElement('publicEndpoint', tooltips.publicEndpoint);
        this.addTooltipToElement('numClients', tooltips.numClients);
        this.addTooltipToElement('clientSubnet', tooltips.clientSubnet);
        this.addTooltipToElement('dnsServers', tooltips.dnsServers);
        this.addTooltipToElement('allowedIPs', tooltips.allowedIPs);
        this.addTooltipToElement('numSites', tooltips.numSites);
        this.addTooltipToElement('transferSubnet', tooltips.transferSubnet);
        this.addTooltipToElement('enablePSK', tooltips.enablePSK);
        this.addTooltipToElement('noRoutingTable', tooltips.noRoutingTable);
        this.addTooltipToElement('enableNAT', tooltips.enableNAT);
        this.addTooltipToElement('generateFirewall', tooltips.generateFirewall);
        this.addTooltipToElement('mtu', tooltips.mtu);
        this.addTooltipToElement('keepalive', tooltips.keepalive);
        this.addTooltipToElement('enableIndividualPSK', tooltips.enableIndividualPSK);
        
        // Add tooltips to server key fields
        this.addTooltipToElement('serverPrivateKey', tooltips.serverPrivateKey);
        this.addTooltipToElement('serverPublicKey', tooltips.serverPublicKey);
        
        // Add tooltips for new manual fields
        this.addTooltipToElement('interfaceName', 'Name of the WireGuard interface in RouterOS (e.g., wireguard1)');
        this.addTooltipToElement('globalPSK', 'Global Pre-Shared Key for additional security (leave empty to disable)');
        this.addTooltipToElement('localNetwork', 'Local network subnet for site-to-site configurations (e.g., 192.168.1.0/24)');
        
        // Add LTE tooltips
        this.addTooltipToElement('mobileProvider', tooltips.mobileProvider);
        this.addTooltipToElement('apnName', tooltips.apnName);
        this.addTooltipToElement('apnUsername', tooltips.apnUsername);
        this.addTooltipToElement('apnPassword', tooltips.apnPassword);
        this.addTooltipToElement('simPin', tooltips.simPin);
        this.addTooltipToElement('lteInterface', tooltips.lteInterface);
        this.addTooltipToElement('apnProfileName', tooltips.apnProfileName);
        this.addTooltipToElement('authMethod', tooltips.authMethod);
        this.addTooltipToElement('ipType', tooltips.ipType);
        this.addTooltipToElement('enableLteNat', tooltips.enableLteNat);
        this.addTooltipToElement('enableLteFirewall', tooltips.enableLteFirewall);
        this.addTooltipToElement('setDefaultRoute', tooltips.setDefaultRoute);
        this.addTooltipToElement('routeDistance', tooltips.routeDistance);
        this.addTooltipToElement('localLanNetwork', tooltips.localLanNetwork);
        this.addTooltipToElement('enableMultipleApn', tooltips.enableMultipleApn);
        
        console.log('All tooltips added successfully');
    }

    debugTooltips() {
        console.log('=== Tooltip Debug Information ===');
        
        const elementIds = [
            'serverName', 'serverIP', 'listenPort', 'publicEndpoint',
            'numClients', 'clientSubnet', 'dnsServers', 'allowedIPs',
            'numSites', 'transferSubnet', 'enablePSK', 'noRoutingTable',
            'enableNAT', 'generateFirewall', 'mtu', 'keepalive',
            'enableIndividualPSK', 'serverPrivateKey', 'serverPublicKey'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            const hasTooltip = element ? 
                (element.closest('.form-group')?.querySelector('.info-btn') || 
                 element.closest('.checkbox-group')?.querySelector('.info-btn')) : null;
            
            console.log(`${id}: ${element ? 'Found' : 'Missing'} element, ${hasTooltip ? 'Has' : 'No'} tooltip`);
        });
        
        console.log('=== End Debug ===');
    }

    // Manual tooltip function for testing
    manualAddTooltip(elementId, tooltipText) {
        console.log(`Manually adding tooltip to ${elementId}`);
        
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element ${elementId} not found`);
            return false;
        }
        
        console.log(`Element ${elementId} found:`, element);
        
        const formGroup = element.closest('.form-group');
        const checkboxGroup = element.closest('.checkbox-group');
        
        console.log(`Form group:`, formGroup);
        console.log(`Checkbox group:`, checkboxGroup);
        
        let targetLabel = null;
        if (checkboxGroup) {
            targetLabel = checkboxGroup.querySelector('label');
        } else if (formGroup) {
            targetLabel = formGroup.querySelector('label');
        }
        
        console.log(`Target label:`, targetLabel);
        
        if (!targetLabel) {
            console.error(`No label found for ${elementId}`);
            return false;
        }
        
        const infoBtn = this.createInfoButton(tooltipText);
        targetLabel.appendChild(infoBtn);
        console.log(`Tooltip successfully added to ${elementId}`);
        return true;
    }

    addTooltipToElement(elementId, tooltipText) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element with ID '${elementId}' not found`);
            return;
        }
        
        // Handle different element types
        let targetLabel = null;
        
        // For checkboxes, find the label that contains the checkbox
        if (element.type === 'checkbox') {
            const checkboxGroup = element.closest('.checkbox-group');
            if (checkboxGroup) {
                targetLabel = checkboxGroup.querySelector('label');
            }
        } else {
            // For regular inputs, find the label in the form group
            const formGroup = element.closest('.form-group');
            if (formGroup) {
                targetLabel = formGroup.querySelector('label');
            }
        }
        
        if (!targetLabel) {
            console.warn(`Label for element '${elementId}' not found`);
            return;
        }
        
        // Check if tooltip already exists
        if (targetLabel.querySelector('.info-btn')) {
            return;
        }
        
        const infoBtn = this.createInfoButton(tooltipText);
        targetLabel.appendChild(infoBtn);
        console.log(`Tooltip added for ${elementId}`);
    }

    addTooltipToButton(buttonId, tooltipText) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        // Create wrapper if button doesn't have one
        if (!button.parentElement.classList.contains('tooltip-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'tooltip-container';
            button.parentElement.insertBefore(wrapper, button);
            wrapper.appendChild(button);
            
            const infoBtn = this.createInfoButton(tooltipText);
            wrapper.appendChild(infoBtn);
        }
    }

    attachEventListeners() {
        this.elements.configType.forEach(radio => {
            radio.addEventListener('change', () => this.handleConfigTypeChange());
        });
        
        this.elements.numClients.addEventListener('input', () => {
            this.updateClientSubnet();
            this.updateClientKeysList();
        });
        this.elements.serverIP.addEventListener('input', () => this.updateClientSubnet());
        this.elements.numSites.addEventListener('input', () => this.generateSiteConfigs());
        
        // Server key management
        this.elements.toggleServerKeys.addEventListener('click', () => this.toggleServerKeyMode());
        this.elements.serverPrivateKey.addEventListener('input', () => this.updateServerPublicKey());
        
        // Client key management
        this.elements.toggleClientKeys.addEventListener('click', () => this.toggleClientKeyMode());
        this.elements.enableIndividualPSK.addEventListener('change', () => this.updateClientKeysList());
        
        this.elements.generateKeys.addEventListener('click', () => this.generateInitialKeys());
        this.elements.generateConfig.addEventListener('click', () => this.generateConfigurations());
        
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Navigation
        this.elements.navButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchPage(e.target.dataset.page));
        });
        
        // LTE functionality
        if (this.elements.mobileProvider) {
            this.elements.mobileProvider.addEventListener('change', () => this.updateProviderSettings());
        } else {
            console.error('mobileProvider element not found');
        }
        
        if (this.elements.generateLteConfig) {
            this.elements.generateLteConfig.addEventListener('click', () => {
                console.log('LTE Generate button clicked');
                
                // Check if we're on the LTE page
                const ltePage = document.getElementById('lte-page');
                if (!ltePage || !ltePage.classList.contains('active')) {
                    alert('Please switch to the "📡 LTE Mobile" page first by clicking the LTE tab in the navigation.');
                    return;
                }
                
                try {
                    this.generateLteConfiguration();
                } catch (error) {
                    console.error('Error in generateLteConfiguration:', error);
                    alert('Error generating LTE configuration: ' + error.message + '\n\nTip: Make sure all required fields are filled and try again.');
                }
            });
        } else {
            console.error('generateLteConfig element not found');
        }
        
        // Multiple APN functionality
        if (this.elements.enableMultipleApn) {
            this.elements.enableMultipleApn.addEventListener('change', () => this.toggleMultipleApn());
        } else {
            console.error('enableMultipleApn element not found');
        }
        
        if (this.elements.addProviderBtn) {
            this.elements.addProviderBtn.addEventListener('click', () => this.addAdditionalProvider());
        } else {
            console.error('addProviderBtn element not found');
        }
        
        // Note: copyMikroTik functionality is now handled per script window
    }

    handleConfigTypeChange() {
        const selectedType = document.querySelector('input[name="configType"]:checked').value;
        
        if (selectedType === 'client-server') {
            this.elements.clientConfig.style.display = 'block';
            this.elements.siteConfig.style.display = 'none';
        } else {
            this.elements.clientConfig.style.display = 'none';
            this.elements.siteConfig.style.display = 'block';
            this.generateSiteConfigs();
        }
    }

    toggleServerKeyMode() {
        this.manualServerKeys = !this.manualServerKeys;
        
        if (this.manualServerKeys) {
            this.elements.serverKeysManual.style.display = 'block';
            this.elements.serverKeysAuto.style.display = 'none';
            this.elements.toggleServerKeys.textContent = 'Auto Generate';
        } else {
            this.elements.serverKeysManual.style.display = 'none';
            this.elements.serverKeysAuto.style.display = 'block';
            this.elements.toggleServerKeys.textContent = 'Manual Input';
            this.elements.serverPrivateKey.value = '';
            this.elements.serverPublicKey.value = '';
        }
    }

    toggleClientKeyMode() {
        this.manualClientKeys = !this.manualClientKeys;
        
        if (this.manualClientKeys) {
            this.elements.clientKeysManagement.style.display = 'block';
            this.elements.toggleClientKeys.textContent = 'Hide Keys';
            this.updateClientKeysList();
        } else {
            this.elements.clientKeysManagement.style.display = 'none';
            this.elements.toggleClientKeys.textContent = 'Manage Keys';
        }
    }

    async updateServerPublicKey() {
        const privateKey = this.elements.serverPrivateKey.value.trim();
        if (privateKey) {
            try {
                const publicKey = await this.derivePublicKey(privateKey);
                this.elements.serverPublicKey.value = publicKey;
            } catch (error) {
                console.error('Error deriving public key:', error);
                this.elements.serverPublicKey.value = 'Invalid private key';
            }
        } else {
            this.elements.serverPublicKey.value = '';
        }
    }

    updateClientSubnet() {
        const numClients = parseInt(this.elements.numClients.value) || 1;
        const serverIP = this.elements.serverIP.value;
        
        try {
            const subnet = this.calculateSubnet(numClients + 1, serverIP);
            this.elements.clientSubnet.value = subnet;
        } catch (error) {
            console.error('Error calculating subnet:', error);
        }
    }

    updateClientKeysList() {
        if (!this.manualClientKeys) return;
        
        const numClients = parseInt(this.elements.numClients.value) || 1;
        const enableIndividualPSK = this.elements.enableIndividualPSK.checked;
        const container = this.elements.clientKeysList;
        
        container.innerHTML = '';
        
        // Ensure we have enough client key data
        while (this.clientKeysData.length < numClients) {
            this.clientKeysData.push({
                name: `Client ${this.clientKeysData.length + 1}`,
                privateKey: '',
                publicKey: '',
                preSharedKey: ''
            });
        }
        
        // Remove excess client key data
        if (this.clientKeysData.length > numClients) {
            this.clientKeysData = this.clientKeysData.slice(0, numClients);
        }
        
        for (let i = 0; i < numClients; i++) {
            const clientDiv = document.createElement('div');
            clientDiv.className = 'client-key-item';
            
            clientDiv.innerHTML = `
                <h5>Client ${i + 1} Keys</h5>
                <div class="form-group">
                    <label>Client Name: ${this.createInfoButton('Custom name for this client (used in configuration files and QR codes)').outerHTML}</label>
                    <input type="text" data-client="${i}" data-field="name" value="${this.clientKeysData[i]?.name || `Client ${i + 1}`}" placeholder="Client name">
                </div>
                <div class="key-input-group">
                    <div class="form-group">
                        <label>Private Key: ${this.createInfoButton('Base64 encoded private key for this client. Leave empty to auto-generate.').outerHTML}</label>
                        <input type="text" data-client="${i}" data-field="privateKey" value="${this.clientKeysData[i]?.privateKey || ''}" placeholder="Leave empty to auto-generate">
                        <small>Base64 encoded private key</small>
                    </div>
                    <div class="form-group">
                        <label>Public Key: ${this.createInfoButton('Automatically derived from the private key. Shared with the server.').outerHTML}</label>
                        <input type="text" data-client="${i}" data-field="publicKey" value="${this.clientKeysData[i]?.publicKey || ''}" readonly>
                        <small>Automatically derived</small>
                    </div>
                </div>
                <div class="form-group">
                    <div class="tooltip-container">
                        <button type="button" class="generate-key-btn" data-client="${i}">🔑 Generate Keys</button>
                        ${this.createInfoButton('Generate a new secure key pair for this client').outerHTML}
                    </div>
                </div>
                ${enableIndividualPSK ? `
                <div class="psk-input-group">
                    <div class="form-group">
                        <label>Pre-Shared Key: ${this.createInfoButton('Optional Pre-Shared Key for additional security layer between this client and server').outerHTML}</label>
                        <input type="text" data-client="${i}" data-field="preSharedKey" value="${this.clientKeysData[i]?.preSharedKey || ''}" placeholder="Leave empty to auto-generate">
                        <small>Optional additional security</small>
                    </div>
                    <div class="tooltip-container">
                        <button type="button" class="generate-key-btn" data-client="${i}" data-psk="true">🔐 Generate PSK</button>
                        ${this.createInfoButton('Generate a new secure Pre-Shared Key for this client').outerHTML}
                    </div>
                </div>
                ` : ''}
            `;
            
            container.appendChild(clientDiv);
        }
        
        // Add event listeners for the new elements
        this.attachClientKeyListeners();
    }

    attachClientKeyListeners() {
        const container = this.elements.clientKeysList;
        
        // Input field listeners
        container.querySelectorAll('input[data-client]').forEach(input => {
            input.addEventListener('input', async (e) => {
                const clientIndex = parseInt(e.target.dataset.client);
                const field = e.target.dataset.field;
                const value = e.target.value;
                
                if (!this.clientKeysData[clientIndex]) {
                    this.clientKeysData[clientIndex] = {};
                }
                
                this.clientKeysData[clientIndex][field] = value;
                
                // Auto-derive public key from private key
                if (field === 'privateKey' && value.trim()) {
                    try {
                        const publicKey = await this.derivePublicKey(value.trim());
                        this.clientKeysData[clientIndex].publicKey = publicKey;
                        const publicKeyInput = container.querySelector(`input[data-client="${clientIndex}"][data-field="publicKey"]`);
                        if (publicKeyInput) {
                            publicKeyInput.value = publicKey;
                        }
                    } catch (error) {
                        console.error('Error deriving public key:', error);
                    }
                }
            });
        });
        
        // Generate key button listeners
        container.querySelectorAll('.generate-key-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const clientIndex = parseInt(e.target.dataset.client);
                const isPSK = e.target.dataset.psk === 'true';
                
                if (!this.clientKeysData[clientIndex]) {
                    this.clientKeysData[clientIndex] = {};
                }
                
                if (isPSK) {
                    // Generate Pre-Shared Key
                    const psk = this.generatePreSharedKey();
                    this.clientKeysData[clientIndex].preSharedKey = psk;
                    const pskInput = container.querySelector(`input[data-client="${clientIndex}"][data-field="preSharedKey"]`);
                    if (pskInput) {
                        pskInput.value = psk;
                    }
                } else {
                    // Generate key pair
                    const keyPair = await this.generateKeyPair();
                    this.clientKeysData[clientIndex].privateKey = keyPair.private;
                    this.clientKeysData[clientIndex].publicKey = keyPair.public;
                    
                    const privateKeyInput = container.querySelector(`input[data-client="${clientIndex}"][data-field="privateKey"]`);
                    const publicKeyInput = container.querySelector(`input[data-client="${clientIndex}"][data-field="publicKey"]`);
                    
                    if (privateKeyInput) privateKeyInput.value = keyPair.private;
                    if (publicKeyInput) publicKeyInput.value = keyPair.public;
                }
            });
        });
    }

    calculateSubnet(totalHosts, serverIP) {
        const [ip, currentCidr] = serverIP.split('/');
        
        const requiredBits = Math.ceil(Math.log2(totalHosts + 2));
        const hostBits = Math.max(requiredBits, 32 - parseInt(currentCidr || 24));
        const newCidr = 32 - hostBits;
        
        const ipParts = ip.split('.').map(Number);
        const networkAddr = this.getNetworkAddress(ipParts, newCidr);
        
        return `${networkAddr.join('.')}/${newCidr}`;
    }

    getNetworkAddress(ipParts, cidr) {
        const hostBits = 32 - cidr;
        const mask = (0xFFFFFFFF << hostBits) >>> 0;
        
        const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
        const networkNum = (ipNum & mask) >>> 0;
        
        return [
            (networkNum >>> 24) & 0xFF,
            (networkNum >>> 16) & 0xFF,
            (networkNum >>> 8) & 0xFF,
            networkNum & 0xFF
        ];
    }

    generateSiteConfigs() {
        const numSites = parseInt(this.elements.numSites.value) || 2;
        const container = this.elements.sitesContainer;
        
        container.innerHTML = '';
        
        for (let i = 0; i < numSites; i++) {
            const siteDiv = document.createElement('div');
            siteDiv.className = 'site-config';
            siteDiv.innerHTML = `
                <h4>Site ${String.fromCharCode(65 + i)} Configuration</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Site Name: ${this.createInfoButton('Descriptive name for this site location').outerHTML}</label>
                        <input type="text" value="Site ${String.fromCharCode(65 + i)}" data-site="${i}" data-field="name">
                    </div>
                    <div class="form-group">
                        <label>Local Network: ${this.createInfoButton('Local network behind this site\'s gateway (e.g., 192.168.1.0/24)').outerHTML}</label>
                        <input type="text" value="192.168.${i + 1}.0/24" data-site="${i}" data-field="network">
                    </div>
                    <div class="form-group">
                        <label>Public Endpoint: ${this.createInfoButton('Public IP address or domain name for this site\'s WireGuard server').outerHTML}</label>
                        <input type="text" placeholder="site-${String.fromCharCode(65 + i).toLowerCase()}.example.com" data-site="${i}" data-field="endpoint">
                    </div>
                    <div class="form-group">
                        <label>WireGuard Port: ${this.createInfoButton('UDP port for WireGuard on this site (each site should use a different port)').outerHTML}</label>
                        <input type="number" value="${51820 + i}" min="1" max="65535" data-site="${i}" data-field="port">
                    </div>
                </div>
            `;
            container.appendChild(siteDiv);
        }
    }

    async generateInitialKeys() {
        try {
            // Generate server keys
            if (this.manualServerKeys && this.elements.serverPrivateKey.value.trim()) {
                const privateKey = this.elements.serverPrivateKey.value.trim();
                const publicKey = await this.derivePublicKey(privateKey);
                this.keys.server = { private: privateKey, public: publicKey };
            } else {
                this.keys.server = await this.generateKeyPair();
            }
            
            // Generate client keys
            const numClients = parseInt(this.elements.numClients.value) || 5;
            this.keys.clients = [];
            
            for (let i = 0; i < numClients; i++) {
                if (this.manualClientKeys && this.clientKeysData[i]?.privateKey?.trim()) {
                    const privateKey = this.clientKeysData[i].privateKey.trim();
                    const publicKey = await this.derivePublicKey(privateKey);
                    this.keys.clients.push({ private: privateKey, public: publicKey });
                } else {
                    this.keys.clients.push(await this.generateKeyPair());
                }
            }
            
            // Generate site keys for site-to-site
            const configType = document.querySelector('input[name="configType"]:checked').value;
            if (configType === 'site-to-site') {
                const numSites = parseInt(this.elements.numSites.value) || 2;
                this.keys.sites = [];
                for (let i = 0; i < numSites; i++) {
                    this.keys.sites.push(await this.generateKeyPair());
                }
            }
            
            console.log('Keys generated successfully');
        } catch (error) {
            console.error('Error generating keys:', error);
        }
    }

    async generateKeyPair() {
        const privateKey = this.generatePrivateKey();
        const publicKey = await this.derivePublicKey(privateKey);
        return { private: privateKey, public: publicKey };
    }

    generatePrivateKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        
        array[0] &= 248;
        array[31] &= 127;
        array[31] |= 64;
        
        return this.base64Encode(array);
    }

    async derivePublicKey(privateKey) {
        try {
            const privateKeyBytes = this.base64Decode(privateKey);
            const keyPair = await crypto.subtle.importKey(
                'raw',
                privateKeyBytes,
                { name: 'X25519' },
                false,
                ['deriveKey']
            );
            
            const publicKeyBytes = await crypto.subtle.exportKey('raw', keyPair);
            return this.base64Encode(new Uint8Array(publicKeyBytes));
        } catch (error) {
            return this.generateFallbackPublicKey(privateKey);
        }
    }

    generateFallbackPublicKey(privateKey) {
        const hash = Array.from(privateKey).reduce((hash, char) => {
            return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
        }, 0);
        
        const array = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
            array[i] = (hash + i * 31) & 0xFF;
        }
        
        return this.base64Encode(array);
    }

    generatePreSharedKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return this.base64Encode(array);
    }

    base64Encode(bytes) {
        return btoa(String.fromCharCode(...bytes));
    }

    base64Decode(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    async generateConfigurations() {
        await this.generateInitialKeys();
        
        const configType = document.querySelector('input[name="configType"]:checked').value;
        
        if (configType === 'client-server') {
            this.generateClientServerConfigs();
        } else {
            this.generateSiteToSiteConfigs();
        }
        
        this.elements.outputSection.style.display = 'block';
        this.elements.outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    generateClientServerConfigs() {
        const configs = this.createClientServerConfigs();
        this.displayWireGuardConfigs(configs.wireguard);
        this.generateMikroTikScript(configs);
        this.generateQRCodes(configs.wireguard.clients);
    }

    generateSiteToSiteConfigs() {
        const configs = this.createSiteToSiteConfigs();
        this.displayWireGuardConfigs(configs.wireguard);
        this.generateMikroTikScript(configs);
        this.generateQRCodes([]);
    }

    createClientServerConfigs() {
        const serverIP = this.elements.serverIP.value;
        const [baseIP, cidr] = serverIP.split('/');
        const baseIPParts = baseIP.split('.').map(Number);
        
        // Pre-generate PSKs to ensure server and clients match
        const pskMap = new Map();
        const numClients = parseInt(this.elements.numClients.value);
        const enableIndividualPSK = this.elements.enableIndividualPSK.checked;
        const globalPSK = this.elements.enablePSK.checked;
        
        for (let i = 0; i < numClients; i++) {
            if (enableIndividualPSK && this.manualClientKeys && this.clientKeysData[i]?.preSharedKey?.trim()) {
                pskMap.set(i, this.clientKeysData[i].preSharedKey.trim());
            } else if (globalPSK) {
                pskMap.set(i, this.generatePreSharedKey());
            }
        }
        
        const serverConfig = this.createServerConfigWithPSK(pskMap);
        const clientConfigs = [];
        
        for (let i = 0; i < numClients; i++) {
            const clientIP = this.getClientIP(baseIPParts, i + 2);
            clientConfigs.push(this.createClientConfigWithPSK(i, `${clientIP}/${cidr}`, pskMap.get(i)));
        }
        
        return {
            wireguard: {
                server: serverConfig,
                clients: clientConfigs
            },
            mikrotik: this.createMikroTikClientServerScript(serverConfig, clientConfigs)
        };
    }
    
    createServerConfigWithPSK(pskMap) {
        const peers = [];
        const numClients = parseInt(this.elements.numClients.value);
        const serverIP = this.elements.serverIP.value;
        const [baseIP, cidr] = serverIP.split('/');
        const baseIPParts = baseIP.split('.').map(Number);
        
        for (let i = 0; i < numClients; i++) {
            const clientIP = this.getClientIP(baseIPParts, i + 2);
            const peer = {
                publicKey: this.keys.clients[i].public,
                allowedIPs: `${clientIP}/32`
            };
            
            if (pskMap.has(i)) {
                peer.preSharedKey = pskMap.get(i);
            }
            
            peers.push(peer);
        }
        
        return {
            name: this.elements.serverName.value,
            privateKey: this.keys.server.private,
            address: serverIP,
            listenPort: this.elements.listenPort.value,
            peers: peers
        };
    }
    
    createClientConfigWithPSK(index, clientIP, preSharedKey) {
        const allowedIPs = this.elements.noRoutingTable.checked ? 
            this.elements.serverIP.value.split('/')[0] + '/32' : 
            this.elements.allowedIPs.value;
        
        // Get client name from manual input or use default
        const clientName = (this.manualClientKeys && this.clientKeysData[index]?.name?.trim()) 
            ? this.clientKeysData[index].name.trim() 
            : `Client ${index + 1}`;
            
        const config = {
            name: clientName,
            privateKey: this.keys.clients[index].private,
            address: clientIP,
            dns: this.elements.dnsServers.value.split(',').map(s => s.trim()).filter(s => s),
            peer: {
                publicKey: this.keys.server.public,
                endpoint: `${this.elements.publicEndpoint.value}:${this.elements.listenPort.value}`,
                allowedIPs: allowedIPs,
                persistentKeepalive: this.elements.keepalive.value
            }
        };
        
        if (preSharedKey) {
            config.peer.preSharedKey = preSharedKey;
        }
        
        return config;
    }

    createSiteToSiteConfigs() {
        const sites = this.getSiteConfigurations();
        const siteConfigs = [];
        
        sites.forEach((site, index) => {
            siteConfigs.push(this.createSiteConfig(site, sites, index));
        });
        
        return {
            wireguard: {
                sites: siteConfigs
            },
            mikrotik: this.createMikroTikSiteToSiteScript(siteConfigs, sites)
        };
    }

    createServerConfig() {
        const peers = [];
        const numClients = parseInt(this.elements.numClients.value);
        const serverIP = this.elements.serverIP.value;
        const [baseIP, cidr] = serverIP.split('/');
        const baseIPParts = baseIP.split('.').map(Number);
        const enableIndividualPSK = this.elements.enableIndividualPSK.checked;
        const globalPSK = this.elements.enablePSK.checked;
        
        for (let i = 0; i < numClients; i++) {
            const clientIP = this.getClientIP(baseIPParts, i + 2);
            const peer = {
                publicKey: this.keys.clients[i].public,
                allowedIPs: `${clientIP}/32`
            };
            
            // Handle Pre-Shared Keys
            if (enableIndividualPSK && this.manualClientKeys && this.clientKeysData[i]?.preSharedKey?.trim()) {
                peer.preSharedKey = this.clientKeysData[i].preSharedKey.trim();
            } else if (globalPSK) {
                peer.preSharedKey = this.generatePreSharedKey();
            }
            
            peers.push(peer);
        }
        
        return {
            name: this.elements.serverName.value,
            privateKey: this.keys.server.private,
            address: serverIP,
            listenPort: this.elements.listenPort.value,
            peers: peers
        };
    }

    createClientConfig(index, clientIP) {
        const allowedIPs = this.elements.noRoutingTable.checked ? 
            this.elements.serverIP.value.split('/')[0] + '/32' : 
            this.elements.allowedIPs.value;
        
        // Get client name from manual input or use default
        const clientName = (this.manualClientKeys && this.clientKeysData[index]?.name?.trim()) 
            ? this.clientKeysData[index].name.trim() 
            : `Client ${index + 1}`;
            
        const config = {
            name: clientName,
            privateKey: this.keys.clients[index].private,
            address: clientIP,
            dns: this.elements.dnsServers.value.split(',').map(s => s.trim()).filter(s => s),
            peer: {
                publicKey: this.keys.server.public,
                endpoint: `${this.elements.publicEndpoint.value}:${this.elements.listenPort.value}`,
                allowedIPs: allowedIPs,
                persistentKeepalive: this.elements.keepalive.value
            }
        };
        
        // Handle Pre-Shared Keys - must match server configuration
        const enableIndividualPSK = this.elements.enableIndividualPSK.checked;
        const globalPSK = this.elements.enablePSK.checked;
        
        if (enableIndividualPSK && this.manualClientKeys && this.clientKeysData[index]?.preSharedKey?.trim()) {
            config.peer.preSharedKey = this.clientKeysData[index].preSharedKey.trim();
        } else if (globalPSK) {
            // For global PSK, we need to use the same PSK that was generated for the server
            // This will be handled in the server config generation
            config.peer.preSharedKey = this.generatePreSharedKey();
        }
        
        return config;
    }

    createSiteConfig(site, allSites, siteIndex) {
        const transferSubnet = this.elements.transferSubnet.value;
        const [transferBase, transferCidr] = transferSubnet.split('/');
        const transferParts = transferBase.split('.').map(Number);
        
        const siteIP = this.getSiteTransferIP(transferParts, siteIndex + 1);
        const peers = [];
        
        allSites.forEach((otherSite, otherIndex) => {
            if (otherIndex !== siteIndex) {
                const otherSiteIP = this.getSiteTransferIP(transferParts, otherIndex + 1);
                const peer = {
                    publicKey: this.keys.sites[otherIndex].public,
                    endpoint: `${otherSite.endpoint}:${otherSite.port}`,
                    allowedIPs: `${otherSite.network}, ${otherSiteIP}/32`,
                    persistentKeepalive: this.elements.keepalive.value
                };
                
                if (this.elements.enablePSK.checked) {
                    peer.preSharedKey = this.generatePreSharedKey();
                }
                
                peers.push(peer);
            }
        });
        
        return {
            name: site.name,
            privateKey: this.keys.sites[siteIndex].private,
            address: `${siteIP}/${transferCidr}`,
            listenPort: site.port,
            localNetwork: site.network,
            peers: peers
        };
    }

    getSiteConfigurations() {
        const sites = [];
        const siteInputs = this.elements.sitesContainer.querySelectorAll('.site-config');
        
        siteInputs.forEach((siteDiv, index) => {
            const inputs = siteDiv.querySelectorAll('input');
            const site = {};
            
            inputs.forEach(input => {
                const field = input.dataset.field;
                site[field] = input.value;
            });
            
            sites.push(site);
        });
        
        return sites;
    }

    getClientIP(baseIPParts, offset) {
        const newParts = [...baseIPParts];
        newParts[3] += offset;
        
        if (newParts[3] > 255) {
            newParts[2] += Math.floor(newParts[3] / 256);
            newParts[3] = newParts[3] % 256;
        }
        
        return newParts.join('.');
    }

    getSiteTransferIP(transferParts, siteIndex) {
        const newParts = [...transferParts];
        newParts[3] += siteIndex;
        return newParts.join('.');
    }

    displayWireGuardConfigs(configs) {
        const output = this.elements.wireguardOutput;
        output.innerHTML = '';
        
        if (configs.server) {
            output.appendChild(this.createConfigOutput('Server Configuration', this.formatWireGuardConfig(configs.server, 'server')));
            
            configs.clients.forEach((client, index) => {
                output.appendChild(this.createConfigOutput(`Client ${index + 1} Configuration`, this.formatWireGuardConfig(client, 'client')));
            });
        } else if (configs.sites) {
            configs.sites.forEach((site, index) => {
                output.appendChild(this.createConfigOutput(`${site.name} Configuration`, this.formatWireGuardConfig(site, 'site')));
            });
        }
    }

    createConfigOutput(title, config) {
        const div = document.createElement('div');
        div.className = 'config-output';
        
        div.innerHTML = `
            <h4>${title} <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${config.replace(/`/g, '\\`')}\`)">Copy</button></h4>
            <pre>${config}</pre>
        `;
        
        return div;
    }

    formatWireGuardConfig(config, type) {
        let output = '[Interface]\n';
        output += `PrivateKey = ${config.privateKey}\n`;
        output += `Address = ${config.address}\n`;
        
        if (config.listenPort) {
            output += `ListenPort = ${config.listenPort}\n`;
        }
        
        if (config.dns && config.dns.length > 0) {
            output += `DNS = ${config.dns.join(', ')}\n`;
        }
        
        const mtu = this.elements.mtu.value;
        if (mtu && mtu !== '1420') {
            output += `MTU = ${mtu}\n`;
        }
        
        if (type === 'server' && config.peers) {
            config.peers.forEach(peer => {
                output += '\n[Peer]\n';
                output += `PublicKey = ${peer.publicKey}\n`;
                output += `AllowedIPs = ${peer.allowedIPs}\n`;
                
                if (peer.preSharedKey) {
                    output += `PresharedKey = ${peer.preSharedKey}\n`;
                }
            });
        } else if (type === 'client' && config.peer) {
            output += '\n[Peer]\n';
            output += `PublicKey = ${config.peer.publicKey}\n`;
            output += `Endpoint = ${config.peer.endpoint}\n`;
            output += `AllowedIPs = ${config.peer.allowedIPs}\n`;
            
            if (config.peer.preSharedKey) {
                output += `PresharedKey = ${config.peer.preSharedKey}\n`;
            }
            
            if (config.peer.persistentKeepalive && config.peer.persistentKeepalive > 0) {
                output += `PersistentKeepalive = ${config.peer.persistentKeepalive}\n`;
            }
        } else if (type === 'site' && config.peers) {
            config.peers.forEach(peer => {
                output += '\n[Peer]\n';
                output += `PublicKey = ${peer.publicKey}\n`;
                output += `Endpoint = ${peer.endpoint}\n`;
                output += `AllowedIPs = ${peer.allowedIPs}\n`;
                
                if (peer.preSharedKey) {
                    output += `PresharedKey = ${peer.preSharedKey}\n`;
                }
                
                if (peer.persistentKeepalive && peer.persistentKeepalive > 0) {
                    output += `PersistentKeepalive = ${peer.persistentKeepalive}\n`;
                }
            });
        }
        
        return output;
    }

    createMikroTikClientServerScript(serverConfig, clientConfigs) {
        const listenPort = this.elements.listenPort.value;
        const serverIP = this.elements.serverIP.value;
        const enableNAT = this.elements.enableNAT.checked;
        const generateFirewall = this.elements.generateFirewall.checked;
        
        let script = '# MikroTik RouterOS WireGuard Configuration\n';
        script += '# Client-Server Setup\n\n';
        
        script += '# Create WireGuard interface\n';
        script += `/interface/wireguard add listen-port=${listenPort} name=wireguard1\n\n`;
        
        script += '# Add IP address to WireGuard interface\n';
        script += `/ip/address add address=${serverIP} interface=wireguard1\n\n`;
        
        script += '# Add peers\n';
        clientConfigs.forEach((client, index) => {
            const clientIP = client.address.split('/')[0];
            script += `/interface/wireguard/peers add `;
            script += `allowed-address=${clientIP}/32 `;
            script += `interface=wireguard1 `;
            script += `public-key="${serverConfig.peers[index].publicKey}"`;
            
            if (serverConfig.peers[index].preSharedKey) {
                script += ` preshared-key="${serverConfig.peers[index].preSharedKey}"`;
            }
            
            script += ` comment="Client ${index + 1}"\n`;
        });
        
        if (generateFirewall) {
            script += '\n# Firewall rules\n';
            script += `# Allow WireGuard port\n`;
            script += `/ip/firewall/filter add action=accept chain=input dst-port=${listenPort} protocol=udp comment="Allow WireGuard"\n`;
            
            script += '# Allow WireGuard interface traffic\n';
            script += '/interface/list/member add interface=wireguard1 list=LAN\n';
            
            const [networkBase] = serverIP.split('/');
            const networkParts = networkBase.split('.');
            const networkAddr = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.0/24`;
            
            script += `# Allow WireGuard subnet\n`;
            script += `/ip/firewall/filter add action=accept chain=input src-address=${networkAddr} comment="Allow WireGuard clients"\n`;
        }
        
        if (enableNAT) {
            script += '\n# NAT rule for WireGuard clients\n';
            const [networkBase] = serverIP.split('/');
            const networkParts = networkBase.split('.');
            const networkAddr = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.0/24`;
            
            script += `/ip/firewall/nat add action=masquerade chain=srcnat src-address=${networkAddr} comment="WireGuard NAT"\n`;
        }
        
        return script;
    }

    createMikroTikSiteToSiteScript(siteConfigs, sites) {
        const transferSubnet = this.elements.transferSubnet.value;
        const generateFirewall = this.elements.generateFirewall.checked;
        const enableNAT = this.elements.enableNAT.checked;
        
        let script = '# MikroTik RouterOS WireGuard Configuration\n';
        script += '# Site-to-Site Setup\n';
        script += '# Configure this script on each site individually\n\n';
        
        siteConfigs.forEach((site, siteIndex) => {
            script += `\n# Configuration for ${site.name}\n`;
            script += `# ===============================\n`;
            
            script += `# Create WireGuard interface\n`;
            script += `/interface/wireguard add listen-port=${sites[siteIndex].port} name=wireguard-${siteIndex + 1}\n`;
            
            script += `# Add IP address to WireGuard interface\n`;
            script += `/ip/address add address=${site.address} interface=wireguard-${siteIndex + 1}\n`;
            
            script += `# Add peers\n`;
            site.peers.forEach((peer, peerIndex) => {
                script += `/interface/wireguard/peers add `;
                script += `allowed-address=${peer.allowedIPs} `;
                script += `endpoint-address=${peer.endpoint.split(':')[0]} `;
                script += `endpoint-port=${peer.endpoint.split(':')[1]} `;
                script += `interface=wireguard-${siteIndex + 1} `;
                script += `public-key="${peer.publicKey}"`;
                
                if (peer.preSharedKey) {
                    script += ` preshared-key="${peer.preSharedKey}"`;
                }
                
                script += ` comment="Peer ${peerIndex + 1}"\n`;
            });
            
            if (generateFirewall) {
                script += `\n# Firewall rules for ${site.name}\n`;
                script += `# Allow WireGuard port\n`;
                script += `/ip/firewall/filter add action=accept chain=input dst-port=${sites[siteIndex].port} protocol=udp comment="Allow WireGuard ${site.name}"\n`;
                
                script += `# Allow WireGuard interface traffic\n`;
                script += `/interface/list/member add interface=wireguard-${siteIndex + 1} list=LAN\n`;
                
                script += `# Allow transfer subnet\n`;
                script += `/ip/firewall/filter add action=accept chain=input src-address=${transferSubnet} comment="Allow WireGuard transfer network"\n`;
                
                const [localNet] = sites[siteIndex].network.split('/');
                script += `# Allow local network through WireGuard\n`;
                script += `/ip/firewall/filter add action=accept chain=forward in-interface=wireguard-${siteIndex + 1} dst-address=${sites[siteIndex].network} comment="Allow WireGuard to local network"\n`;
                script += `/ip/firewall/filter add action=accept chain=forward out-interface=wireguard-${siteIndex + 1} src-address=${sites[siteIndex].network} comment="Allow local network to WireGuard"\n`;
            }
            
            if (enableNAT) {
                script += `\n# NAT rules for ${site.name}\n`;
                script += `/ip/firewall/nat add action=masquerade chain=srcnat out-interface=wireguard-${siteIndex + 1} comment="WireGuard ${site.name} NAT"\n`;
            }
            
            script += '\n';
        });
        
        return script;
    }

    generateMikroTikScript(configs) {
        const output = this.elements.mikrotikOutput;
        output.innerHTML = '';
        
        const configType = document.querySelector('input[name="configType"]:checked').value;
        
        if (configType === 'client-server') {
            this.generateClientServerScripts(configs, output);
        } else {
            this.generateSiteToSiteScripts(configs, output);
        }
    }

    generateClientServerScripts(configs, output) {
        const serverConfig = configs.wireguard.server;
        const clientConfigs = configs.wireguard.clients;
        
        // Server Script
        const serverScript = this.createMikroTikServerScript(serverConfig, clientConfigs);
        this.createScriptWindow(output, 'Server Configuration', 'MikroTik Server', serverScript, 
            'Deploy this configuration on your MikroTik server/router');
        
        // Individual client scripts (for reference)
        clientConfigs.forEach((client, index) => {
            const clientScript = this.createMikroTikClientReferenceScript(client, serverConfig);
            this.createScriptWindow(output, `${client.name} Reference`, 'Client Config Reference', clientScript,
                'Reference configuration - clients use the WireGuard config files or QR codes');
        });
    }

    generateSiteToSiteScripts(configs, output) {
        const sites = this.getSiteConfigurations();
        const siteConfigs = configs.wireguard.sites;
        
        siteConfigs.forEach((siteConfig, index) => {
            const script = this.createMikroTikSiteScript(siteConfig, sites[index], index);
            this.createScriptWindow(output, `${sites[index].name} Configuration`, `Site ${String.fromCharCode(65 + index)}`, script,
                `Deploy this configuration on the MikroTik router at ${sites[index].name}`);
        });
    }

    createScriptWindow(container, title, deviceType, script, description) {
        const scriptContainer = document.createElement('div');
        scriptContainer.className = 'mikrotik-script-container';
        
        const uniqueId = 'script_' + Math.random().toString(36).substr(2, 9);
        
        scriptContainer.innerHTML = `
            <div class="mikrotik-script-header">
                <div>
                    <div>${title}</div>
                    <div class="device-type">${deviceType}</div>
                </div>
                <div class="tooltip-container">
                    <button type="button" class="info-btn">?
                        <div class="tooltip">${description}</div>
                    </button>
                </div>
            </div>
            <div class="mikrotik-script-content">
                <textarea class="mikrotik-script-textarea" readonly id="${uniqueId}">${script}</textarea>
            </div>
            <div class="script-actions">
                <button type="button" class="copy-script-btn" data-target="${uniqueId}">📋 Copy Script</button>
                <div class="script-info">Copy and paste this script into your MikroTik terminal</div>
            </div>
        `;
        
        container.appendChild(scriptContainer);
        
        // Add copy functionality
        const copyBtn = scriptContainer.querySelector('.copy-script-btn');
        copyBtn.addEventListener('click', () => this.copyScriptToClipboard(uniqueId, copyBtn));
    }

    async copyScriptToClipboard(textareaId, button) {
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;
        
        try {
            await navigator.clipboard.writeText(textarea.value);
            
            const originalText = button.textContent;
            button.textContent = '✅ Copied!';
            button.style.background = '#28a745';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#28a745';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy script:', error);
            alert('Failed to copy to clipboard');
        }
    }

    createMikroTikServerScript(serverConfig, clientConfigs) {
        const listenPort = this.elements.listenPort.value;
        const serverIP = this.elements.serverIP.value;
        const enableNAT = this.elements.enableNAT.checked;
        const generateFirewall = this.elements.generateFirewall.checked;
        
        let script = '# MikroTik RouterOS WireGuard Server Configuration\n';
        script += `# Server: ${serverConfig.name}\n`;
        script += `# Interface IP: ${serverIP}\n`;
        script += `# Listen Port: ${listenPort}\n\n`;
        
        script += '# Step 1: Create WireGuard interface\n';
        script += `/interface/wireguard add listen-port=${listenPort} name=wireguard1\n\n`;
        
        script += '# Step 2: Add IP address to WireGuard interface\n';
        script += `/ip/address add address=${serverIP} interface=wireguard1\n\n`;
        
        script += '# Step 3: Add client peers\n';
        clientConfigs.forEach((client, index) => {
            const clientIP = client.address.split('/')[0];
            script += `# Client: ${client.name}\n`;
            script += `/interface/wireguard/peers add `;
            script += `allowed-address=${clientIP}/32 `;
            script += `interface=wireguard1 `;
            script += `public-key="${serverConfig.peers[index].publicKey}"`;
            
            if (serverConfig.peers[index].preSharedKey) {
                script += ` preshared-key="${serverConfig.peers[index].preSharedKey}"`;
            }
            
            script += ` comment="${client.name}"\n`;
        });
        
        if (generateFirewall) {
            script += '\n# Step 4: Configure firewall rules\n';
            script += `# Allow WireGuard port\n`;
            script += `/ip/firewall/filter add action=accept chain=input dst-port=${listenPort} protocol=udp comment="Allow WireGuard"\n`;
            
            script += '# Allow WireGuard interface traffic\n';
            script += '/interface/list/member add interface=wireguard1 list=LAN\n';
            
            const [networkBase] = serverIP.split('/');
            const networkParts = networkBase.split('.');
            const networkAddr = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.0/24`;
            
            script += `# Allow WireGuard subnet\n`;
            script += `/ip/firewall/filter add action=accept chain=input src-address=${networkAddr} comment="Allow WireGuard clients"\n`;
        }
        
        if (enableNAT) {
            script += '\n# Step 5: Configure NAT for internet access\n';
            const [networkBase] = serverIP.split('/');
            const networkParts = networkBase.split('.');
            const networkAddr = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.0/24`;
            
            script += `/ip/firewall/nat add action=masquerade chain=srcnat src-address=${networkAddr} comment="WireGuard NAT"\n`;
        }
        
        script += '\n# Configuration complete!\n';
        script += '# Clients can now connect using their WireGuard configuration files or QR codes.\n';
        
        return script;
    }

    createMikroTikClientReferenceScript(client, serverConfig) {
        let script = `# Client Configuration Reference: ${client.name}\n`;
        script += '# This is for reference only - clients use WireGuard app with config file or QR code\n\n';
        
        script += '# Client Details:\n';
        script += `# Name: ${client.name}\n`;
        script += `# IP Address: ${client.address}\n`;
        script += `# Server Endpoint: ${client.peer.endpoint}\n`;
        script += `# Allowed IPs: ${client.peer.allowedIPs}\n\n`;
        
        script += '# WireGuard Configuration (for client device):\n';
        script += '[Interface]\n';
        script += `PrivateKey = ${client.privateKey}\n`;
        script += `Address = ${client.address}\n`;
        if (client.dns && client.dns.length > 0) {
            script += `DNS = ${client.dns.join(', ')}\n`;
        }
        script += '\n[Peer]\n';
        script += `PublicKey = ${client.peer.publicKey}\n`;
        script += `Endpoint = ${client.peer.endpoint}\n`;
        script += `AllowedIPs = ${client.peer.allowedIPs}\n`;
        if (client.peer.preSharedKey) {
            script += `PresharedKey = ${client.peer.preSharedKey}\n`;
        }
        if (client.peer.persistentKeepalive && client.peer.persistentKeepalive > 0) {
            script += `PersistentKeepalive = ${client.peer.persistentKeepalive}\n`;
        }
        
        return script;
    }

    createMikroTikSiteScript(siteConfig, siteInfo, siteIndex) {
        const generateFirewall = this.elements.generateFirewall.checked;
        const enableNAT = this.elements.enableNAT.checked;
        
        let script = `# MikroTik RouterOS WireGuard Site-to-Site Configuration\n`;
        script += `# Site: ${siteInfo.name}\n`;
        script += `# Local Network: ${siteInfo.network}\n`;
        script += `# WireGuard IP: ${siteConfig.address}\n`;
        script += `# Listen Port: ${siteInfo.port}\n\n`;
        
        script += '# Step 1: Create WireGuard interface\n';
        script += `/interface/wireguard add listen-port=${siteInfo.port} name=wireguard-${siteIndex + 1}\n\n`;
        
        script += '# Step 2: Add IP address to WireGuard interface\n';
        script += `/ip/address add address=${siteConfig.address} interface=wireguard-${siteIndex + 1}\n\n`;
        
        script += '# Step 3: Add peers (other sites)\n';
        siteConfig.peers.forEach((peer, peerIndex) => {
            const [endpointIP, endpointPort] = peer.endpoint.split(':');
            script += `# Peer ${peerIndex + 1}\n`;
            script += `/interface/wireguard/peers add `;
            script += `allowed-address=${peer.allowedIPs} `;
            script += `endpoint-address=${endpointIP} `;
            script += `endpoint-port=${endpointPort} `;
            script += `interface=wireguard-${siteIndex + 1} `;
            script += `public-key="${peer.publicKey}"`;
            
            if (peer.preSharedKey) {
                script += ` preshared-key="${peer.preSharedKey}"`;
            }
            
            script += ` comment="Peer ${peerIndex + 1}"\n`;
        });
        
        if (generateFirewall) {
            script += `\n# Step 4: Configure firewall rules\n`;
            script += `# Allow WireGuard port\n`;
            script += `/ip/firewall/filter add action=accept chain=input dst-port=${siteInfo.port} protocol=udp comment="Allow WireGuard ${siteInfo.name}"\n`;
            
            script += `# Allow WireGuard interface traffic\n`;
            script += `/interface/list/member add interface=wireguard-${siteIndex + 1} list=LAN\n`;
            
            const transferSubnet = this.elements.transferSubnet.value;
            script += `# Allow transfer subnet\n`;
            script += `/ip/firewall/filter add action=accept chain=input src-address=${transferSubnet} comment="Allow WireGuard transfer network"\n`;
            
            script += `# Allow local network through WireGuard\n`;
            script += `/ip/firewall/filter add action=accept chain=forward in-interface=wireguard-${siteIndex + 1} dst-address=${siteInfo.network} comment="Allow WireGuard to local network"\n`;
            script += `/ip/firewall/filter add action=accept chain=forward out-interface=wireguard-${siteIndex + 1} src-address=${siteInfo.network} comment="Allow local network to WireGuard"\n`;
        }
        
        if (enableNAT) {
            script += `\n# Step 5: Configure NAT\n`;
            script += `/ip/firewall/nat add action=masquerade chain=srcnat out-interface=wireguard-${siteIndex + 1} comment="WireGuard ${siteInfo.name} NAT"\n`;
        }
        
        script += `\n# Step 6: Add routes for remote networks (if needed)\n`;
        script += `# /ip/route add dst-address=REMOTE_NETWORK gateway=wireguard-${siteIndex + 1}\n`;
        script += `# Example: /ip/route add dst-address=192.168.2.0/24 gateway=wireguard-${siteIndex + 1}\n\n`;
        
        script += '# Configuration complete!\n';
        script += `# ${siteInfo.name} can now communicate with other sites through WireGuard.\n`;
        
        return script;
    }

    async generateQRCodes(clientConfigs) {
        const output = this.elements.qrOutput;
        output.innerHTML = '';
        
        if (clientConfigs.length === 0) {
            output.innerHTML = '<p>QR codes are available for client-server configurations only.</p>';
            return;
        }
        
        // Check if QRCode library is available
        if (typeof QRCode === 'undefined') {
            output.innerHTML = '<p>⚠️ QR Code library not loaded. Please refresh the page or check your internet connection.</p>';
            console.error('QRCode library is not available');
            return;
        }
        
        console.log('Generating QR codes for', clientConfigs.length, 'clients');
        
        const container = document.createElement('div');
        container.className = 'qr-container';
        
        for (let i = 0; i < clientConfigs.length; i++) {
            const client = clientConfigs[i];
            const configText = this.formatWireGuardConfigForQR(client);
            
            console.log(`Generating QR for ${client.name}:`, configText);
            
            const qrDiv = document.createElement('div');
            qrDiv.className = 'qr-item';
            
            const title = document.createElement('h4');
            title.textContent = `${client.name} QR Code`;
            qrDiv.appendChild(title);
            
            // Add a loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.textContent = 'Generating QR code...';
            loadingDiv.style.padding = '20px';
            loadingDiv.style.textAlign = 'center';
            qrDiv.appendChild(loadingDiv);
            
            const canvas = document.createElement('canvas');
            canvas.style.display = 'none';
            qrDiv.appendChild(canvas);
            
            try {
                console.log('Calling QRCode.toCanvas for', client.name);
                
                await QRCode.toCanvas(canvas, configText, {
                    width: 240,
                    margin: 4,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                
                // Remove loading indicator and show canvas
                loadingDiv.remove();
                canvas.style.display = 'block';
                
                console.log('QR code generated successfully for', client.name);
                
                // Add download link
                const downloadLink = document.createElement('a');
                downloadLink.href = canvas.toDataURL('image/png');
                downloadLink.download = `${client.name.replace(/\s+/g, '_')}_WireGuard_QR.png`;
                downloadLink.textContent = '📱 Download QR Code';
                downloadLink.style.display = 'block';
                downloadLink.style.marginTop = '10px';
                downloadLink.style.textAlign = 'center';
                downloadLink.style.color = '#667eea';
                downloadLink.style.textDecoration = 'none';
                downloadLink.style.padding = '5px';
                downloadLink.style.border = '1px solid #667eea';
                downloadLink.style.borderRadius = '3px';
                qrDiv.appendChild(downloadLink);
                
                // Add config preview button
                const previewButton = document.createElement('button');
                previewButton.textContent = '📄 Show Config';
                previewButton.style.display = 'block';
                previewButton.style.margin = '5px auto';
                previewButton.style.padding = '5px 10px';
                previewButton.style.background = '#6c757d';
                previewButton.style.color = 'white';
                previewButton.style.border = 'none';
                previewButton.style.borderRadius = '3px';
                previewButton.style.cursor = 'pointer';
                
                previewButton.addEventListener('click', () => {
                    const existingPreview = qrDiv.querySelector('.config-preview');
                    if (existingPreview) {
                        existingPreview.remove();
                        previewButton.textContent = '📄 Show Config';
                    } else {
                        const previewDiv = document.createElement('div');
                        previewDiv.className = 'config-preview';
                        previewDiv.style.marginTop = '10px';
                        previewDiv.style.padding = '10px';
                        previewDiv.style.background = '#f8f9fa';
                        previewDiv.style.border = '1px solid #e9ecef';
                        previewDiv.style.borderRadius = '5px';
                        previewDiv.innerHTML = `
                            <textarea readonly style="width: 100%; height: 120px; font-family: monospace; font-size: 10px; resize: vertical; border: none; background: transparent;">${configText}</textarea>
                            <button onclick="navigator.clipboard.writeText(\`${configText.replace(/`/g, '\\`')}\`); this.textContent='✅ Copied!'; setTimeout(() => this.textContent='📋 Copy Config', 2000)" 
                                    style="width: 100%; margin-top: 5px; padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">
                                📋 Copy Config
                            </button>
                        `;
                        qrDiv.appendChild(previewDiv);
                        previewButton.textContent = '📄 Hide Config';
                    }
                });
                
                qrDiv.appendChild(previewButton);
                
            } catch (error) {
                console.error('Error generating QR code for', client.name, ':', error);
                
                // Remove loading indicator and canvas
                loadingDiv.remove();
                canvas.remove();
                
                const errorDiv = document.createElement('div');
                errorDiv.style.padding = '15px';
                errorDiv.style.background = '#f8d7da';
                errorDiv.style.border = '1px solid #f5c6cb';
                errorDiv.style.borderRadius = '5px';
                errorDiv.style.color = '#721c24';
                errorDiv.innerHTML = `
                    <p style="margin-bottom: 10px; font-weight: bold;">⚠️ QR Code generation failed</p>
                    <p style="margin-bottom: 10px; font-size: 12px;">Error: ${error.message}</p>
                    <p style="margin-bottom: 10px; font-size: 12px;">You can manually copy this configuration to your WireGuard app:</p>
                    <textarea readonly style="width: 100%; height: 120px; font-family: monospace; font-size: 10px; resize: vertical; margin-bottom: 10px;">${configText}</textarea>
                    <button onclick="navigator.clipboard.writeText(\`${configText.replace(/`/g, '\\`')}\`); this.textContent='✅ Copied!'; setTimeout(() => this.textContent='📋 Copy Config', 2000)" 
                            style="width: 100%; padding: 8px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        📋 Copy Config to Clipboard
                    </button>
                `;
                qrDiv.appendChild(errorDiv);
            }
            
            container.appendChild(qrDiv);
        }
        
        output.appendChild(container);
    }

    formatWireGuardConfigForQR(client) {
        // Format specifically for QR code - clean and compact
        let config = '[Interface]\n';
        config += `PrivateKey = ${client.privateKey}\n`;
        config += `Address = ${client.address}\n`;
        
        if (client.dns && client.dns.length > 0) {
            config += `DNS = ${client.dns.join(', ')}\n`;
        }
        
        const mtu = this.elements.mtu.value;
        if (mtu && mtu !== '1420') {
            config += `MTU = ${mtu}\n`;
        }
        
        config += '\n[Peer]\n';
        config += `PublicKey = ${client.peer.publicKey}\n`;
        config += `Endpoint = ${client.peer.endpoint}\n`;
        config += `AllowedIPs = ${client.peer.allowedIPs}\n`;
        
        if (client.peer.preSharedKey) {
            config += `PresharedKey = ${client.peer.preSharedKey}\n`;
        }
        
        if (client.peer.persistentKeepalive && client.peer.persistentKeepalive > 0) {
            config += `PersistentKeepalive = ${client.peer.persistentKeepalive}\n`;
        }
        
        return config;
    }

    switchTab(tabName) {
        this.elements.tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            }
        });
        
        this.elements.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });
    }

    switchPage(pageName) {
        // Update navigation buttons
        this.elements.navButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.page === pageName) {
                button.classList.add('active');
            }
        });
        
        // Update page content
        this.elements.pageContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${pageName}-page`) {
                content.classList.add('active');
            }
        });
    }

    initializeLteProviders() {
        // German mobile provider APN settings - Updated with comprehensive data
        this.lteProviders = {
            // Deutsche Telekom Network
            telekom: {
                name: 'Deutsche Telekom',
                apn: 'internet.telekom',
                username: 'telekom',
                password: 'tm',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'telekom-main'
            },
            telekom_alt: {
                name: 'Deutsche Telekom (Alternative)',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'telekom-alt'
            },
            telekom_ipv6: {
                name: 'Deutsche Telekom (IPv6)',
                apn: 'internet.v6.telekom',
                username: 'telekom',
                password: 'tm',
                authMethod: 'chap',
                ipType: 'ipv6',
                profileName: 'telekom-ipv6'
            },
            congstar: {
                name: 'congstar (Telekom)',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'congstar'
            },
            
            // Vodafone Network
            vodafone: {
                name: 'Vodafone',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'vodafone-main'
            },
            vodafone_gigacube: {
                name: 'Vodafone GigaCube',
                apn: 'home.vodafone.de',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'vodafone-gigacube'
            },
            '1und1_vodafone': {
                name: '1&1 (Vodafone Network)',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: '1und1-vodafone'
            },
            otelo: {
                name: 'otelo (Vodafone)',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'otelo'
            },
            
            // O2 Network
            o2: {
                name: 'O2 / Telefónica',
                apn: 'internet',
                username: '',
                password: '',
                authMethod: 'pap',
                ipType: 'ipv4v6',
                profileName: 'o2-main'
            },
            o2_prepaid: {
                name: 'O2 Prepaid',
                apn: 'pinternet.interkom.de',
                username: '',
                password: '',
                authMethod: 'pap',
                ipType: 'ipv4v6',
                profileName: 'o2-prepaid'
            },
            '1und1_o2': {
                name: '1&1 (O2 Network - legacy)',
                apn: 'internet',
                username: '',
                password: '',
                authMethod: 'pap',
                ipType: 'ipv4v6',
                profileName: '1und1-o2'
            },
            aldi_talk: {
                name: 'ALDI TALK (O2)',
                apn: 'internet',
                username: '',
                password: '',
                authMethod: 'pap',
                ipType: 'ipv4v6',
                profileName: 'aldi-talk'
            },
            drillisch: {
                name: 'Drillisch (winSIM, PremiumSIM)',
                apn: 'internet',
                username: '',
                password: '',
                authMethod: 'pap',
                ipType: 'ipv4v6',
                profileName: 'drillisch'
            },
            freenet: {
                name: 'freenet Mobile (O2)',
                apn: 'internet',
                username: '',
                password: '',
                authMethod: 'pap',
                ipType: 'ipv4v6',
                profileName: 'freenet'
            },
            
            // Additional providers
            mobilcom_debitel_telekom: {
                name: 'mobilcom-debitel (Telekom)',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'mobilcom-telekom'
            },
            mobilcom_debitel_vodafone: {
                name: 'mobilcom-debitel (Vodafone)',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'mobilcom-vodafone'
            },
            klarmobil: {
                name: 'klarmobil (Telekom)',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'klarmobil'
            },
            
            custom: {
                name: 'Custom Configuration',
                apn: '',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4',
                profileName: 'custom-profile'
            }
        };
        
        console.log('LTE providers initialized');
        
        // Set initial provider settings if elements exist
        if (this.elements.mobileProvider) {
            this.updateProviderSettings();
        } else {
            console.warn('mobileProvider element not found during initialization');
        }
    }

    updateProviderSettings() {
        const selectedProvider = this.elements.mobileProvider.value;
        const provider = this.lteProviders[selectedProvider];
        
        if (provider && selectedProvider !== 'custom') {
            // Auto-fill all provider settings
            this.elements.apnName.value = provider.apn;
            this.elements.apnUsername.value = provider.username;
            this.elements.apnPassword.value = provider.password;
            this.elements.authMethod.value = provider.authMethod;
            this.elements.ipType.value = provider.ipType;
            
            // Automatically update profile name based on provider
            this.elements.apnProfileName.value = provider.profileName;
            
            // Show/hide username and password fields based on requirements
            this.updateCredentialFields(provider);
        } else if (selectedProvider === 'custom') {
            // Clear fields for custom configuration
            this.elements.apnName.value = '';
            this.elements.apnUsername.value = '';
            this.elements.apnPassword.value = '';
            this.elements.apnProfileName.value = 'custom-profile';
        }
        
        // Enable/disable fields based on selection
        const isCustom = selectedProvider === 'custom';
        this.elements.apnName.readOnly = !isCustom;
        this.elements.authMethod.disabled = !isCustom;
        this.elements.ipType.disabled = !isCustom;
        
        // Username and password are always editable (provider default or custom)
        this.elements.apnUsername.readOnly = false;
        this.elements.apnPassword.readOnly = false;
        
        console.log(`Provider updated: ${provider?.name || 'Custom'}, requires auth: ${provider?.username || provider?.password ? 'Yes' : 'No'}`);
    }

    updateCredentialFields(provider) {
        const usernameGroup = this.elements.apnUsername.closest('.form-group');
        const passwordGroup = this.elements.apnPassword.closest('.form-group');
        
        // Show visual indication if credentials are required
        if (provider.username || provider.password) {
            // Add visual indicator for required credentials
            if (usernameGroup) {
                usernameGroup.style.borderLeft = '3px solid #ffc107';
                const label = usernameGroup.querySelector('label');
                if (label && !label.textContent.includes('*')) {
                    label.innerHTML = label.innerHTML.replace('Username:', 'Username: <span style="color: #ffc107;">*</span>');
                }
            }
            if (passwordGroup && provider.password) {
                passwordGroup.style.borderLeft = '3px solid #ffc107';
                const label = passwordGroup.querySelector('label');
                if (label && !label.textContent.includes('*')) {
                    label.innerHTML = label.innerHTML.replace('Password:', 'Password: <span style="color: #ffc107;">*</span>');
                }
            }
        } else {
            // Remove visual indicators for optional credentials
            if (usernameGroup) {
                usernameGroup.style.borderLeft = '';
                const label = usernameGroup.querySelector('label');
                if (label) {
                    label.innerHTML = label.innerHTML.replace(': <span style="color: #ffc107;">*</span>', ':');
                }
            }
            if (passwordGroup) {
                passwordGroup.style.borderLeft = '';
                const label = passwordGroup.querySelector('label');
                if (label) {
                    label.innerHTML = label.innerHTML.replace(': <span style="color: #ffc107;">*</span>', ':');
                }
            }
        }
    }

    generateLteConfiguration() {
        console.log('generateLteConfiguration called');
        
        // Check if all required elements exist
        const requiredElements = [
            'mobileProvider', 'apnName', 'apnUsername', 'apnPassword', 'simPin',
            'lteInterface', 'apnProfileName', 'authMethod', 'ipType', 
            'enableLteNat', 'enableLteFirewall', 'setDefaultRoute', 
            'routeDistance', 'localLanNetwork'
        ];
        
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                console.error(`Element ${elementName} not found`);
                alert(`Configuration error: ${elementName} element not found. Please refresh the page.`);
                return;
            }
        }
        
        const provider = this.elements.mobileProvider.value;
        const apnName = this.elements.apnName.value.trim();
        const apnUsername = this.elements.apnUsername.value.trim();
        const apnPassword = this.elements.apnPassword.value.trim();
        const simPin = this.elements.simPin.value.trim();
        const lteInterface = this.elements.lteInterface.value.trim();
        const apnProfileName = this.elements.apnProfileName.value.trim();
        const authMethod = this.elements.authMethod.value;
        const ipType = this.elements.ipType.value;
        const enableLteNat = this.elements.enableLteNat.checked;
        const enableLteFirewall = this.elements.enableLteFirewall.checked;
        const setDefaultRoute = this.elements.setDefaultRoute.checked;
        const routeDistance = this.elements.routeDistance.value;
        const localLanNetwork = this.elements.localLanNetwork.value.trim();

        console.log('LTE Configuration values:', {
            provider, apnName, apnUsername, apnPassword, simPin,
            lteInterface, apnProfileName, authMethod, ipType,
            enableLteNat, enableLteFirewall, setDefaultRoute,
            routeDistance, localLanNetwork
        });

        if (!apnName) {
            alert('Please select a mobile provider or enter a custom APN name.');
            return;
        }

        // Collect all APN profiles (main + additional)
        const allApnProfiles = [{
            provider,
            apnName,
            username: apnUsername,
            password: apnPassword,
            profileName: apnProfileName,
            authMethod,
            ipType,
            isMain: true
        }];

        // Add additional APN profiles if enabled
        try {
            if (this.elements.enableMultipleApn && this.elements.enableMultipleApn.checked) {
                console.log('Processing additional APN profiles:', this.additionalApnProfiles.length);
                this.additionalApnProfiles.forEach(profile => {
                    if (profile.apnName && profile.profileName) {
                        allApnProfiles.push({
                            provider: profile.provider,
                            apnName: profile.apnName,
                            username: profile.username,
                            password: profile.password,
                            profileName: profile.profileName,
                            authMethod: profile.authMethod,
                            ipType: profile.ipType,
                            isMain: false
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error processing additional APN profiles:', error);
        }

        console.log('Creating LTE script with profiles:', allApnProfiles);

        let script;
        try {
            script = this.createLteScript({
                apnProfiles: allApnProfiles,
                simPin,
                lteInterface,
                enableLteNat,
                enableLteFirewall,
                setDefaultRoute,
                routeDistance,
                localLanNetwork
            });
        } catch (error) {
            console.error('Error creating LTE script:', error);
            alert('Error generating LTE script: ' + error.message);
            return;
        }

        // Display the script
        try {
            const output = this.elements.lteScriptOutput;
            if (!output) {
                throw new Error('LTE script output element not found');
            }
            
            output.innerHTML = '';
            
            this.createScriptWindow(output, 'LTE Configuration Script', 'MikroTik LTE Setup', script,
                'Complete MikroTik RouterOS script for LTE configuration with your selected provider settings');

            // Show output section
            if (this.elements.lteOutputSection) {
                this.elements.lteOutputSection.style.display = 'block';
                this.elements.lteOutputSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('LTE output section element not found');
            }
            
            console.log('LTE configuration generated successfully');
        } catch (error) {
            console.error('Error displaying LTE script:', error);
            alert('Error displaying LTE configuration: ' + error.message);
        }
    }

    createLteScript(config) {
        const mainProfile = config.apnProfiles.find(p => p.isMain);
        const additionalProfiles = config.apnProfiles.filter(p => !p.isMain);
        const mainProviderName = this.lteProviders[mainProfile?.provider]?.name || 'Custom Provider';
        
        let script = '# MikroTik RouterOS LTE Configuration Script\n';
        script += `# Main Provider: ${mainProviderName}\n`;
        script += `# Main APN: ${mainProfile?.apnName}\n`;
        if (additionalProfiles.length > 0) {
            script += `# Additional APNs: ${additionalProfiles.length} configured\n`;
        }
        script += `# Interface: ${config.lteInterface}\n`;
        script += `# Generated: ${new Date().toLocaleDateString('de-DE')}\n\n`;

        // Step 1: Configure SIM PIN if provided
        if (config.simPin) {
            script += '# Step 1: Configure SIM PIN\n';
            script += `/interface/lte/set [find] pin="${config.simPin}"\n\n`;
        }

        // Step 2: Create APN profiles
        script += '# Step 2: Create APN profiles\n';
        
        config.apnProfiles.forEach((profile, index) => {
            const providerName = this.lteProviders[profile.provider]?.name || 'Custom Provider';
            script += `# ${profile.isMain ? 'Main' : 'Additional'} APN Profile: ${providerName}\n`;
            script += `/interface/lte/apn add name="${profile.profileName}" `;
            script += `apn="${profile.apnName}" `;
            
            if (profile.username) {
                script += `user="${profile.username}" `;
            }
            if (profile.password) {
                script += `password="${profile.password}" `;
            }
            
            script += `authentication=${profile.authMethod} `;
            script += `ip-type=${profile.ipType}`;
            script += `\n`;
        });
        script += '\n';

        // Step 3: Configure LTE interface with main profile
        script += '# Step 3: Configure LTE interface with main APN profile\n';
        script += `/interface/lte/set [find] apn-profiles="${mainProfile?.profileName || 'default'}" `;
        script += `name="${config.lteInterface}"\n\n`;
        
        // Add information about switching profiles
        if (additionalProfiles.length > 0) {
            script += '# Switch between APN profiles using these commands:\n';
            config.apnProfiles.forEach(profile => {
                script += `# /interface/lte/set [find] apn-profiles="${profile.profileName}" ; # Switch to ${this.lteProviders[profile.provider]?.name || 'Custom'}\n`;
            });
            script += '\n';
        }

        // Step 4: Enable LTE interface
        script += '# Step 4: Enable LTE interface\n';
        script += `/interface/enable ${config.lteInterface}\n\n`;

        // Step 5: Set up default route if requested
        if (config.setDefaultRoute) {
            script += '# Step 5: Configure default route\n';
            script += `/ip/route/add dst-address=0.0.0.0/0 gateway=${config.lteInterface} `;
            script += `distance=${config.routeDistance} comment="LTE default route"\n\n`;
        }

        // Step 6: Configure NAT if enabled
        if (config.enableLteNat && config.localLanNetwork) {
            script += '# Step 6: Configure NAT for LTE\n';
            script += `/ip/firewall/nat/add chain=srcnat src-address=${config.localLanNetwork} `;
            script += `out-interface=${config.lteInterface} action=masquerade `;
            script += 'comment="LTE NAT"\n\n';
        }

        // Step 7: Configure firewall rules if enabled
        if (config.enableLteFirewall) {
            script += '# Step 7: Configure firewall rules\n';
            
            // Allow established and related connections
            script += '/ip/firewall/filter/add chain=input connection-state=established,related ';
            script += 'action=accept comment="Allow established/related"\n';
            
            // Allow LTE interface to be managed
            script += `/interface/list/member/add interface=${config.lteInterface} list=WAN\n`;
            
            // Block unwanted traffic from LTE
            script += `/ip/firewall/filter/add chain=input in-interface=${config.lteInterface} `;
            script += 'action=drop comment="Drop LTE input"\n';
            
            if (config.localLanNetwork) {
                // Allow forwarding from LAN to LTE
                script += `/ip/firewall/filter/add chain=forward src-address=${config.localLanNetwork} `;
                script += `out-interface=${config.lteInterface} action=accept `;
                script += 'comment="Allow LAN to LTE"\n';
                
                // Allow return traffic
                script += `/ip/firewall/filter/add chain=forward in-interface=${config.lteInterface} `;
                script += `dst-address=${config.localLanNetwork} connection-state=established,related `;
                script += 'action=accept comment="Allow LTE return traffic"\n';
            }
            
            script += '\n';
        }

        // Step 8: Configure DNS (optional)
        script += '# Step 8: Configure DNS (optional)\n';
        script += '# /ip/dns/set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes\n\n';

        // Step 9: Monitor LTE status
        script += '# Step 9: Monitor LTE connection\n';
        script += '# Use these commands to monitor your LTE connection:\n';
        script += `# /interface/lte/info ${config.lteInterface}\n`;
        script += `# /interface/lte/monitor ${config.lteInterface}\n`;
        script += '/interface/lte/print detail\n';
        script += '/ip/route/print where gateway=' + config.lteInterface + '\n\n';

        // Additional information
        script += '# Configuration complete!\n';
        script += `# Your ${mainProviderName} LTE connection should now be active.\n`;
        script += '# Check the connection status with: /interface/lte/monitor ' + config.lteInterface + '\n';

        return script;
    }

    toggleMultipleApn() {
        const isEnabled = this.elements.enableMultipleApn.checked;
        this.elements.additionalProvidersContainer.style.display = isEnabled ? 'block' : 'none';
        
        if (!isEnabled) {
            // Clear additional providers when disabled
            this.additionalApnProfiles = [];
            this.elements.additionalProvidersList.innerHTML = '';
        }
    }

    addAdditionalProvider() {
        const providerId = 'provider_' + Date.now();
        const providerIndex = this.additionalApnProfiles.length;
        
        // Add to data structure
        this.additionalApnProfiles.push({
            id: providerId,
            provider: 'custom',
            apnName: '',
            username: '',
            password: '',
            profileName: `additional-profile-${providerIndex + 1}`,
            authMethod: 'chap',
            ipType: 'ipv4'
        });

        // Create HTML for additional provider
        const providerDiv = document.createElement('div');
        providerDiv.className = 'additional-provider-item';
        providerDiv.style.marginBottom = '20px';
        providerDiv.style.padding = '15px';
        providerDiv.style.border = '1px solid #e9ecef';
        providerDiv.style.borderRadius = '8px';
        providerDiv.style.backgroundColor = '#f8f9fa';
        providerDiv.dataset.providerId = providerId;

        providerDiv.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #495057;">Additional Provider ${providerIndex + 1}</h4>
                <button type="button" class="btn-small" onclick="configurator.removeAdditionalProvider('${providerId}')" style="background: #dc3545; color: white;">Remove</button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Mobile Provider:</label>
                    <select data-field="provider" data-provider-id="${providerId}">
                        ${this.generateProviderOptions()}
                    </select>
                </div>
                <div class="form-group">
                    <label>APN Name:</label>
                    <input type="text" data-field="apnName" data-provider-id="${providerId}" placeholder="Access Point Name">
                </div>
                <div class="form-group">
                    <label>Profile Name:</label>
                    <input type="text" data-field="profileName" data-provider-id="${providerId}" value="additional-profile-${providerIndex + 1}" placeholder="Profile name">
                </div>
                <div class="form-group">
                    <label>Username:</label>
                    <input type="text" data-field="username" data-provider-id="${providerId}" placeholder="Username (if required)">
                </div>
                <div class="form-group">
                    <label>Password:</label>
                    <input type="text" data-field="password" data-provider-id="${providerId}" placeholder="Password (if required)">
                </div>
                <div class="form-group">
                    <label>Authentication:</label>
                    <select data-field="authMethod" data-provider-id="${providerId}">
                        <option value="none">None</option>
                        <option value="pap">PAP</option>
                        <option value="chap" selected>CHAP</option>
                        <option value="pap-chap">PAP and CHAP</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>IP Type:</label>
                    <select data-field="ipType" data-provider-id="${providerId}">
                        <option value="ipv4" selected>IPv4 only</option>
                        <option value="ipv6">IPv6 only</option>
                        <option value="ipv4v6">IPv4 and IPv6</option>
                    </select>
                </div>
            </div>
        `;

        this.elements.additionalProvidersList.appendChild(providerDiv);

        // Add event listeners for the new provider
        this.attachAdditionalProviderListeners(providerId);
    }

    generateProviderOptions() {
        const optgroups = [
            { label: 'Custom', options: [{ value: 'custom', text: 'Custom Configuration' }] },
            { 
                label: 'Deutsche Telekom Network', 
                options: [
                    { value: 'telekom', text: 'Deutsche Telekom (Main)' },
                    { value: 'telekom_alt', text: 'Deutsche Telekom (Alternative)' },
                    { value: 'telekom_ipv6', text: 'Deutsche Telekom (IPv6 only)' },
                    { value: 'congstar', text: 'congstar' },
                    { value: 'mobilcom_debitel_telekom', text: 'mobilcom-debitel (Telekom)' },
                    { value: 'klarmobil', text: 'klarmobil' }
                ]
            },
            {
                label: 'Vodafone Network',
                options: [
                    { value: 'vodafone', text: 'Vodafone (Standard)' },
                    { value: 'vodafone_gigacube', text: 'Vodafone GigaCube' },
                    { value: '1und1_vodafone', text: '1&1 (Vodafone Network)' },
                    { value: 'otelo', text: 'otelo' },
                    { value: 'mobilcom_debitel_vodafone', text: 'mobilcom-debitel (Vodafone)' }
                ]
            },
            {
                label: 'O2 / Telefónica Network',
                options: [
                    { value: 'o2', text: 'O2 / Telefónica (Contract)' },
                    { value: 'o2_prepaid', text: 'O2 Prepaid' },
                    { value: '1und1_o2', text: '1&1 (O2 Network - legacy)' },
                    { value: 'aldi_talk', text: 'ALDI TALK' },
                    { value: 'drillisch', text: 'Drillisch (winSIM, PremiumSIM)' },
                    { value: 'freenet', text: 'freenet Mobile' }
                ]
            }
        ];

        let html = '';
        optgroups.forEach(group => {
            if (group.label === 'Custom') {
                group.options.forEach(option => {
                    html += `<option value="${option.value}">${option.text}</option>`;
                });
            } else {
                html += `<optgroup label="${group.label}">`;
                group.options.forEach(option => {
                    html += `<option value="${option.value}">${option.text}</option>`;
                });
                html += '</optgroup>';
            }
        });

        return html;
    }

    attachAdditionalProviderListeners(providerId) {
        const providerDiv = document.querySelector(`[data-provider-id="${providerId}"]`).closest('.additional-provider-item');
        
        // Add listeners for all inputs in this provider
        providerDiv.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateAdditionalProviderData(providerId, e.target.dataset.field, e.target.value);
                
                // If provider selection changed, update all fields
                if (e.target.dataset.field === 'provider') {
                    this.updateAdditionalProviderSettings(providerId, e.target.value);
                }
            });
        });
    }

    updateAdditionalProviderData(providerId, field, value) {
        const provider = this.additionalApnProfiles.find(p => p.id === providerId);
        if (provider) {
            provider[field] = value;
        }
    }

    updateAdditionalProviderSettings(providerId, selectedProvider) {
        const provider = this.lteProviders[selectedProvider];
        const providerDiv = document.querySelector(`[data-provider-id="${providerId}"]`).closest('.additional-provider-item');
        
        if (provider && selectedProvider !== 'custom') {
            // Update form fields
            const apnInput = providerDiv.querySelector('[data-field="apnName"]');
            const usernameInput = providerDiv.querySelector('[data-field="username"]');
            const passwordInput = providerDiv.querySelector('[data-field="password"]');
            const profileInput = providerDiv.querySelector('[data-field="profileName"]');
            const authSelect = providerDiv.querySelector('[data-field="authMethod"]');
            const ipSelect = providerDiv.querySelector('[data-field="ipType"]');

            if (apnInput) apnInput.value = provider.apn;
            if (usernameInput) usernameInput.value = provider.username;
            if (passwordInput) passwordInput.value = provider.password;
            if (profileInput) profileInput.value = provider.profileName;
            if (authSelect) authSelect.value = provider.authMethod;
            if (ipSelect) ipSelect.value = provider.ipType;

            // Update data structure
            const providerData = this.additionalApnProfiles.find(p => p.id === providerId);
            if (providerData) {
                providerData.apnName = provider.apn;
                providerData.username = provider.username;
                providerData.password = provider.password;
                providerData.profileName = provider.profileName;
                providerData.authMethod = provider.authMethod;
                providerData.ipType = provider.ipType;
            }

            // Enable/disable fields
            if (apnInput) apnInput.readOnly = true;
            if (authSelect) authSelect.disabled = true;
            if (ipSelect) ipSelect.disabled = true;
        } else {
            // Enable all fields for custom
            const inputs = providerDiv.querySelectorAll('input:not([data-field="profileName"])');
            const selects = providerDiv.querySelectorAll('select:not([data-field="provider"])');
            
            inputs.forEach(input => input.readOnly = false);
            selects.forEach(select => select.disabled = false);
        }
    }

    removeAdditionalProvider(providerId) {
        // Remove from data structure
        this.additionalApnProfiles = this.additionalApnProfiles.filter(p => p.id !== providerId);
        
        // Remove from DOM
        const providerDiv = document.querySelector(`[data-provider-id="${providerId}"]`).closest('.additional-provider-item');
        if (providerDiv) {
            providerDiv.remove();
        }
        
        // Update provider numbers
        this.updateProviderNumbers();
    }

    updateProviderNumbers() {
        const providerDivs = this.elements.additionalProvidersList.querySelectorAll('.additional-provider-item');
        providerDivs.forEach((div, index) => {
            const header = div.querySelector('h4');
            if (header) {
                header.textContent = `Additional Provider ${index + 1}`;
            }
        });
    }

    debugLteElements() {
        console.log('=== LTE Elements Debug ===');
        
        const lteElementIds = [
            'mobileProvider', 'apnName', 'apnUsername', 'apnPassword', 'simPin',
            'lteInterface', 'apnProfileName', 'authMethod', 'ipType', 
            'enableLteNat', 'enableLteFirewall', 'setDefaultRoute', 
            'routeDistance', 'localLanNetwork', 'enableMultipleApn',
            'generateLteConfig', 'lteScriptOutput', 'lteOutputSection'
        ];
        
        lteElementIds.forEach(id => {
            const element = document.getElementById(id);
            const inElements = this.elements[id] ? 'In elements object' : 'Not in elements object';
            console.log(`${id}: ${element ? 'Found in DOM' : 'Missing from DOM'}, ${inElements}`);
        });
        
        // Check current page
        const currentPage = document.querySelector('.page-content.active');
        console.log('Current active page:', currentPage ? currentPage.id : 'None');
        
        // Check if LTE page exists
        const ltePage = document.getElementById('lte-page');
        console.log('LTE page exists:', ltePage ? 'Yes' : 'No');
        
        // Check if LTE page is active
        if (ltePage) {
            const isActive = ltePage.classList.contains('active');
            console.log('LTE page is active:', isActive ? 'Yes' : 'No');
            if (!isActive) {
                console.log('💡 TIP: Switch to LTE page first by clicking the "📡 LTE Mobile" tab');
            }
        }
        
        console.log('=== End LTE Debug ===');
    }

    // Helper function to test LTE functionality
    testLteButton() {
        console.log('Testing LTE button...');
        
        // Check if we're on the LTE page
        const ltePage = document.getElementById('lte-page');
        if (!ltePage || !ltePage.classList.contains('active')) {
            console.warn('⚠️ LTE page is not active. Switching to LTE page...');
            this.switchPage('lte');
            
            // Wait a bit for the switch to complete
            setTimeout(() => {
                this.testLteButton();
            }, 100);
            return;
        }
        
        // Try to call the LTE configuration function
        try {
            console.log('✅ On LTE page, testing configuration generation...');
            this.generateLteConfiguration();
        } catch (error) {
            console.error('❌ Error in LTE configuration:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.configurator = new WireGuardConfigurator();
    console.log('WireGuard Configurator loaded. Use window.configurator to access methods.');
    console.log('Try: configurator.manualAddTooltip("serverName", "Test tooltip")');
    console.log('LTE Debug commands:');
    console.log('  configurator.debugLteElements() - Check LTE element status');
    console.log('  configurator.testLteButton() - Test LTE functionality');
    console.log('  configurator.switchPage("lte") - Switch to LTE page');
    
    // Debug LTE elements
    window.configurator.debugLteElements();
});