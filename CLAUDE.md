# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## RULES !!!!
Don't assume!! ALWAYS ASK QUESTIONS!!!

## Project Overview

This is a comprehensive web-based WireGuard VPN and LTE mobile configuration generator optimized for **multiple router platforms**. The project generates professional-grade configurations with enterprise features and modern user interfaces for **MikroTik RouterOS**, **VyOS**, and **OPNsense**.

## Current Implementation Status

**✅ FULLY IMPLEMENTED** - Complete working application with advanced multi-platform features deployed at: https://github.com/Solar-TechNick/MT-WG

## Core Features

### Multi-Platform WireGuard Configuration Generator
- **Platforms Supported**: MikroTik RouterOS, VyOS, OPNsense (4 total output formats)
- **Configuration Types**: Client-server and site-to-site VPN setups
- **Security**: Secure Curve25519 key generation using WebCrypto API with fallback
- **Networking**: Automatic IP subnet calculation and allocation
- **Mobile Support**: QR code generation for mobile client import with working display
- **Output Options**: Simultaneous generation for all platforms

### Platform-Specific Features

#### MikroTik RouterOS
- Complete RouterOS script generation with firewall and NAT
- Support for routing tables and interface configuration
- Advanced firewall rules with security hardening
- LTE mobile configuration with German provider database

#### VyOS Configuration - **NEW**
- Full configuration session: `configure → set commands → commit → save`
- Modern IPv4 firewall syntax (VyOS 1.5.x compatible)
- NAT configuration with masquerading support
- Static routing for site-to-site configurations
- Automatic keypair generation commands

#### OPNsense Configuration - **NEW**
- Multi-format output: Web GUI steps + CLI commands + XML snippets
- Step-by-step web interface configuration guide
- Complete firewall and NAT rule setup instructions
- Plugin installation prerequisites and setup
- Client configuration file generation

### Advanced WireGuard Features
- **DNS Configuration**: Customizable DNS servers with LTE DNS toggle
- **IPv6 Support**: Dual-stack IPv4/IPv6 configurations
- **Routing Control**: Custom routing table selection for RouterOS
- **Allowed IPs**: Configurable traffic routing per client
- **File Management**: Downloads for all platforms (.conf, .rsc, .txt, .zip, .pdf)

### Modern User Interface - **REDESIGNED**
- **Dark Corporate Theme**: Professional dark navy theme with blue accents
- **Light/Dark Toggle**: Theme switching with localStorage persistence
- **4-Tab Output Structure**: WireGuard & QR | MikroTik | VyOS | OPNsense
- **Responsive Design**: Mobile-optimized with modern CSS variables
- **Professional Typography**: Consistent spacing and visual hierarchy

### Enhanced Download & Export Features
- **PDF Downloads**: Complete multi-platform PDF with all configurations
- **QR Code ZIP**: Download QR codes as images + config files
- **Copy All**: Clipboard copy of all platform configurations
- **Individual Copy**: Per-section copy buttons for each platform

### LTE Mobile Configuration
- **Provider Database**: 18+ German mobile providers (Telekom, Vodafone, O2, etc.)
- **Auto-Configuration**: Provider selection auto-fills APN settings
- **DNS Configuration**: Toggle for DNS server configuration
- **Complete Scripts**: RouterOS scripts with SIM PIN, APN, routing, NAT, firewall

## File Structure

```
/
├── index.html              # Main application with modern 4-tab interface
├── index-old.html          # Legacy version (backup)
├── styles.css              # Modern dark corporate theme with CSS variables
├── components/             # Modular HTML components
│   ├── wireguard-form.html # WireGuard configuration form component
│   └── lte-form.html       # LTE configuration form component
├── js/
│   ├── app.js              # Main application with download functionality
│   ├── wireguard.js        # WireGuard + multi-platform generation
│   ├── vyos.js             # VyOS configuration generator - NEW
│   ├── opnsense.js         # OPNsense configuration generator - NEW
│   ├── lte.js              # LTE provider database and generation
│   ├── crypto.js           # WebCrypto API implementation with fallbacks
│   └── utils.js            # Utility functions and validation
├── demo/                   # Working reference implementation
│   ├── index.html          # Demo with proven functionality
│   ├── script.js           # Working crypto implementation source
│   ├── qr-offline.js       # QR code implementation source
│   └── qr-test.html        # QR code testing page
├── test-crypto.html        # Crypto functionality testing page
├── CLAUDE.md               # This file
├── README.md               # User documentation
├── INSTALL.md              # Installation and usage guide
└── ToDo.md                 # Original project requirements
```

