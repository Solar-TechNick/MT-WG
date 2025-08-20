// Main application controller
class WireGuardMikroTikApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showTab('wireguard'); // Show WireGuard tab by default
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('onclick').match(/'(\w+)'/)[1];
                this.showTab(tab);
            });
        });

        // Input validation
        this.setupInputValidation();
        
        // Form enhancements
        this.setupFormEnhancements();
    }

    setupInputValidation() {
        // IP/CIDR validation
        const ipInputs = document.querySelectorAll('input[type="text"]');
        ipInputs.forEach(input => {
            if (input.id.includes('ip') || input.id.includes('network')) {
                input.addEventListener('blur', (e) => {
                    this.validateIPInput(e.target);
                });
            }
        });

        // Port validation
        const portInputs = document.querySelectorAll('input[type="number"]');
        portInputs.forEach(input => {
            if (input.id.includes('port')) {
                input.addEventListener('input', (e) => {
                    this.validatePortInput(e.target);
                });
            }
        });

        // Endpoint validation
        const endpointInput = document.getElementById('wg-server-endpoint');
        if (endpointInput) {
            endpointInput.addEventListener('blur', (e) => {
                this.validateEndpointInput(e.target);
            });
        }
    }

    setupFormEnhancements() {
        // Auto-focus next field on Enter
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach((input, index) => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && index < inputs.length - 1) {
                    e.preventDefault();
                    inputs[index + 1].focus();
                }
            });
        });

        // Auto-generate profile names
        const providerSelect = document.getElementById('lte-provider');
        const profileInput = document.getElementById('lte-profile');
        if (providerSelect && profileInput) {
            providerSelect.addEventListener('change', () => {
                if (!profileInput.value) {
                    const selectedOption = providerSelect.options[providerSelect.selectedIndex];
                    if (selectedOption.value) {
                        profileInput.value = selectedOption.text.replace(/[^a-zA-Z0-9]/g, '_');
                    }
                }
            });
        }
    }

    validateIPInput(input) {
        const value = input.value.trim();
        if (!value) return;

        const isValid = input.id.includes('network') ? isValidCIDR(value) : isValidIP(value);
        
        if (isValid) {
            input.classList.remove('error');
            input.classList.add('valid');
        } else {
            input.classList.add('error');
            input.classList.remove('valid');
            showNotification(`Invalid ${input.id.includes('network') ? 'CIDR' : 'IP'} format`, 'error');
        }
    }

    validatePortInput(input) {
        const value = parseInt(input.value);
        const min = parseInt(input.min) || 1;
        const max = parseInt(input.max) || 65535;

        if (value < min || value > max) {
            input.classList.add('error');
            input.classList.remove('valid');
        } else {
            input.classList.remove('error');
            input.classList.add('valid');
        }
    }

    validateEndpointInput(input) {
        const value = input.value.trim();
        if (!value) return;

        // Basic domain/IP validation
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const isValidDomain = domainRegex.test(value) || isValidIP(value);

        if (isValidDomain) {
            input.classList.remove('error');
            input.classList.add('valid');
        } else {
            input.classList.add('error');
            input.classList.remove('valid');
            showNotification('Invalid endpoint format (use domain name or IP address)', 'error');
        }
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Activate corresponding nav button
        const navBtn = document.querySelector(`[onclick="showTab('${tabName}')"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }
    }
}

// Global function for onclick handlers
function showTab(tabName) {
    if (window.app) {
        window.app.showTab(tabName);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WireGuardMikroTikApp();
});