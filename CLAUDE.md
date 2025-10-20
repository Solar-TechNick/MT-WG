# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rule

**DON'T ASSUME - ALWAYS ASK QUESTIONS BEFORE IMPLEMENTING**

## Project Overview

Multi-platform WireGuard VPN and LTE mobile configuration generator. Pure client-side static web application (~5600 lines) generating professional configurations for **MikroTik RouterOS**, **VyOS**, and **OPNsense** with QR codes for mobile clients.

**Status**: Production-ready. Repository: https://github.com/Solar-TechNick/MT-WG

## Running & Testing

```bash
# No build step - pure static HTML/JS/CSS
# Requires HTTPS or localhost for WebCrypto API

python3 -m http.server 8080
# Then visit: http://localhost:8080

# Manual testing
open test-crypto.html    # Test key generation
```

**No automated tests exist** - all testing is manual.

## File Structure

```
/
├── index.html              # Main single-page app (32k lines, includes forms)
├── styles.css              # CSS variables-based theming (dark/light toggle)
├── components/             # HTML form components (loaded dynamically)
│   ├── wireguard-form.html
│   └── lte-form.html
└── js/
    ├── app.js              # Main controller, event handling, UI orchestration
    ├── wireguard.js        # Core WireGuard + multi-platform orchestrator
    ├── vyos.js             # VyOS configuration generator
    ├── opnsense.js         # OPNsense multi-format config generator
    ├── lte.js              # German LTE provider database (18+ providers)
    ├── crypto.js           # Curve25519 key generation (WebCrypto + fallback)
    ├── import-parser.js    # Config import parser (WireGuard & MikroTik)
    ├── qrcode.js           # QR code generation (primary)
    ├── qr-offline.js       # QR code fallback
    └── utils.js            # Validation, downloads, network calculations
```

## Architecture

### Component Communication Flow

```
User Input (index.html forms)
    ↓
WireGuardMikroTikApp (app.js) - Event listeners, validation
    ↓
WireGuardGenerator.generate(data) - Central orchestrator
    ↓ ↓ ↓
    ├→ MikroTik Script Generation (wireguard.js)
    ├→ VyOSGenerator.generate(data) (vyos.js)
    └→ OPNsenseGenerator.generate(data) (opnsense.js)
    ↓
4-Tab UI Display: WireGuard & QR | MikroTik | VyOS | OPNsense
```

