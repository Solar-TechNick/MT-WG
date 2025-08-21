/**
 * LTE Configuration Module
 * Generates MikroTik RouterOS LTE configuration scripts for German mobile providers
 */

class LTEConfigurator {
    constructor() {
        this.providers = {};
        this.additionalApnProfiles = [];
        this.init();
    }

    init() {
        this.initializeLteProviders();
        console.log('LTE Configurator initialized with', Object.keys(this.providers).length, 'providers');
    }

    initializeLteProviders() {
        // German mobile provider APN settings - Comprehensive database
        this.providers = {
            // Deutsche Telekom Network
            telekom: {
                name: 'Deutsche Telekom (Main)',
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
                name: 'Deutsche Telekom (IPv6 only)',
                apn: 'internet.v6.telekom',
                username: 'telekom',
                password: 'tm',
                authMethod: 'chap',
                ipType: 'ipv6',
                profileName: 'telekom-ipv6'
            },
            congstar: {
                name: 'congstar',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'congstar'
            },
            mobilcom_debitel_telekom: {
                name: 'mobilcom-debitel (Telekom)',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'mobilcom-telekom'
            },
            klarmobil: {
                name: 'klarmobil',
                apn: 'internet.t-mobile',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'klarmobil'
            },
            
            // Vodafone Network
            vodafone: {
                name: 'Vodafone (Standard)',
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
                name: 'otelo',
                apn: 'web.vodafone.de',
                username: '',
                password: '',
                authMethod: 'chap',
                ipType: 'ipv4v6',
                profileName: 'otelo'
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
            
            // O2 / Telefónica Network
            o2: {
                name: 'O2 / Telefónica (Contract)',
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
                name: 'ALDI TALK',
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
                name: 'freenet Mobile',
                apn: 'internet',
                username: '',
                password: '',
                authMethod: 'pap',
                ipType: 'ipv4v6',
                profileName: 'freenet'
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
    }

    /**
     * Get provider information
     * @param {string} providerId 
     * @returns {object|null}
     */
    getProvider(providerId) {
        return this.providers[providerId] || null;
    }

    /**
     * Get all available providers
     * @returns {object}
     */
    getAllProviders() {
        return this.providers;
    }

    /**
     * Update provider settings in form fields
     * @param {string} providerId 
     * @param {object} elements Form elements object
     */
    updateProviderSettings(providerId, elements) {
        const provider = this.providers[providerId];
        
        if (provider && providerId !== 'custom') {
            // Auto-fill all provider settings
            if (elements.apnName) elements.apnName.value = provider.apn;
            if (elements.apnUsername) elements.apnUsername.value = provider.username;
            if (elements.apnPassword) elements.apnPassword.value = provider.password;
            if (elements.authMethod) elements.authMethod.value = provider.authMethod;
            if (elements.ipType) elements.ipType.value = provider.ipType;
            if (elements.apnProfileName) elements.apnProfileName.value = provider.profileName;
            
        } else if (providerId === 'custom') {
            // Clear fields for custom configuration
            if (elements.apnName) elements.apnName.value = '';
            if (elements.apnUsername) elements.apnUsername.value = '';
            if (elements.apnPassword) elements.apnPassword.value = '';
            if (elements.apnProfileName) elements.apnProfileName.value = 'custom-profile';
        }
        
        // Enable/disable fields based on selection
        const isCustom = providerId === 'custom';
        if (elements.apnName) elements.apnName.readOnly = !isCustom;
        if (elements.authMethod) elements.authMethod.disabled = !isCustom;
        if (elements.ipType) elements.ipType.disabled = !isCustom;
        
        // Username and password are always editable
        if (elements.apnUsername) elements.apnUsername.readOnly = false;
        if (elements.apnPassword) elements.apnPassword.readOnly = false;
    }

    /**
     * Generate LTE configuration script
     * @param {object} config Configuration object
     * @returns {string} MikroTik RouterOS script
     */
    generateLTEConfig(config) {
        try {
            this.validateLTEConfig(config);
            
            const script = this.createLteScript({
                apnProfiles: [{
                    provider: config.provider || 'custom',
                    apnName: config.apnName,
                    username: config.apnUsername || '',
                    password: config.apnPassword || '',
                    profileName: config.apnProfileName || 'lte-profile',
                    authMethod: config.authMethod || 'chap',
                    ipType: config.ipType || 'ipv4',
                    isMain: true
                }],
                simPin: config.simPin || '',
                lteInterface: config.lteInterface || 'lte1',
                enableLteNat: config.enableLteNat || false,
                enableLteFirewall: config.enableLteFirewall || false,
                setDefaultRoute: config.setDefaultRoute || false,
                routeDistance: config.routeDistance || 1,
                localLanNetwork: config.localLanNetwork || '192.168.1.0/24',
                enableLteDns: config.enableLteDns || false,
                lteDnsServers: config.lteDnsServers || '8.8.8.8, 1.1.1.1'
            });
            
            return {
                script: script,
                success: true
            };
            
        } catch (error) {
            console.error('LTE configuration generation failed:', error);
            return {
                script: `# Error generating LTE configuration: ${error.message}`,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate LTE configuration
     * @param {object} config 
     */
    validateLTEConfig(config) {
        if (!config) {
            throw new Error('Configuration data is required');
        }
        
        if (!config.apnName) {
            throw new Error('APN name is required');
        }
        
        if (!config.lteInterface) {
            throw new Error('LTE interface name is required');
        }
    }

    /**
     * Create MikroTik RouterOS LTE script
     * @param {object} config 
     * @returns {string}
     */
    createLteScript(config) {
        const mainProfile = config.apnProfiles.find(p => p.isMain);
        const mainProviderName = this.providers[mainProfile?.provider]?.name || 'Custom Provider';
        
        let script = '# MikroTik RouterOS LTE Configuration Script\n';
        script += `# Provider: ${mainProviderName}\n`;
        script += `# APN: ${mainProfile?.apnName}\n`;
        script += `# Interface: ${config.lteInterface}\n`;
        script += `# Generated: ${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE')}\n`;
        script += `# Generated by WireGuard MikroTik Configurator\n\n`;

        // Step 1: Configure SIM PIN if provided
        if (config.simPin) {
            script += '# Step 1: Configure SIM PIN\n';
            script += `/interface lte set [find] pin="${config.simPin}"\n\n`;
        }

        // Step 2: Create APN profile
        script += '# Step 2: Create APN profile\n';
        script += `# Provider: ${mainProviderName}\n`;
        script += `/interface lte apn add name="${mainProfile.profileName}" `;
        script += `apn="${mainProfile.apnName}" `;
        
        if (mainProfile.username) {
            script += `user="${mainProfile.username}" `;
        }
        if (mainProfile.password) {
            script += `password="${mainProfile.password}" `;
        }
        
        script += `authentication=${mainProfile.authMethod} `;
        script += `ip-type=${mainProfile.ipType}`;
        script += `\n\n`;

        // Step 3: Configure LTE interface
        script += '# Step 3: Configure LTE interface with APN profile\n';
        script += `/interface lte set [find] apn-profiles="${mainProfile.profileName}" `;
        script += `name="${config.lteInterface}"\n\n`;

        // Step 4: Enable LTE interface
        script += '# Step 4: Enable LTE interface\n';
        script += `/interface enable ${config.lteInterface}\n\n`;

        // Step 5: Set up default route if requested
        if (config.setDefaultRoute) {
            script += '# Step 5: Configure default route\n';
            script += `/ip route add dst-address=0.0.0.0/0 gateway=${config.lteInterface} `;
            script += `distance=${config.routeDistance} comment="LTE default route"\n\n`;
        }

        // Step 6: Configure NAT if enabled
        if (config.enableLteNat && config.localLanNetwork) {
            script += '# Step 6: Configure NAT for LTE\n';
            script += `/ip firewall nat add chain=srcnat src-address=${config.localLanNetwork} `;
            script += `out-interface=${config.lteInterface} action=masquerade `;
            script += 'comment="LTE NAT"\n\n';
        }

        // Step 7: Configure firewall rules if enabled
        if (config.enableLteFirewall) {
            script += '# Step 7: Configure firewall rules\n';
            
            // Allow established and related connections
            script += '/ip firewall filter add chain=input connection-state=established,related ';
            script += 'action=accept comment="Allow established/related"\n';
            
            // Add LTE interface to WAN list
            script += `/interface list member add interface=${config.lteInterface} list=WAN\n`;
            
            // Block unwanted traffic from LTE
            script += `/ip firewall filter add chain=input in-interface=${config.lteInterface} `;
            script += 'action=drop comment="Drop LTE input"\n';
            
            if (config.localLanNetwork) {
                // Allow forwarding from LAN to LTE
                script += `/ip firewall filter add chain=forward src-address=${config.localLanNetwork} `;
                script += `out-interface=${config.lteInterface} action=accept `;
                script += 'comment="Allow LAN to LTE"\n';
                
                // Allow return traffic
                script += `/ip firewall filter add chain=forward in-interface=${config.lteInterface} `;
                script += `dst-address=${config.localLanNetwork} connection-state=established,related `;
                script += 'action=accept comment="Allow LTE return traffic"\n';
            }
            
            script += '\n';
        }

        // Step 8: Configure DNS
        if (config.enableLteDns && config.lteDnsServers) {
            script += '# Step 8: Configure DNS servers\n';
            const dnsServers = config.lteDnsServers.split(',').map(s => s.trim()).join(',');
            script += `/ip dns set servers=${dnsServers} allow-remote-requests=yes\n`;
            script += `# DNS servers configured: ${dnsServers}\n\n`;
        } else {
            script += '# Step 8: Configure DNS (optional)\n';
            script += '# /ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes\n\n';
        }

        // Monitoring commands
        script += '# Monitoring and diagnostics commands:\n';
        script += `# /interface lte info ${config.lteInterface}\n`;
        script += `# /interface lte monitor ${config.lteInterface}\n`;
        script += `# /interface lte at-chat ${config.lteInterface} input="AT+CSQ"\n`;
        script += '# /log print where topics~"lte"\n\n';

        // Troubleshooting
        script += '# Troubleshooting tips:\n';
        script += '# - Check signal strength with: /interface lte monitor\n';
        script += '# - Check network registration: /interface lte at-chat input="AT+CREG?"\n';
        script += '# - Check APN settings: /interface lte apn print\n';
        script += '# - Check interface status: /interface print stats\n';
        script += '# - View LTE logs: /log print where topics~"lte"\n\n';

        script += '# LTE configuration completed successfully!\n';
        script += `# Your ${mainProviderName} connection should now be active.\n`;
        
        if (config.setDefaultRoute) {
            script += '# Default route has been configured - internet traffic will use LTE.\n';
        }
        
        if (config.enableLteNat) {
            script += '# NAT has been configured for local network access.\n';
        }
        
        if (config.enableLteFirewall) {
            script += '# Firewall rules have been applied for security.\n';
        }
        
        if (config.enableLteDns) {
            const dnsServers = config.lteDnsServers.split(',').map(s => s.trim()).join(', ');
            script += `# DNS servers have been configured: ${dnsServers}\n`;
        }

        return script;
    }

    /**
     * Get formatted provider list for HTML select
     * @returns {string} HTML options
     */
    getProviderOptionsHTML() {
        let html = '<option value="custom">Custom Configuration</option>\n';
        
        // Group providers by network
        const groups = {
            'Deutsche Telekom Network': ['telekom', 'telekom_alt', 'telekom_ipv6', 'congstar', 'mobilcom_debitel_telekom', 'klarmobil'],
            'Vodafone Network': ['vodafone', 'vodafone_gigacube', '1und1_vodafone', 'otelo', 'mobilcom_debitel_vodafone'],
            'O2 / Telefónica Network': ['o2', 'o2_prepaid', '1und1_o2', 'aldi_talk', 'drillisch', 'freenet']
        };
        
        Object.entries(groups).forEach(([groupName, providerIds]) => {
            html += `<optgroup label="${groupName}">\n`;
            providerIds.forEach(providerId => {
                const provider = this.providers[providerId];
                if (provider) {
                    html += `<option value="${providerId}">${provider.name}</option>\n`;
                }
            });
            html += '</optgroup>\n';
        });
        
        return html;
    }
}

// Create global instance
window.LTEConfigurator = new LTEConfigurator();

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LTEConfigurator;
}