# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based WireGuard VPN and LTE mobile configuration generator optimized for MikroTik RouterOS. The project generates:
- WireGuard configurations for client-server and site-to-site setups
- MikroTik RouterOS scripts for VPN and LTE configurations
- QR codes for mobile client import
- Comprehensive German LTE provider configurations

## Project Status

This project is in planning phase. The current codebase contains only documentation describing the intended features. No implementation exists yet.

## Planned Architecture

Based on the project requirements in ToDo.md, the application will include:

### WireGuard Configuration Module
- Client-server and site-to-site VPN configurations
- Automatic Curve25519 key generation using WebCrypto API
- IP subnet calculation and allocation
- QR code generation for mobile clients
- Individual RouterOS script generation per server/client/site

### LTE Configuration Module
- German mobile provider database (15+ providers including Telekom, Vodafone, O2)
- APN profile management with authentication settings
- RouterOS script generation for SIM PIN, APN profiles, routing, NAT, and firewall

### Technical Requirements
- Web-based responsive UI with navigation between WireGuard and LTE pages
- Copy-to-clipboard functionality for generated scripts
- Comprehensive tooltips for non-technical users
- Error handling and validation
- Debug tools for troubleshooting

## Development Notes

When implementing this project:
- All RouterOS commands must be validated against official MikroTik documentation
- Use WebCrypto API for secure key generation
- Implement proper subnet calculation for automatic IP allocation
- Include comprehensive German LTE provider database with accurate APN settings
- Ensure generated scripts include complete configuration (NAT, firewall, routing)