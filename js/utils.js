// Utility functions

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        ${type === 'success' ? 'background: #27ae60;' : ''}
        ${type === 'error' ? 'background: #e74c3c;' : ''}
        ${type === 'info' ? 'background: #3498db;' : ''}
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Validate IP address
function isValidIP(ip) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
    });
}

// Validate CIDR notation
function isValidCIDR(cidr) {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (!cidrRegex.test(cidr)) return false;
    
    const [ip, prefix] = cidr.split('/');
    const prefixNum = parseInt(prefix, 10);
    
    return isValidIP(ip) && prefixNum >= 0 && prefixNum <= 32;
}

// Calculate subnet information
function calculateSubnet(network, clientCount) {
    const [baseIP, prefixLength] = network.split('/');
    const prefix = parseInt(prefixLength, 10);
    
    // Calculate required subnet size
    const requiredHosts = clientCount + 2; // +2 for network and broadcast
    const requiredBits = Math.ceil(Math.log2(requiredHosts));
    const newPrefix = 32 - requiredBits;
    
    // Ensure we don't exceed the original network
    const actualPrefix = Math.max(newPrefix, prefix);
    
    return {
        network: `${baseIP}/${actualPrefix}`,
        hostBits: 32 - actualPrefix,
        maxHosts: Math.pow(2, 32 - actualPrefix) - 2,
        prefix: actualPrefix
    };
}

// Generate IP addresses for clients
function generateClientIPs(network, count) {
    const [baseIP, prefix] = network.split('/');
    const ipParts = baseIP.split('.').map(Number);
    const ips = [];
    
    for (let i = 1; i <= count; i++) {
        const newIP = [...ipParts];
        newIP[3] += i;
        
        // Handle overflow to next octet
        for (let j = 3; j >= 0; j--) {
            if (newIP[j] > 255) {
                newIP[j] = newIP[j] - 256;
                if (j > 0) newIP[j - 1]++;
            }
        }
        
        ips.push(`${newIP.join('.')}/32`);
    }
    
    return ips;
}

// Validate WireGuard key format
function isValidWireGuardKey(key) {
    // WireGuard keys are 44 characters long, base64 encoded
    const keyRegex = /^[A-Za-z0-9+/]{42}[A-Za-z0-9+/=]{2}$/;
    return keyRegex.test(key);
}

// Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Debounce function for input validation
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}