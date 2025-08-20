# MikroTik RouterOS Configurator

A comprehensive web-based tool for generating WireGuard VPN and LTE mobile configurations optimized for MikroTik RouterOS. This configurator supports both Client-Server and Site-to-Site VPN setups with automatic key generation, plus comprehensive LTE configuration for German mobile providers.

## Features

### 🔐 WireGuard VPN Configuration
- **Client-Server Configuration**: Traditional VPN setup with a central server and multiple clients
- **Site-to-Site Configuration**: Connect multiple sites together in a mesh or hub-and-spoke topology
- **Automatic Key Generation**: Secure WireGuard key pair generation using WebCrypto API
- **Manual Key Management**: Support for custom private/public keys and individual Pre-Shared Keys
- **Subnet Calculation**: Automatic IP allocation and subnet sizing based on client count
- **QR Code Generation**: Mobile-friendly QR codes for easy client configuration import
- **Separate Script Generation**: Individual RouterOS scripts for each server/client/site

### 📡 LTE Mobile Configuration
- **Comprehensive German Provider Database**: Pre-configured APN settings for 15+ providers
  - Deutsche Telekom (main, alternative, IPv6-only variants)
  - Vodafone (standard, GigaCube)
  - O2/Telefónica (contract, prepaid)
  - 1&1, ALDI TALK, congstar, otelo, mobilcom-debitel, klarmobil, and more
- **Automatic Configuration**: Provider selection auto-fills APN, authentication, and profile names
- **Multiple APN Profiles**: Configure multiple providers for failover or different connection types
- **Authentication Handling**: Automatic username/password detection with visual indicators
- **Complete RouterOS Scripts**: Generated scripts include SIM PIN, APN profiles, routing, NAT, and firewall rules

### MikroTik Integration
- **RouterOS Script Generation**: Ready-to-use RouterOS commands for interface and peer configuration
- **Firewall Rules**: Automatic generation of appropriate firewall rules
- **NAT/Masquerade Support**: Optional NAT configuration for internet access through VPN
- **Interface List Management**: Proper integration with RouterOS interface lists

### Advanced Options
- **Pre-Shared Key Support**: Optional additional security layer with PSK
- **Routing Table Control**: Option to limit routing to VPN subnet only
- **MTU Configuration**: Customizable Maximum Transmission Unit settings
- **Persistent Keepalive**: Configurable keepalive intervals for NAT traversal

## Usage

### Getting Started
1. Open `index.html` in a modern web browser
2. Choose between Client-Server or Site-to-Site configuration
3. Configure your network parameters
4. Click "Generate Configuration" to create configs

### Client-Server Setup
1. Select "Client-Server Configuration"
2. Configure server settings:
   - Server Name and IP/CIDR
   - Listen Port (default: 51820)
   - Public Endpoint (your server's public IP/domain)
3. Set number of clients (automatic subnet calculation)
4. Configure DNS servers and allowed IPs
5. Enable advanced options as needed
6. Generate configuration

### Site-to-Site Setup
1. Select "Site-to-Site Configuration"
2. Set number of sites (2-10 supported)
3. Configure each site:
   - Site name and local network
   - Public endpoint and WireGuard port
4. Configure transfer subnet for inter-site communication
5. Enable advanced options as needed
6. Generate configuration

### Output Formats
- **WireGuard Config**: Standard WireGuard configuration files
- **MikroTik Script**: RouterOS-specific commands ready for copy/paste
- **QR Codes**: Mobile device import codes (Client-Server only)

## Configuration Examples

### Client-Server Example
```
Server: 10.0.0.1/24 (5 clients)
Subnet: 10.0.0.0/24
Clients: 10.0.0.2-6/24
```

### Site-to-Site Example
```
Site A: 192.168.1.0/24 ↔ Transfer Network: 10.2.2.0/24 ↔ Site B: 192.168.2.0/24
Site A WG IP: 10.2.2.1/24              Site B WG IP: 10.2.2.2/24
```

## Security Features

### Key Generation
- Uses WebCrypto API when available
- Fallback to secure random generation
- Proper Curve25519 key formatting
- Optional pre-shared key generation

### Network Security
- Automatic firewall rule generation
- Interface list integration
- Configurable allowed IPs
- NAT rule generation

## MikroTik RouterOS Compatibility

### Supported Versions
- RouterOS v7.0+ (WireGuard native support)
- RouterOS v7.19+ (Import functionality support)

### Generated Commands
```routeros
# Interface creation
/interface/wireguard add listen-port=51820 name=wireguard1

# IP address assignment
/ip/address add address=10.0.0.1/24 interface=wireguard1

# Peer configuration
/interface/wireguard/peers add allowed-address=10.0.0.2/32 interface=wireguard1 public-key="..."

# Firewall rules
/ip/firewall/filter add action=accept chain=input dst-port=51820 protocol=udp
/interface/list/member add interface=wireguard1 list=LAN

# NAT configuration
/ip/firewall/nat add action=masquerade chain=srcnat src-address=10.0.0.0/24
```

## Browser Compatibility

### Supported Browsers
- Chrome/Chromium 50+
- Firefox 52+
- Safari 11+
- Edge 79+

### Required Features
- WebCrypto API (for secure key generation)
- Canvas API (for QR code generation)
- ES6 Classes and async/await

## File Structure
```
/
├── index.html          # Main HTML interface
├── style.css          # Styling and responsive design
├── script.js          # Core JavaScript functionality
└── README.md          # This documentation
```

## Technical Implementation

### Key Generation Algorithm
1. Generate 32 random bytes using `crypto.getRandomValues()`
2. Apply Curve25519 clamping: `array[0] &= 248; array[31] &= 127; array[31] |= 64`
3. Base64 encode the result
4. Derive public key using WebCrypto API or fallback method

### Subnet Calculation
1. Parse server IP and CIDR
2. Calculate required host bits: `Math.ceil(Math.log2(totalHosts + 2))`
3. Determine new CIDR: `32 - hostBits`
4. Generate network address using bitwise operations

### QR Code Format
Standard WireGuard configuration format encoded as QR code for mobile import.

## Troubleshooting

### Common Issues
1. **Keys not generating**: Ensure HTTPS or localhost (WebCrypto requirement)
2. **QR codes not displaying**: Check QRCode.js library loading
3. **Invalid subnet calculation**: Verify server IP format (e.g., 10.0.0.1/24)

### Browser Console Errors
Check browser developer console for detailed error messages and troubleshooting information.

## Security Considerations

### Best Practices
- Always use HTTPS in production
- Never share private keys
- Regularly rotate keys for high-security environments
- Use pre-shared keys for additional security
- Implement proper firewall rules

### Network Security
- Configure appropriate allowed IPs
- Use specific subnets rather than 0.0.0.0/0 when possible
- Enable firewall rule generation
- Consider network segmentation

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style patterns
- Security best practices are maintained
- Cross-browser compatibility is preserved
- Documentation is updated for new features

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify RouterOS version compatibility
4. Test with different network configurations

---

**Note**: This configurator generates functional WireGuard configurations, but always test in a development environment before deploying to production networks.