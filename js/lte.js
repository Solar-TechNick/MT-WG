// LTE configuration module
class LTEConfig {
    constructor() {
        this.providers = {};
        this.currentConfig = {};
        this.init();
    }

    init() {
        this.loadProviders();
        this.setupEventListeners();
        console.log('LTE module initialized');
    }

    setupEventListeners() {
        // Provider selection change
        const providerSelect = document.getElementById('lte-provider');
        if (providerSelect) {
            providerSelect.addEventListener('change', (e) => {
                this.loadProviderSettings(e.target.value);
            });
        }

        // LTE Firewall toggle
        const lteFirewallCheckbox = document.getElementById('lte-enable-firewall');
        if (lteFirewallCheckbox) {
            lteFirewallCheckbox.addEventListener('change', (e) => {
                const lteFirewallOptions = document.getElementById('lte-firewall-options');
                if (e.target.checked) {
                    lteFirewallOptions.style.display = 'block';
                } else {
                    lteFirewallOptions.style.display = 'none';
                }
            });
        }
    }

    // Load German LTE providers database
    loadProviders() {
        this.providers = {
            'telekom': {
                name: 'Deutsche Telekom',
                apn: 'internet.telekom',
                username: 'telekom',
                password: 'tm',
                auth: 'chap',
                network: 'Telekom',
                authRequired: true
            },
            'telekom-alt': {
                name: 'Deutsche Telekom (Alternative)',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Telekom',
                authRequired: false
            },
            'telekom-ipv6': {
                name: 'Deutsche Telekom (IPv6)',
                apn: 'internet.v6.telekom',
                username: 'telekom',
                password: 'tm',
                auth: 'chap',
                network: 'Telekom',
                authRequired: true
            },
            'vodafone': {
                name: 'Vodafone',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Vodafone',
                authRequired: false
            },
            'vodafone-gigacube': {
                name: 'Vodafone GigaCube',
                apn: 'home.vodafone.de',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Vodafone',
                authRequired: false
            },
            'o2-contract': {
                name: 'O2 Contract',
                apn: 'internet',
                username: '',
                password: '',
                auth: 'pap',
                network: 'O2',
                authRequired: false
            },
            'o2-prepaid': {
                name: 'O2 Prepaid',
                apn: 'pinternet.interkom.de',
                username: '',
                password: '',
                auth: 'pap',
                network: 'O2',
                authRequired: false
            },
            '1und1': {
                name: '1&1 (Vodafone Network)',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Vodafone',
                authRequired: false
            },
            'aldi': {
                name: 'ALDI TALK',
                apn: 'internet',
                username: '',
                password: '',
                auth: 'pap',
                network: 'O2',
                authRequired: false
            },
            'congstar': {
                name: 'congstar',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Telekom',
                authRequired: false
            },
            'otelo': {
                name: 'otelo',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Vodafone',
                authRequired: false
            },
            'mobilcom': {
                name: 'mobilcom-debitel',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Telekom',
                authRequired: false
            },
            'klarmobil': {
                name: 'klarmobil',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Telekom',
                authRequired: false
            },
            'drillisch': {
                name: 'Drillisch',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Vodafone',
                authRequired: false
            },
            'freenet': {
                name: 'freenet',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                auth: 'chap',
                network: 'Vodafone',
                authRequired: false
            }
        };
    }

    // Load provider settings into form
    loadProviderSettings(providerKey) {
        const provider = this.providers[providerKey];
        if (!provider) {
            this.clearProviderFields();
            return;
        }

        // Fill form fields
        document.getElementById('lte-apn').value = provider.apn;
        document.getElementById('lte-username').value = provider.username;
        document.getElementById('lte-password').value = provider.password;
        document.getElementById('lte-auth').value = provider.auth;

        // Auto-generate profile name if empty
        const profileField = document.getElementById('lte-profile');
        if (!profileField.value) {
            profileField.value = provider.name.replace(/[^a-zA-Z0-9]/g, '_');
        }

        // Show authentication status
        this.updateAuthStatus(provider);

        showNotification(`Loaded settings for ${provider.name}`, 'success');
    }

    // Clear provider fields
    clearProviderFields() {
        document.getElementById('lte-apn').value = '';
        document.getElementById('lte-username').value = '';
        document.getElementById('lte-password').value = '';
        document.getElementById('lte-auth').value = 'pap';
        document.getElementById('lte-profile').value = '';
    }

