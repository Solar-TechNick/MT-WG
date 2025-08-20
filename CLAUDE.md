# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## RULES !!!!
Don't asume!! AÖWAYS ASK QESTIONS!!!

## Project Overview

This is a comprehensive web-based WireGuard VPN and LTE mobile configuration generator optimized for MikroTik RouterOS. The project generates professional-grade configurations with enterprise features and user-friendly interfaces.

## Current Implementation Status

**✅ FULLY IMPLEMENTED** - Complete working application with advanced features deployed at: https://github.com/Solar-TechNick/MT-WG

## Core Features

### WireGuard Configuration Generator
- **Configuration Types**: Client-server and site-to-site VPN setups
- **Security**: Secure Curve25519 key generation using WebCrypto API with fallback
- **Networking**: Automatic IP subnet calculation and allocation
- **Mobile Support**: QR code generation for mobile client import
- **Output Options**: Choose between WireGuard configs, MikroTik scripts, or both
- **Custom Naming**: Editable labels for sites/clients with dynamic naming fields

### Advanced WireGuard Features
- **DNS Configuration**: Customizable DNS servers (default: 1.1.1.1, 8.8.8.8)
- **IPv6 Support**: Dual-stack IPv4/IPv6 configurations
- **Routing Control**: Custom routing table selection for RouterOS
- **Allowed IPs**: Configurable traffic routing per client
- **File Management**: Individual config downloads (.conf and .rsc files)

### Enterprise Firewall Features
- **Granular Control**: Individual toggles for each firewall feature
- **Security Hardening**: Invalid connection dropping, traffic logging
- **Network Access**: Configurable local network access with custom CIDR ranges
- **Router Protection**: Block external access to router services via LTE
- **WAN Integration**: Configurable WAN interface lists

### LTE Mobile Configuration
- **Provider Database**: 15+ German mobile providers (Telekom, Vodafone, O2, etc.)
- **Auto-Configuration**: Provider selection auto-fills APN settings
- **Authentication**: Visual indicators for required/optional authentication
- **Complete Scripts**: RouterOS scripts with SIM PIN, APN, routing, NAT, firewall

### Enhanced User Experience
- **Collapsible Sections**: Individual configuration sections (collapsed by default)
- **Individual Copy**: Per-section copy buttons for easy deployment
- **Editable Names**: Click-to-edit labels for sites and clients in section headers
- **Professional UI**: Responsive design with comprehensive tooltips
- **Smart Validation**: Real-time input validation with helpful error messages

## File Structure

```
/
├── index.html              # Main application with modular component loading (82 lines)
├── index-old.html          # Legacy monolithic version (backup)
├── styles.css              # Responsive CSS with modern styling
├── components/             # Modular HTML components
│   ├── wireguard-form.html # WireGuard configuration form component
│   └── lte-form.html       # LTE configuration form component
├── js/
│   ├── app.js              # Main application controller with validation
│   ├── wireguard.js        # WireGuard configuration logic with working crypto
│   ├── lte.js              # LTE provider database and generation
│   ├── qrcode.js           # QR code generation with async support
│   ├── qr-offline.js       # Offline QR code fallback implementation
│   └── utils.js            # Utility functions and validation
├── demo/                   # Working reference implementation
│   ├── index.html          # Demo with proven functionality
│   ├── script.js           # Working crypto implementation source
│   ├── qr-offline.js       # QR code implementation source
│   └── style.css           # Demo styling
├── test-crypto.html        # Crypto functionality testing page
├── CLAUDE.md               # This file
├── README.md               # User documentation
├── INSTALL.md              # Installation and usage guide
└── ToDo.md                 # Original project requirements
```

## Technical Architecture

### Modular Component System - **NEW**
- **ComponentLoader**: Dynamic HTML component loading via fetch API
- **Separation of Concerns**: Forms separated from main application logic
- **Event Binding**: Proper reinitialization after component loading
- **Maintainability**: Easier updates to individual form sections

### Key Generation (`js/wireguard.js:150-215`) - **FIXED**
- **Working Implementation**: Copied from proven demo implementation
- **Proper Key Clamping**: WireGuard-compliant Curve25519 key generation
- **WebCrypto Support**: X25519 key derivation with fallback for unsupported browsers
- **Base64 Encoding**: Robust encoding/decoding functions for key handling

### QR Code Generation (`js/qrcode.js` + `js/qr-offline.js`) - **FIXED**
- **Async Support**: Proper async/await implementation for QR generation
- **Fallback Chain**: External library → SimpleQRCode → placeholder
- **Canvas Rendering**: Real QR patterns with proper finder markers
- **Mobile Compatibility**: Scannable QR codes for WireGuard mobile apps

### Configuration Generation (`js/wireguard.js:216-337`)
- Dynamic client/site counting with custom naming
- Comprehensive input validation (IP, CIDR, endpoints)
- Support for both output types (WireGuard/MikroTik/Both)

