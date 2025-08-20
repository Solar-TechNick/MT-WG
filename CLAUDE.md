# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
├── index.html              # Main application with tab navigation
├── styles.css              # Responsive CSS with modern styling
├── js/
│   ├── app.js              # Main application controller with validation
│   ├── wireguard.js        # WireGuard configuration logic and sections
│   ├── lte.js              # LTE provider database and generation
│   ├── qrcode.js           # QR code generation module
│   └── utils.js            # Utility functions and validation
├── CLAUDE.md               # This file
├── README.md               # User documentation
├── INSTALL.md              # Installation and usage guide
└── ToDo.md                 # Original project requirements
```

## Technical Architecture

### Key Generation (`js/wireguard.js:150-215`)
- Primary: X25519 key generation via WebCrypto API
- Fallback: crypto.getRandomValues with proper Curve25519 clamping
- Validation: Base64 key format validation

### Configuration Generation (`js/wireguard.js:216-337`)
- Dynamic client/site counting with custom naming
- Comprehensive input validation (IP, CIDR, endpoints)
- Support for both output types (WireGuard/MikroTik/Both)

### Enhanced Sections (`js/wireguard.js:598-663`)
- Dynamic collapsible sections with smooth animations
- Individual content storage in data attributes
- Type-aware file downloads (.rsc vs .conf)
- Editable section names with real-time updates

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

## Current Branch Structure

- **main**: Stable release version
- **feature/enhanced-wireguard-features**: DNS, IPv6, routing enhancements
- **feature/enhanced-firewall-rules**: Comprehensive MikroTik firewall options
- **feature/config-output-selector**: Output type selection (WG/MT/Both)
- **feature/enhanced-config-sections**: Individual copy-paste sections

## Key Functions Reference

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
- **Modern browser** with WebCrypto API support required
- **All processing client-side** for maximum security
- **Mobile-responsive** design for tablet/phone usage
- **Professional grade** suitable for enterprise deployment