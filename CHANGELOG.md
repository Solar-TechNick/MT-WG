# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-10-23

### Added
- **MikroTik REST API Integration**: Direct configuration application to routers
  - Full REST API client implementation (js/mikrotik-api.js)
  - HTTP Basic Authentication support
  - Support for RouterOS v7.1+ REST API
  - Command execution via REST endpoints
  - Configuration script parsing and application

- **Router Connection Panel**: Floating connection interface
  - Router IP/hostname configuration
  - Username and password authentication
  - HTTP/HTTPS protocol selection with port override
  - Connection status indicator (green/red dot)
  - System information display (identity, model, version, uptime, CPU load)
  - Session persistence (connection info saved, password excluded)
  - Test connection functionality

- **Apply to Router Functionality**: One-click configuration deployment
  - "Apply to Router" buttons in WireGuard, WiFi, and LTE output sections
  - Real-time progress feedback with command execution counts
  - Automatic enabling/disabling based on connection status
  - Detailed success/error notifications
  - Command-by-command result reporting

- **CORS Proxy Server** (cors-proxy.py): Solves browser CORS restrictions
  - Python-based proxy server on port 8081
  - Routes browser requests to router avoiding CORS blocks
  - Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)
  - SSL certificate bypass for testing
  - Automatic proxy detection and usage

- **Setup Instructions and Troubleshooting**:
  - Requirements checklist in connection panel
  - Expandable setup instructions with RouterOS commands
  - CORS troubleshooting guide
  - Detailed error messages with solutions
  - Theme-aware code block styling (dark/light mode)

### Changed
- Updated subtitle to include "apply" functionality
- Enhanced error handling with specific messages for authentication, network, and CORS issues
- Improved API response handling for both array and object formats
- Added comprehensive console logging for debugging
- Updated version to v1.3.0

### Technical Details
- **New Files**:
  - `js/mikrotik-api.js` (449 lines) - REST API client
  - `cors-proxy.py` (149 lines) - CORS proxy server
- **Modified Files**:
  - `index.html` (+150 lines) - Connection UI and apply buttons
  - `js/app.js` (+415 lines) - Connection management and apply methods
  - `styles.css` (+279 lines) - Router connection panel styling
- **Total Changes**: 1,442 lines added across 5 files

### Requirements
- RouterOS v7.1 or newer
- www or www-ssl service enabled on router
- Python 3 for CORS proxy (optional, for browser CORS bypass)

## [1.2.0] - 2025-10-23

### Added
- **WiFi Configuration Tab**: Complete WiFi settings management for MikroTik RouterOS
  - Configure 2.4GHz and 5GHz networks independently
  - Enable/disable checkboxes for each frequency band
  - Advanced settings: security (WPA2/WPA3), channels, bandwidth, country code
  - Hide SSID option for each network
  - Interface name customization

- **Multiple Guest Networks**: Support for unlimited guest WiFi networks
  - Dynamic add/remove guest network forms
  - Individual settings per guest network (SSID, password, band, security)
  - Per-network client isolation option
  - Per-network LAN blocking (internet-only access)
  - Automatic renumbering when networks are removed
  - Virtual AP configuration using MikroTik's master-interface feature

- **WiFi Configuration Generator** (js/wifi.js)
  - Generates MikroTik RouterOS scripts for 2.4GHz networks
  - Generates MikroTik RouterOS scripts for 5GHz networks
  - Generates individual scripts per guest network
  - Combined complete configuration script
  - Proper security profile creation
  - Firewall rules for guest network isolation

- **WiFi Form Features**
  - Real-time form validation
  - Show/hide network sections based on enable/disable checkboxes
  - Password strength validation (minimum 8 characters)
  - Download configurations as .rsc files
  - Copy all configurations to clipboard
  - Reset form functionality

### Changed
- Updated main page subtitle to include WiFi configurations
- Improved form organization with collapsible sections
- Enhanced user experience with dynamic form management

## [1.1.0] - 2025-10-22

### Added
- **Manual Client IP Assignment**: Users can now manually assign IP addresses to individual clients
  - New IP address input field in client key management section
  - Automatic validation of IP addresses in CIDR format
  - Network validation to ensure clients are in the same subnet as server
  - Visual error indication with red border for invalid IPs
  - Falls back to auto-generated IPs if field is left empty

### Changed
- Updated CLAUDE.md documentation with accurate file line counts and architecture details
- Added Dynamic Component Loading section to documentation

### Fixed
- Corrected line count discrepancies in project documentation

## [1.0.0] - 2025-10-22

### Initial Production Release

#### WireGuard VPN Features
- Client-Server VPN configuration
- Site-to-Site VPN configuration
- Automatic Curve25519 key generation using WebCrypto API
- Manual key management with PSK support
- QR code generation for mobile clients
- Multi-platform configuration generation:
  - MikroTik RouterOS scripts
  - VyOS configurations
  - OPNsense configurations
- Advanced per-client configuration options
- Configuration import/export functionality

#### LTE Mobile Configuration
- Comprehensive German provider database (18+ providers)
- Multi-provider APN configuration with failover support
- Automatic APN settings by provider selection
- Route priority and distance configuration

#### UI/UX Features
- Dark/Light theme toggle with localStorage persistence
- Responsive design for mobile and desktop
- Professional tooltip system
- Copy-to-clipboard functionality
- PDF and ZIP download support
- Real-time configuration preview

#### Technical Features
- Pure client-side application (no backend)
- WebCrypto API for secure key generation
- Configuration validation and error handling
- Network calculation utilities
- Import parser for WireGuard and MikroTik formats

[1.1.0]: https://github.com/Solar-TechNick/MT-WG/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Solar-TechNick/MT-WG/releases/tag/v1.0.0