**Critical Pattern**: All platform generators are **global singletons** initialized at page load:
- `window.VyOSGenerator = new VyOSGenerator();` ([vyos.js:395](js/vyos.js#L395))
- `window.OPNsenseGenerator = new OPNsenseGenerator();` ([opnsense.js:484](js/opnsense.js#L484))
- `window.WireGuardGenerator = new WireGuardGenerator();` ([wireguard.js:580](js/wireguard.js#L580))

### Multi-Platform Generation ([wireguard.js:56-95](js/wireguard.js#L56-L95))

Single configuration data object generates all platform outputs simultaneously:

```javascript
async generateClientServerConfigs(data) {
    // Base WireGuard configs
    const serverConfig = this.createServerConfig(data);
    const clientConfigs = await this.createClientConfigs(data);
    const mikrotikScript = this.createMikroTikClientServerScript(...);

    // Conditional platform generation
    let vyosConfigs = window.VyOSGenerator ?
        window.VyOSGenerator.generate(data) : [];
    let opnsenseConfigs = window.OPNsenseGenerator ?
        window.OPNsenseGenerator.generate(data) : [];

    return { wireguard, mikrotik, vyos, opnsense, qrCodes };
}
```

### Configuration Data Schema

All generators receive the same input structure:

```javascript
{
    type: 'client-server' | 'site-to-site',
    server: {
        name: string,
        ip: string,        // CIDR: "10.0.0.1/24"
        port: number,
        endpoint: string,  // domain:port or ip:port
        keys: { privateKey: string, publicKey: string }
    },
    clients: [{ name, ip, publicKey, privateKey, psk? }],  // client-server
    sites: [{ name, ip, localNetwork, endpoint, keys }],   // site-to-site
    interface: { name, mtu?, keepalive? },
    routing: { enableNat, enableFirewall, localNetwork?, routingTable? }
}
```

### Key Generation ([crypto.js](js/crypto.js))

1. **WebCrypto API** (primary): `crypto.getRandomValues()` → Curve25519 clamping → Base64
2. **Fallback**: Math.random() if unavailable (development only, warns user)
3. **Clamping**: `key[0] &= 248; key[31] &= 127; key[31] |= 64;`
4. **Public Key Derivation**: Simplified implementation - see [crypto.js:58-63](js/crypto.js#L58-L63) for production notes

**Security**: WebCrypto requires HTTPS or localhost. Browser support: Chrome 67+, Firefox 78+, Safari 14+, Edge 79+

## Platform Implementation Details

### VyOS ([vyos.js](js/vyos.js))
- **Syntax**: VyOS 1.5.x (modern IPv4 firewall with state policy)
- **Session Structure**: `configure` → set commands → `commit` → `save`
- **Key Management**: `generate wireguard named-keypairs <name>`
- **Firewall**: Creates `WG_IN` and `WG_LOCAL` rulesets with state tracking
- **NAT**: Source NAT with masquerading

### OPNsense ([opnsense.js](js/opnsense.js))
- **Multi-Format Output**: Web GUI steps + CLI commands + XML snippets
- **Prerequisites**: Requires `os-wireguard` plugin (System > Firmware > Plugins)
- **Structure**: VPN > WireGuard > Instances + Peers + Firewall
- **Client Configs**: Standard WireGuard `.conf` files

### MikroTik RouterOS ([wireguard.js](js/wireguard.js))
- **Format**: `.rsc` scripts with `/interface wireguard` commands
- **Features**: Address-lists, filter rules, NAT masquerade, routing tables

### LTE Configuration ([lte.js](js/lte.js))
- **Database**: 18+ German providers with accurate APN settings
- **Networks**: Telekom (6 variants), Vodafone (5), O2 (7)
- **Fields**: APN, auth (PAP/CHAP), IP type (ipv4/ipv6/dual), DNS toggle

## UI/UX Architecture

### Theme System ([styles.css](styles.css) + [app.js:564-592](js/app.js#L564-L592))
- **CSS Variables**: `--bg-color`, `--text-color`, `--accent-color`
- **Toggle**: `<html data-theme="dark|light">`
- **Persistence**: `localStorage.getItem('theme')`
- **Theme**: Dark navy (#0a192f) with blue accents (#64ffda)

### Download System ([app.js:888-1194](js/app.js#L888-L1194))
- **PDF**: jsPDF library, multi-platform PDF generation
- **ZIP**: JSZip library, QR codes + config files
- **Clipboard**: Individual + "Copy All Configurations"
- **Naming**: `WireGuard-{ServerName}-{YYYYMMDD-HHMMSS}.{ext}`

### QR Code System ([qrcode.js](js/qrcode.js) + [qr-offline.js](js/qr-offline.js))
- Two-tier fallback: QRCodeGenerator → SimpleQRCode
- Standard WireGuard mobile config format
- Previous rendering issues fixed by QRCodeWrapper implementation

### Configuration Import System ([import-parser.js](js/import-parser.js) + [app.js:1305-1491](js/app.js#L1305-L1491))
- **Formats Supported**: WireGuard `.conf` files, MikroTik `.rsc` scripts
- **Import Methods**: File upload or paste text
- **Workflow**: Parse → Preview → Apply to form fields
- **Detection**: Auto-detects format via regex patterns
- **Parsing**: Extracts server config, peers, interface settings, routing flags
- **Application**: Pre-fills form fields, enables manual key input if keys found
- **UI**: Import section at top of WireGuard page with preview/discard options

## Adding New Router Platforms

1. Create `js/<platform>.js` with class implementing `generate(data)` method
2. Return array of `{name: string, content: string}` objects
3. Register global singleton: `window.<Platform>Generator = new <Platform>Generator();`
4. Add conditional calls in [wireguard.js:56-95](js/wireguard.js#L56-L95) and [wireguard.js:102-131](js/wireguard.js#L102-L131)
5. Add output tab in [index.html](index.html) and display logic in [app.js](js/app.js) `displayConfigurations()`

## Known Limitations

1. **No automated tests** - manual testing only
2. **Public key derivation** - simplified implementation ([crypto.js:58-63](js/crypto.js#L58-L63))
3. **No backend** - 100% client-side, no persistence
4. **QR size limits** - large configs may exceed capacity
5. **Command validation** - verified against docs but not live-tested

## Documentation

- **MikroTik**: https://help.mikrotik.com/docs/display/ROS/WireGuard
- **VyOS 1.5.x**: https://docs.vyos.io/en/latest/configuration/interfaces/wireguard.html
- **OPNsense**: https://docs.opnsense.org/manual/vpnet.html#wireguard
- **WireGuard**: https://www.wireguard.com/protocol/
- **Curve25519**: https://cr.yp.to/ecdh.html