    // Update authentication status indicator
    updateAuthStatus(provider) {
        // Remove any existing auth status indicators
        const existingStatus = document.querySelector('.auth-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Add new status indicator
        const providerSelect = document.getElementById('lte-provider');
        const statusSpan = document.createElement('span');
        
        if (provider.authRequired) {
            statusSpan.className = 'auth-status auth-required';
            statusSpan.textContent = 'Auth Required';
        } else if (provider.username || provider.password) {
            statusSpan.className = 'auth-status auth-optional';
            statusSpan.textContent = 'Auth Optional';
        } else {
            statusSpan.className = 'auth-status auth-none';
            statusSpan.textContent = 'No Auth';
        }

        providerSelect.parentNode.appendChild(statusSpan);
    }

    // Get provider by key
    getProvider(key) {
        return this.providers[key] || null;
    }

    // Get all providers
    getAllProviders() {
        return this.providers;
    }

    // Generate configuration object from form
    generateConfig() {
        const config = {
            provider: document.getElementById('lte-provider').value,
            apn: document.getElementById('lte-apn').value,
            username: document.getElementById('lte-username').value,
            password: document.getElementById('lte-password').value,
            auth: document.getElementById('lte-auth').value,
            simPin: document.getElementById('lte-sim-pin').value,
            interface: document.getElementById('lte-interface').value || 'lte1',
            profile: document.getElementById('lte-profile').value,
            enableNat: document.getElementById('lte-enable-nat').checked,
            addRoutes: document.getElementById('lte-add-routes').checked,
            enableFirewall: document.getElementById('lte-enable-firewall').checked,
            firewallSettings: {
                dropInvalid: document.getElementById('lte-fw-drop-invalid').checked,
                allowEstablished: document.getElementById('lte-fw-allow-established').checked,
                protectRouter: document.getElementById('lte-fw-protect-router').checked,
                logBlocked: document.getElementById('lte-fw-log-blocked').checked
            }
        };

        // Validate required fields
        if (!config.apn) {
            throw new Error('APN is required');
        }

        if (!config.profile) {
            const provider = this.providers[config.provider];
            config.profile = provider ? provider.name.replace(/[^a-zA-Z0-9]/g, '_') : 'LTE_Profile';
        }

        return config;
    }

    // Generate RouterOS script for LTE configuration
    generateLTEScript(config) {
        if (!config) {
            config = this.generateConfig();
        }

        let script = `# LTE Mobile Configuration for MikroTik RouterOS
# Generated on ${new Date().toLocaleString()}
# Provider: ${config.provider ? this.providers[config.provider]?.name || config.provider : 'Custom'}

`;

        // Set SIM PIN if provided
        if (config.simPin) {
            script += `# Set SIM PIN
/interface/lte/set ${config.interface} pin="${config.simPin}"

`;
        }

        // Create APN profile
        script += `# Create APN profile
/interface/lte/apn add name="${config.profile}" apn="${config.apn}"`;
        
        if (config.username) {
            script += ` user="${config.username}"`;
        }
        
        if (config.password) {
            script += ` password="${config.password}"`;
        }
        
        script += ` authentication=${config.auth}

`;

        // Set APN profile on interface
        script += `# Set APN profile on LTE interface
/interface/lte/set ${config.interface} apn-profiles="${config.profile}"

`;

        // Enable interface
        script += `# Enable LTE interface
/interface/lte/set ${config.interface} disabled=no

`;

        // Add DHCP client for automatic IP configuration
        script += `# Add DHCP client for automatic IP
/ip/dhcp-client add interface=${config.interface} disabled=no

`;

        // Add default routes if enabled
        if (config.addRoutes) {
            script += `# Add default route via LTE
/ip/route add dst-address=0.0.0.0/0 gateway=${config.interface} distance=1 comment="LTE Default Route"

`;
        }

        // Add NAT rules if enabled
        if (config.enableNat) {
            script += `# NAT rules for LTE interface
/ip/firewall/nat add chain=srcnat action=masquerade out-interface=${config.interface} comment="LTE NAT"

`;
        }

        // Add firewall rules if enabled
        if (config.enableFirewall && config.firewallSettings) {
            script += `# Advanced firewall rules for LTE
`;
            const fw = config.firewallSettings;

            // Drop invalid connections first (if enabled)
            if (fw.dropInvalid) {
                script += `/ip/firewall/filter add chain=input action=drop connection-state=invalid comment="Drop invalid connections"
/ip/firewall/filter add chain=forward action=drop connection-state=invalid comment="Drop invalid forward connections"

`;
            }

            // Allow established and related connections
            if (fw.allowEstablished) {
                script += `/ip/firewall/filter add chain=input action=accept in-interface=${config.interface} connection-state=established,related comment="Allow LTE established/related"
/ip/firewall/filter add chain=forward action=accept in-interface=${config.interface} connection-state=established,related comment="Allow LTE forward established/related"

`;
            }

            // Protect router access via LTE
            if (fw.protectRouter) {
                script += `/ip/firewall/filter add chain=input action=drop in-interface=${config.interface} dst-port=21,22,23,53,80,443,8080,8291,8728,8729 protocol=tcp comment="Block router access via LTE"
/ip/firewall/filter add chain=input action=drop in-interface=${config.interface} dst-port=53,161,162,500,4500 protocol=udp comment="Block router services via LTE"

`;
            }

            // Allow LTE forward out
            script += `/ip/firewall/filter add chain=forward action=accept out-interface=${config.interface} comment="Allow LTE forward out"

`;

            // Log blocked traffic (if enabled)
            if (fw.logBlocked) {
                script += `# Log blocked LTE traffic
/ip/firewall/filter add chain=input action=log log-prefix="LTE-INPUT-DROP: " in-interface=${config.interface} comment="Log LTE input drops"
/ip/firewall/filter add chain=forward action=log log-prefix="LTE-FORWARD-DROP: " comment="Log LTE forward drops"

`;
            }

        } else if (config.enableFirewall) {
            // Fallback to basic firewall rules
            script += `# Basic firewall rules for LTE
/ip/firewall/filter add chain=input action=accept in-interface=${config.interface} connection-state=established,related comment="Allow LTE established"
/ip/firewall/filter add chain=forward action=accept in-interface=${config.interface} connection-state=established,related comment="Allow LTE forward established"
/ip/firewall/filter add chain=forward action=accept out-interface=${config.interface} comment="Allow LTE forward out"

`;
        }

        // Add monitoring commands
        script += `# Monitoring commands (run manually)
# /interface/lte/monitor ${config.interface} once
# /interface/lte/info ${config.interface}
# /ip/dhcp-client/print where interface=${config.interface}
`;

        return script;
    }

    // Test APN settings (placeholder)
    testAPNSettings() {
        try {
            const config = this.generateConfig();
            
            // Validate configuration
            if (!config.apn) {
                throw new Error('APN is required for testing');
            }

            // Show test results (placeholder)
            let testResults = `Testing APN Configuration:
Provider: ${config.provider ? this.providers[config.provider]?.name || 'Custom' : 'Custom'}
APN: ${config.apn}
Authentication: ${config.auth.toUpperCase()}`;

            if (config.username) {
                testResults += `\nUsername: ${config.username}`;
            }

            if (config.password) {
                testResults += `\nPassword: ${'*'.repeat(config.password.length)}`;
            }

            testResults += `\n\nNote: This is a configuration validation. 
Actual network connectivity testing requires RouterOS hardware.`;

            // Display results
            document.getElementById('lte-config-output').textContent = testResults;
            document.getElementById('lte-output').style.display = 'block';

            showNotification('APN configuration validated successfully!', 'success');

        } catch (error) {
            console.error('Error testing APN settings:', error);
            showNotification(`Error: ${error.message}`, 'error');
        }
    }
}

// Global functions for HTML onclick handlers
function loadProviderSettings() {
    const providerKey = document.getElementById('lte-provider').value;
    if (window.lteConfig) {
        window.lteConfig.loadProviderSettings(providerKey);
    }
}

function generateLTEConfig() {
    try {
        showNotification('Generating LTE configuration...', 'info');
        
        const script = window.lteConfig.generateLTEScript();
        
        // Display output
        document.getElementById('lte-config-output').textContent = script;
        document.getElementById('lte-output').style.display = 'block';
        
        showNotification('LTE configuration generated successfully!', 'success');

    } catch (error) {
        console.error('Error generating LTE config:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

function testAPNSettings() {
    if (window.lteConfig) {
        window.lteConfig.testAPNSettings();
    }
}

// Initialize LTE module
document.addEventListener('DOMContentLoaded', () => {
    window.lteConfig = new LTEConfig();
});