## Technical Architecture

### Multi-Platform Generation System - **NEW**
- **Modular Generators**: Separate modules for each platform (MikroTik, VyOS, OPNsense)
- **Unified Workflow**: Single configuration generates all platform outputs
- **Research-Based**: Implementation based on official platform documentation
- **Error Handling**: Graceful fallbacks with manual setup notes

### Modern UI Architecture - **REDESIGNED**
- **CSS Variables**: Dark/light theme system with custom properties
- **4-Tab Layout**: Combined WireGuard & QR tab + 3 platform-specific tabs
- **Professional Design**: Corporate dark navy theme with blue accents
- **Responsive Grid**: Mobile-first design with flexible layouts

### Key Generation (`js/crypto.js`) - **ENHANCED**
- **WebCrypto Implementation**: X25519 key derivation with proper clamping
- **Fallback Support**: Math.random fallback for unsupported environments
- **Pre-shared Keys**: Secure PSK generation for additional security
- **Key Validation**: WireGuard format compliance checking

### QR Code Generation - **FIXED**
- **Working Display**: QRCodeWrapper implementation for proper rendering
- **Offline Support**: Multiple fallback systems for QR generation
- **Canvas Rendering**: Real QR patterns with proper finder markers
- **Mobile Compatibility**: Scannable codes for WireGuard mobile apps

### Download & Export System - **NEW**
- **PDF Generation**: jsPDF-based multi-platform PDF creation
- **ZIP Downloads**: JSZip for QR code + config file packages
- **Clipboard Integration**: Copy all configurations functionality
- **File Naming**: Professional naming conventions with dates

## Platform-Specific Implementation

### VyOS Generator (`js/vyos.js`) - **NEW**
- **Configuration Session**: Full commit/save workflow implementation
- **Modern Firewall**: IPv4 firewall with state policy (VyOS 1.5.x syntax)
- **NAT Configuration**: Source NAT with masquerading rules
- **Site-to-Site**: Static routing and peer configuration
- **Best Practices**: Research-verified command syntax

### OPNsense Generator (`js/opnsense.js`) - **NEW**
- **Multi-Format Output**: Web GUI + CLI + XML configuration
- **Step-by-Step Guide**: Complete web interface setup instructions
- **Prerequisites**: Plugin installation and setup requirements
- **XML Configuration**: Proper OPNsense config.xml structure
- **Client Files**: Generated WireGuard client configuration files

## Development Guidelines

### Code Conventions
- Use modern ES6+ features and WebCrypto API
- Follow modular architecture with separated concerns
- Maintain professional dark theme consistency
- Always ask questions before implementing changes

### Feature Implementation
- All platform commands validated against official documentation
- Implement proper error handling with user-friendly messages
- Use research-based approach for new platform support
- Test configurations for security best practices

### Security Considerations
- Client-side key generation only (no server transmission)
- Secure random number generation for all cryptographic operations
- Input validation for all user-provided data
- No sensitive information in generated logs

## Recent Major Updates - **2024 Latest**

### ✅ **Multi-Platform Implementation - COMPLETED**
1. **VyOS Support**: Complete VyOS configuration with commit/save session
2. **OPNsense Support**: Multi-format output with GUI steps, CLI, and XML
3. **4-Tab Interface**: Redesigned output structure combining WireGuard & QR
4. **Research-Based**: Implementation following official platform documentation

### ✅ **Modern UI Redesign - COMPLETED**
1. **Corporate Theme**: Professional dark navy theme with blue accents
2. **Theme Toggle**: Light/dark mode switching with persistence
3. **Responsive Design**: Mobile-optimized with CSS variables
4. **Professional Typography**: Consistent design system