### Enhanced Output Sections (`js/wireguard.js:598-663`) - **ENHANCED**
- **Tabbed Interface**: Separate WireGuard/MikroTik views
- **Smart Population**: Content automatically fills appropriate tabs
- **Individual Copy**: Per-section copy buttons for easy deployment
- **Type-aware Downloads**: Automatic .rsc/.conf file extensions

### Provider Database (`js/lte.js:39-163`)
- Comprehensive German LTE provider data
- Authentication status indicators
- Automatic profile name generation

### Firewall Management (`js/wireguard.js:389-493`)
- Granular firewall rule generation
- Security-first approach with comprehensive options
- RouterOS-specific rule ordering and syntax

## Development Guidelines

### Code Conventions
- Use modern ES6+ features and WebCrypto API
- Follow existing naming patterns for consistency
- Maintain responsive design principles
- Include comprehensive tooltips for user guidance

### Feature Implementation
- All RouterOS commands validated against official MikroTik documentation
- Implement proper error handling with user-friendly messages
- Use branch-based development with descriptive commit messages
- Test firewall rules for security best practices

### Security Considerations
- Client-side key generation only (no server transmission)
- Secure random number generation for all cryptographic operations
- Input validation for all user-provided data
- No sensitive information in generated logs

## Recent Major Updates - **2024 Latest**

### ✅ **Functionality Fixes Applied**
1. **WireGuard Crypto**: Fixed key generation using proven demo implementation
2. **QR Code Generation**: Working QR codes with offline fallback support
3. **Modular Architecture**: Restructured from 580+ line monolith to 82-line modular design
4. **Enhanced UI**: Improved output tabs for better WireGuard/MikroTik separation
5. **Component Loading**: Dynamic form loading for better maintainability

### 🔧 **Architecture Improvements**
- **Reduced Complexity**: Main index.html from 580+ lines to 82 lines
- **Component Separation**: Forms moved to `/components/` directory
- **Working Demo Integration**: Copied proven functionality from `/demo/` folder
- **Testing Infrastructure**: Added crypto testing capabilities

## Current Branch Structure

- **main**: Latest stable version with all fixes applied
- **feature/fix-functionality-from-demo**: ✅ MERGED - Core functionality fixes
- **feature/enhanced-output-ui**: ✅ MERGED - Enhanced tabbed output interface

## Key Functions Reference

### Component Loading (`index.html:39-78`) - **NEW**
- `ComponentLoader.loadComponent()`: Async HTML component loading
- `ComponentLoader.loadAllComponents()`: Batch component initialization
- Dynamic event binding after component load

### Crypto Functions (`js/wireguard.js:150-266`) - **FIXED**
- `generateKeyPair()`: Working WireGuard key generation
- `generatePrivateKey()`: Proper Curve25519 key clamping
- `derivePublicKey()`: X25519 public key derivation with fallback
- `base64Encode()/base64Decode()`: Robust base64 conversion

### QR Code Generation (`js/qrcode.js:123-140`) - **FIXED**
- `generateClientQRCodes()`: Async QR generation for all clients
- `generateQRCode()`: Multi-fallback QR code creation
- Canvas-based rendering with proper QR patterns

### Output Tab Management (`js/app.js:165-188`) - **NEW**
- `showOutputTab()`: Switch between WireGuard/MikroTik views
- Smart content population based on output type
- Tabbed interface for better user experience

### Dynamic Naming (`js/wireguard.js:93-148`)
- `updateNamingFields()`: Creates dynamic naming inputs based on count
- `getCustomNames()`: Retrieves user-defined names for configurations

### Section Management (`js/wireguard.js:811-867`)
- `toggleSection(sectionId)`: Handles collapsible section interactions
- `copySection(sectionId)`: Individual section clipboard functionality
- `downloadSection(sectionId, type)`: Per-section file downloads

### Validation (`js/utils.js:35-95`)
- `isValidIP(ip)`: IP address validation
- `isValidCIDR(cidr)`: CIDR notation validation
- `calculateSubnet(network, clientCount)`: Subnet calculation

## Deployment Notes

- **Static files only** - no server requirements
- **Modern browser** with WebCrypto API support (fallback included)
- **All processing client-side** for maximum security
- **Mobile-responsive** design for tablet/phone usage
- **Professional grade** suitable for enterprise deployment
- **Component-based** architecture for easy maintenance

## Testing & Validation

### Crypto Testing
- **test-crypto.html**: Standalone crypto function testing
- **Real key generation**: Validates WireGuard key format compliance
- **QR code rendering**: Tests canvas-based QR generation

### Browser Compatibility
- **WebCrypto Support**: Primary X25519 implementation
- **Fallback Support**: Works without WebCrypto API
- **Mobile QR Scanning**: Verified with WireGuard mobile apps

## Project Status: ✅ **PRODUCTION READY**

All major functionality has been fixed and tested:
- ✅ Working WireGuard key generation
- ✅ Functional QR code generation  
- ✅ Modular, maintainable architecture
- ✅ Enhanced user interface
- ✅ Complete LTE provider support
- ✅ Enterprise firewall features