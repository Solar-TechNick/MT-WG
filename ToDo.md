ToDo

# WireGuard MikroTik Configurator - Project

## 🎯 Project Overview
A comprehensive web-based tool for generating WireGuard VPN and LTE mobile configurations optimized for MikroTik RouterOS.

1. ask questions
2. think harder

Please build a generator for Wirguard configuration
- configuation for Wireguard
- configuration for Mikrotik Router OS
- Working QR-code for mobile import
- LTE settings (for mikrotik RouterOS) all german    networks

features similar to https://ipv64.net/wireguard-config-generator

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
-  **Comprehensive German Provider Database**: 15+ providers with accurate APN settings
  - Deutsche Telekom (main, alternative, IPv6-only variants)
  - Vodafone (standard, GigaCube)
  - O2/Telefónica (contract, prepaid)
  - 1&1, ALDI TALK, congstar, otelo, mobilcom-debitel, klarmobil, drillisch, freenet
-  **Automatic Configuration**: Provider selection auto-fills APN, authentication, and profile names
-  **Multiple APN Profiles**: Configure multiple providers for failover or different connection types
-  **Authentication Handling**: Automatic username/password detection with visual indicators
-  **Complete RouterOS Scripts**: Generated scripts include SIM PIN, APN profiles, routing, NAT, and firewall rules

### 🛠️ Technical Features
-  **Validated RouterOS Commands**: All commands checked against official MikroTik documentation
-  **Manual Configuration Fields**: Interface names, PSK settings, local networks
-  **Professional UI**: Responsive design with navigation between WireGuard and LTE pages
-  **Comprehensive Tooltips**: User-friendly explanations for all fields and non-technical users
-  **Copy-to-Clipboard**: Easy script copying with visual feedback
-  **Error Handling**: Robust error handling with helpful user guidance
-  **Debug Tools**: Console commands for troubleshooting and testing

## 📱 Mobile Provider Database Details
| Provider | APN | Username | Password | Auth | Network |
|----------|-----|----------|----------|------|---------|
| Deutsche Telekom | internet.telekom | telekom | tm | CHAP | Telekom |
| Deutsche Telekom (Alt) | internet.t-mobile | - | - | CHAP | Telekom |
| Deutsche Telekom (IPv6) | internet.v6.telekom | telekom | tm | CHAP | Telekom |
| Vodafone | web.vodafone.de | - | - | CHAP | Vodafone |
| Vodafone GigaCube | home.vodafone.de | - | - | CHAP | Vodafone |
| O2 Contract | internet | - | - | PAP | O2 |
| O2 Prepaid | pinternet.interkom.de | - | - | PAP | O2 |
| 1&1 (Vodafone) | web.vodafone.de | - | - | CHAP | Vodafone |
| ALDI TALK | internet | - | - | PAP | O2 |
| congstar | internet.t-mobile | - | - | CHAP | Telekom |
| And 5+ more... | | | | | |
