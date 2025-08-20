# WireGuard MikroTik Configurator

A comprehensive web-based tool for generating WireGuard VPN and LTE mobile configurations optimized for MikroTik RouterOS.

## Features

### 🔐 WireGuard VPN Configuration
- **Client-Server Configuration**: Traditional VPN setup with central server and multiple clients
- **Site-to-Site Configuration**: Multi-site network connectivity with mesh topology
- **Automatic Key Generation**: Secure Curve25519 key pairs using WebCrypto API
- **Manual Key Management**: Custom private/public keys and individual Pre-Shared Keys per client
- **Subnet Calculation**: Automatic IP allocation and subnet sizing based on client count
- **QR Code Generation**: Mobile-friendly QR codes for easy client configuration import
- **Separate Script Generation**: Individual RouterOS scripts for each server/client/site
- **Advanced Options**: MTU, keepalive, NAT, firewall rules, routing table control

### 📡 LTE Mobile Configuration
- **Comprehensive German Provider Database**: 15+ providers with accurate APN settings
  - Deutsche Telekom (main, alternative, IPv6-only variants)
  - Vodafone (standard, GigaCube)
  - O2/Telefónica (contract, prepaid)
  - 1&1, ALDI TALK, congstar, otelo, mobilcom-debitel, klarmobil, drillisch, freenet
- **Automatic Configuration**: Provider selection auto-fills APN, authentication, and profile names
- **Multiple APN Profiles**: Configure multiple providers for failover or different connection types
- **Authentication Handling**: Automatic username/password detection with visual indicators
- **Complete RouterOS Scripts**: Generated scripts include SIM PIN, APN profiles, routing, NAT, and firewall rules

### 🛠️ Technical Features
- **Validated RouterOS Commands**: All commands checked against official MikroTik documentation
- **Manual Configuration Fields**: Interface names, PSK settings, local networks
- **Professional UI**: Responsive design with navigation between WireGuard and LTE pages
- **Comprehensive Tooltips**: User-friendly explanations for all fields and non-technical users
- **Copy-to-Clipboard**: Easy script copying with visual feedback
- **Error Handling**: Robust error handling with helpful user guidance
- **Debug Tools**: Console commands for troubleshooting and testing

## Getting Started

1. Open `index.html` in a modern web browser
2. Choose between WireGuard VPN or LTE Mobile configuration
3. Fill in the required fields
4. Generate your RouterOS configuration scripts
5. Copy and paste the scripts into your MikroTik router

## Usage

### WireGuard Configuration

1. **Select Configuration Type**: Choose between Client-Server or Site-to-Site VPN
2. **Server Settings**: Configure server name, port, IP network, and endpoint
3. **Client Count**: Specify how many client configurations to generate
4. **Advanced Options**: Set MTU, keepalive, enable NAT and firewall rules
5. **Key Management**: Auto-generate secure keys or enter your own
6. **Generate**: Create RouterOS scripts and client configuration files
7. **QR Codes**: Generate QR codes for mobile client import

### LTE Configuration

1. **Provider Selection**: Choose from 15+ German mobile network providers
2. **APN Settings**: Automatically filled based on provider selection
3. **Authentication**: Username/password handling with visual indicators
4. **Interface Settings**: Configure LTE interface, profile name, and advanced options
5. **Generate**: Create complete RouterOS script with all necessary settings

## Mobile Provider Database

| Provider | APN | Username | Password | Auth | Network |
|----------|-----|----------|----------|------|---------|
| Deutsche Telekom | internet.telekom | telekom | tm | CHAP | Telekom |
| Deutsche Telekom (Alt) | internet.t-mobile | - | - | CHAP | Telekom |
| Vodafone | web.vodafone.de | - | - | CHAP | Vodafone |
| O2 Contract | internet | - | - | PAP | O2 |
| And 11+ more... | | | | | |

## Browser Compatibility

- Chrome/Chromium 67+
- Firefox 78+
- Safari 14+
- Edge 79+

Requires modern browser with WebCrypto API support for secure key generation.

## Security

- All key generation is performed client-side using WebCrypto API
- No data is transmitted to external servers
- Private keys never leave your browser
- Secure random number generation for cryptographic keys

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the GitHub Issues page.