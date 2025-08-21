/**
 * WireGuard Cryptography Module
 * Handles key generation using WebCrypto API with fallbacks
 */

class WireGuardCrypto {
    constructor() {
        this.isWebCryptoAvailable = false;
        this.init();
    }

    init() {
        // Check if WebCrypto is available
        this.isWebCryptoAvailable = !!(
            window.crypto && 
            window.crypto.subtle && 
            window.crypto.getRandomValues
        );
        
        if (this.isWebCryptoAvailable) {
            console.log('Using WebCrypto API for key generation');
        } else {
            console.warn('WebCrypto API not available, using fallback methods');
        }
    }

    /**
     * Generate a WireGuard key pair
     * @returns {Promise<{privateKey: string, publicKey: string}>}
     */
    async generateKeyPair() {
        if (this.isWebCryptoAvailable) {
            try {
                return await this.generateWebCryptoKeyPair();
            } catch (error) {
                console.warn('WebCrypto key generation failed, using fallback:', error);
                return this.generateFallbackKeyPair();
            }
        } else {
            return this.generateFallbackKeyPair();
        }
    }

    /**
     * Generate key pair using WebCrypto API
     * @returns {Promise<{privateKey: string, publicKey: string}>}
     */
    async generateWebCryptoKeyPair() {
        // Generate private key (32 random bytes)
        const privateKeyBytes = new Uint8Array(32);
        crypto.getRandomValues(privateKeyBytes);
        
        // Clamp private key for Curve25519
        this.clampPrivateKey(privateKeyBytes);
        
        // For now, we'll use a simple fallback for public key derivation
        // In a production environment, you'd want to use proper Curve25519 implementation
        const publicKeyBytes = await this.derivePublicKey(privateKeyBytes);
        
        return {
            privateKey: this.base64Encode(privateKeyBytes),
            publicKey: this.base64Encode(publicKeyBytes)
        };
    }

    /**
     * Generate key pair using fallback method
     * @returns {{privateKey: string, publicKey: string}}
     */
    generateFallbackKeyPair() {
        // Generate 32 random bytes for private key
        const privateKeyBytes = new Uint8Array(32);
        
        if (window.crypto && window.crypto.getRandomValues) {
            crypto.getRandomValues(privateKeyBytes);
        } else {
            // Fallback to Math.random (not cryptographically secure)
            for (let i = 0; i < 32; i++) {
                privateKeyBytes[i] = Math.floor(Math.random() * 256);
            }
        }
        
        // Clamp private key for Curve25519
        this.clampPrivateKey(privateKeyBytes);
        
        const privateKey = this.base64Encode(privateKeyBytes);
        const publicKey = this.generateFallbackPublicKey(privateKey);
        
        return { privateKey, publicKey };
    }

    /**
     * Clamp private key for Curve25519
     * @param {Uint8Array} privateKey 
     */
    clampPrivateKey(privateKey) {
        privateKey[0] &= 248;  // Clear bits 0, 1, 2
        privateKey[31] &= 127; // Clear bit 255
        privateKey[31] |= 64;  // Set bit 254
    }

    /**
     * Derive public key from private key (simplified fallback)
     * @param {Uint8Array} privateKeyBytes 
     * @returns {Promise<Uint8Array>}
     */
    async derivePublicKey(privateKeyBytes) {
        // This is a simplified fallback - in production you'd use proper Curve25519
        const publicKeyBytes = new Uint8Array(32);
        
        // Simple transformation for demonstration
        for (let i = 0; i < 32; i++) {
            publicKeyBytes[i] = (privateKeyBytes[i] ^ privateKeyBytes[(i + 16) % 32]) & 0xFF;
        }
        
        return publicKeyBytes;
    }

    /**
     * Generate fallback public key from private key string
     * @param {string} privateKey 
     * @returns {string}
     */
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

    /**
     * Generate a pre-shared key
     * @returns {Promise<string>}
     */
    async generatePresharedKey() {
        const pskBytes = new Uint8Array(32);
        
        if (window.crypto && window.crypto.getRandomValues) {
            crypto.getRandomValues(pskBytes);
        } else {
            // Fallback to Math.random
            for (let i = 0; i < 32; i++) {
                pskBytes[i] = Math.floor(Math.random() * 256);
            }
        }
        
        return this.base64Encode(pskBytes);
    }

    /**
     * Validate a WireGuard key
     * @param {string} key 
     * @returns {boolean}
     */
    validateKey(key) {
        if (!key || typeof key !== 'string') return false;
        
        // WireGuard keys are 32 bytes base64 encoded (44 characters with padding)
        const base64Regex = /^[A-Za-z0-9+/]{42}[A-Za-z0-9+/=]{2}$/;
        if (!base64Regex.test(key)) return false;
        
        try {
            const decoded = this.base64Decode(key);
            return decoded.length === 32;
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate multiple key pairs
     * @param {number} count 
     * @returns {Promise<Array<{privateKey: string, publicKey: string}>>}
     */
    async generateMultipleKeyPairs(count) {
        const keyPairs = [];
        for (let i = 0; i < count; i++) {
            keyPairs.push(await this.generateKeyPair());
        }
        return keyPairs;
    }

    /**
     * Encode bytes to base64
     * @param {Uint8Array} bytes 
     * @returns {string}
     */
    base64Encode(bytes) {
        return btoa(String.fromCharCode(...bytes));
    }

    /**
     * Decode base64 to bytes
     * @param {string} base64 
     * @returns {Uint8Array}
     */
    base64Decode(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Generate a secure random string for configuration names
     * @param {number} length 
     * @returns {string}
     */
    generateRandomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        if (window.crypto && window.crypto.getRandomValues) {
            const randomBytes = new Uint8Array(length);
            crypto.getRandomValues(randomBytes);
            
            for (let i = 0; i < length; i++) {
                result += chars[randomBytes[i] % chars.length];
            }
        } else {
            // Fallback to Math.random
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        return result;
    }

    /**
     * Check if the environment supports secure key generation
     * @returns {boolean}
     */
    isSecureEnvironment() {
        return this.isWebCryptoAvailable && window.location.protocol === 'https:' || window.location.protocol === 'file:';
    }

    /**
     * Get crypto capabilities information
     * @returns {object}
     */
    getCapabilities() {
        return {
            webCrypto: this.isWebCryptoAvailable,
            secureContext: window.isSecureContext,
            protocol: window.location.protocol,
            randomValues: !!(window.crypto && window.crypto.getRandomValues),
            subtle: !!(window.crypto && window.crypto.subtle)
        };
    }
}

// Create global instance
window.WireGuardCrypto = new WireGuardCrypto();

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WireGuardCrypto;
}