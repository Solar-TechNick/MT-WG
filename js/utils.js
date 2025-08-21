/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

/**
 * Validate IP address
 * @param {string} ip 
 * @returns {boolean}
 */
function isValidIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}

/**
 * Validate CIDR notation
 * @param {string} cidr 
 * @returns {boolean}
 */
function isValidCIDR(cidr) {
    const parts = cidr.split('/');
    if (parts.length !== 2) return false;
    
    const ip = parts[0];
    const prefix = parseInt(parts[1]);
    
    return isValidIP(ip) && prefix >= 0 && prefix <= 32;
}

/**
 * Validate domain name
 * @param {string} domain 
 * @returns {boolean}
 */
function isValidDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
}

/**
 * Validate port number
 * @param {number} port 
 * @returns {boolean}
 */
function isValidPort(port) {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
}

/**
 * Generate random string
 * @param {number} length 
 * @returns {string}
 */
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Download text as file
 * @param {string} content 
 * @param {string} filename 
 * @param {string} contentType 
 */
function downloadTextAsFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

/**
 * Download multiple files as ZIP
 * @param {Array} files Array of {name, content, type} objects
 * @param {string} zipName 
 */
async function downloadFilesAsZip(files, zipName = 'configurations.zip') {
    // Simple implementation without external libraries
    // In production, you'd use a library like JSZip
    
    for (const file of files) {
        downloadTextAsFile(file.content, file.name, file.type);
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

/**
 * Copy text to clipboard
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        return false;
    }
}

/**
 * Sanitize filename for downloads
 * @param {string} filename 
 * @returns {string}
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9\-_\.]/gi, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_+|_+$/g, '');
}

/**
 * Format bytes to human readable string
 * @param {number} bytes 
 * @returns {string}
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function calls
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
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

/**
 * Throttle function calls
 * @param {Function} func 
 * @param {number} limit 
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Calculate network range from CIDR
 * @param {string} cidr 
 * @returns {object|null}
 */
function calculateNetworkRange(cidr) {
    try {
        const [ip, prefixLength] = cidr.split('/');
        const prefix = parseInt(prefixLength);
        
        if (!isValidIP(ip) || prefix < 0 || prefix > 32) {
            return null;
        }
        
        const ipParts = ip.split('.').map(Number);
        const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
        
        const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
        const networkInt = (ipInt & mask) >>> 0;
        const broadcastInt = (networkInt | (0xFFFFFFFF >>> prefix)) >>> 0;
        
        const intToIP = (int) => [
            (int >>> 24) & 0xFF,
            (int >>> 16) & 0xFF,
            (int >>> 8) & 0xFF,
            int & 0xFF
        ].join('.');
        
        return {
            network: intToIP(networkInt),
            broadcast: intToIP(broadcastInt),
            firstHost: intToIP(networkInt + 1),
            lastHost: intToIP(broadcastInt - 1),
            totalHosts: (1 << (32 - prefix)) - 2,
            mask: intToIP(mask)
        };
    } catch (error) {
        console.error('Network calculation error:', error);
        return null;
    }
}

/**
 * Get next available IP in network
 * @param {string} cidr 
 * @param {Array<string>} usedIPs 
 * @returns {string|null}
 */
function getNextAvailableIP(cidr, usedIPs = []) {
    const range = calculateNetworkRange(cidr);
    if (!range) return null;
    
    const [network, prefix] = cidr.split('/');
    const networkParts = network.split('.').map(Number);
    
    for (let i = 2; i < range.totalHosts + 1; i++) {
        const newIP = [...networkParts];
        newIP[3] = networkParts[3] + i - 1;
        
        // Handle overflow to next octet
        if (newIP[3] > 255) {
            newIP[3] = newIP[3] - 256;
            newIP[2]++;
            if (newIP[2] > 255) {
                newIP[2] = newIP[2] - 256;
                newIP[1]++;
                if (newIP[1] > 255) {
                    break; // Network too small
                }
            }
        }
        
        const candidateIP = newIP.join('.');
        if (!usedIPs.includes(candidateIP)) {
            return candidateIP;
        }
    }
    
    return null;
}

/**
 * Format date for filenames
 * @param {Date} date 
 * @returns {string}
 */
function formatDateForFilename(date = new Date()) {
    return date.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0];
}

/**
 * Show notification (if no global notification system available)
 * @param {string} message 
 * @param {string} type 
 */
function showNotification(message, type = 'info') {
    // This will be overridden by the main app's notification system
    console.log(`${type.toUpperCase()}: ${message}`);
}

/**
 * Local storage helpers with error handling
 */
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
};

// Export for global use
window.Utils = {
    isValidIP,
    isValidCIDR,
    isValidDomain,
    isValidPort,
    generateRandomString,
    downloadTextAsFile,
    downloadFilesAsZip,
    copyToClipboard,
    sanitizeFilename,
    formatBytes,
    debounce,
    throttle,
    calculateNetworkRange,
    getNextAvailableIP,
    formatDateForFilename,
    showNotification,
    storage
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.Utils;
}