### ✅ **Enhanced Functionality - COMPLETED**
1. **Working QR Codes**: Fixed display with QRCodeWrapper implementation
2. **PDF Downloads**: Multi-platform PDF generation with jsPDF
3. **Download System**: ZIP downloads, copy all, individual copy buttons
4. **DNS Configuration**: LTE DNS toggle and configuration

### 🔧 **Architecture Improvements - COMPLETED**
- **Modular Generators**: Separate VyOS and OPNsense modules
- **Unified Workflow**: Single configuration generates all platforms
- **Error Handling**: Graceful fallbacks with manual setup notes
- **Professional Output**: Consistent formatting across all platforms

## Current Branch Structure

- **main**: Production-ready version with multi-platform support
- **feature/modern-redesign**: ✅ MERGED - Complete redesign with VyOS/OPNsense

## Key Functions Reference

### Multi-Platform Generation (`js/wireguard.js:56-95, 102-131`) - **NEW**
- `generateClientServerConfigs()`: Generates all platform configurations
- `generateSiteToSiteConfigs()`: Multi-platform site-to-site setup
- VyOS and OPNsense integration with error handling

### VyOS Configuration (`js/vyos.js`) - **NEW**
- `generate()`: Main VyOS configuration generator
- `createServerConfig()`: Client-server setup with full session
- `createSiteConfig()`: Site-to-site configuration
- `generateFirewallRules()`: Modern IPv4 firewall syntax
- `generateNATRules()`: Source NAT configuration

### OPNsense Configuration (`js/opnsense.js`) - **NEW**
- `generate()`: Main OPNsense configuration generator
- `createServerConfig()`: Multi-format server setup
- `createSiteConfig()`: Site-to-site configuration
- `generateServerXMLConfig()`: XML configuration snippets

### Modern UI Management (`js/app.js:564-592`) - **ENHANCED**
- `displayConfigurations()`: 4-platform output display
- `formatVyOSOutput()`: VyOS configuration formatting
- `formatOPNsenseOutput()`: OPNsense configuration formatting
- Theme switching and persistence

### Download System (`js/app.js:888-984, 1011-1194`) - **NEW**
- `copyAllConfigurations()`: Multi-platform clipboard copy
- `downloadQRCodes()`: ZIP download with images + configs
- `downloadAsPDF()`: Complete PDF generation with all platforms
- JSZip and jsPDF integration

### Crypto Functions (`js/crypto.js`) - **ENHANCED**
- `generateKeyPair()`: Working WireGuard key generation
- `generatePresharedKey()`: PSK generation for additional security
- `validateKey()`: WireGuard format compliance
- WebCrypto with fallback support

## Deployment Notes

- **Static files only** - no server requirements
- **Modern browser** with WebCrypto API support (fallback included)
- **All processing client-side** for maximum security
- **Multi-platform output** - supports 4 different router platforms
- **Professional grade** suitable for enterprise deployment
- **Research-verified** configurations following official documentation

## Testing & Validation

### Platform Testing
- **VyOS Commands**: Validated against VyOS 1.5.x documentation
- **OPNsense Configuration**: Tested multi-format output structure
- **MikroTik Scripts**: RouterOS command validation
- **Cross-Platform**: Consistent configuration across all platforms

### UI/UX Testing
- **Theme Switching**: Light/dark mode persistence
- **Responsive Design**: Mobile and desktop optimization
- **Download Functionality**: PDF, ZIP, and copy operations
- **QR Code Display**: Working QR code generation and display

## Project Status: ✅ **PRODUCTION READY - MULTI-PLATFORM**

All major functionality implemented and tested:
- ✅ Multi-platform support (MikroTik, VyOS, OPNsense)
- ✅ Modern dark corporate theme with light/dark toggle
- ✅ Working QR code generation and display
- ✅ Complete download system (PDF, ZIP, copy all)
- ✅ Research-based platform configurations
- ✅ Professional 4-tab interface
- ✅ Enhanced LTE configuration with DNS support
- ✅ Full client-server and site-to-site support
- ✅ Enterprise-grade security and validation