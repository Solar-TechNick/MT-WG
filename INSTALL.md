# Installation Guide - WireGuard MikroTik Configurator

## Quick Start

1. **Download or Clone**
   ```bash
   git clone https://github.com/Solar-TechNick/MT-WG.git
   cd MT-WG
   ```

2. **Open in Browser**
   - Open `index.html` in any modern web browser
   - No server setup required - runs entirely in your browser

## WireGuard Configuration Steps

### Client-Server VPN Setup

1. **Configure Server**
   - Enter server name and public endpoint (domain or IP)
   - Set VPN network (e.g., `10.0.0.1/24`)
   - Choose number of clients
   - Configure advanced options as needed

2. **Generate Configuration**
   - Click "Generate Configuration"
   - Server script will be generated for RouterOS
   - Client `.conf` files will be created

3. **Deploy on MikroTik**
   ```bash
   # Copy the generated RouterOS script
   # Paste into MikroTik terminal or upload as .rsc file
   /import file-name=WireGuard-Server.rsc
   ```

4. **Setup Mobile Clients**
   - Click "Download QR Codes" 
   - Scan QR codes with WireGuard app
   - Or download `.conf` files directly

### Site-to-Site VPN Setup

1. **Select Site-to-Site Mode**
   - Choose "Site-to-Site VPN" option
   - Enter number of sites to connect

2. **Configure Networks**
   - Each site gets its own subnet automatically
   - Modify endpoints for each site

3. **Deploy Scripts**
   - Each site gets its own RouterOS script
   - Deploy on respective MikroTik routers

## LTE Configuration Steps

1. **Select Provider**
   - Choose from 15+ German mobile providers
   - APN settings auto-populate

2. **Configure Interface**
   - Set SIM PIN if required
   - Configure interface name and options

3. **Generate Script**
   - Complete RouterOS script generated
   - Includes APN profiles, routing, NAT, firewall

4. **Deploy on MikroTik**
   ```bash
   # Upload and import the LTE script
   /import file-name=LTE-Config.rsc
   ```

## Advanced Features

### Custom DNS Servers
- Configure custom DNS servers for VPN clients
- Default: Cloudflare (1.1.1.1) and Google (8.8.8.8)

### IPv6 Support
- Enable IPv6 alongside IPv4
- Automatic IPv6 subnet generation

### Routing Tables
- Specify custom RouterOS routing tables
- Advanced traffic routing control

### File Downloads
- Download individual `.conf` files
- Download RouterOS `.rsc` scripts
- Batch download all configurations

## Browser Requirements

- **Chrome/Chromium**: 67+
- **Firefox**: 78+
- **Safari**: 14+
- **Edge**: 79+

Requires WebCrypto API support for secure key generation.

## Security Features

- **Client-side key generation** using WebCrypto API
- **No external data transmission** - everything runs locally
- **Secure random number generation** for cryptographic keys
- **Pre-shared keys** for additional security layer

## Troubleshooting

### Common Issues

1. **Keys not generating**
   - Ensure browser supports WebCrypto API
   - Try using HTTPS or localhost
   - Check browser console for errors

2. **QR codes not working**
   - Regenerate configuration first
   - Ensure client-server mode is selected
   - Try downloading .conf files instead

3. **RouterOS scripts failing**
   - Check MikroTik firmware version
   - Verify interface names don't conflict
   - Import scripts step by step if needed

### Debug Mode

Open browser console (F12) to see detailed logging:
- Key generation process
- Configuration validation
- Error messages and troubleshooting

## Support

- **GitHub Issues**: https://github.com/Solar-TechNick/MT-WG/issues
- **MikroTik Documentation**: https://help.mikrotik.com/
- **WireGuard Documentation**: https://www.wireguard.com/

## License

MIT License - feel free to modify and distribute.