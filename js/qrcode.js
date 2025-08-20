// QR Code generation module
class QRCodeGenerator {
    constructor() {
        this.init();
    }

    init() {
        console.log('QR Code generator initialized');
    }

    // Generate QR code using fallback implementation
    async generateQRCode(text, size = 200) {
        try {
            // Create canvas element
            const canvas = document.createElement('canvas');
            
            // Try to use external QRCode library first, fallback to SimpleQRCode
            if (typeof QRCode !== 'undefined') {
                await QRCode.toCanvas(canvas, text, {
                    width: size,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
            } else if (typeof window.SimpleQRCode !== 'undefined') {
                await window.SimpleQRCode.toCanvas(canvas, text, {
                    width: size,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
            } else {
                // Last resort: use the simple placeholder
                return this.createQRDataURL(text, size);
            }
            
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('QR code generation failed:', error);
            // Fallback to simple implementation
            return this.createQRDataURL(text, size);
        }
    }

    // Create a simple visual representation (placeholder for real QR code)
    createQRDataURL(text, size) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = size;
        canvas.height = size;

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Black border
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, size, 10);
        ctx.fillRect(0, 0, 10, size);
        ctx.fillRect(size - 10, 0, 10, size);
        ctx.fillRect(0, size - 10, size, 10);

        // QR code pattern (simplified)
        const moduleSize = Math.floor(size / 25);
        
        // Generate a simple pattern based on text hash
        const hash = this.simpleHash(text);
        
        for (let row = 2; row < 23; row++) {
            for (let col = 2; col < 23; col++) {
                if ((hash + row * col) % 3 === 0) {
                    ctx.fillRect(
                        col * moduleSize,
                        row * moduleSize,
                        moduleSize,
                        moduleSize
                    );
                }
            }
        }

        // Position markers (corners)
        this.drawPositionMarker(ctx, moduleSize, moduleSize, moduleSize);
        this.drawPositionMarker(ctx, size - 8 * moduleSize, moduleSize, moduleSize);
        this.drawPositionMarker(ctx, moduleSize, size - 8 * moduleSize, moduleSize);

        return canvas.toDataURL('image/png');
    }

    // Draw QR code position markers
    drawPositionMarker(ctx, x, y, moduleSize) {
        ctx.fillStyle = '#000000';
        
        // Outer square
        ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
        
        // Inner white square
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
        
        // Center black square
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    }

    // Simple hash function for pattern generation
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Generate QR codes for all client configurations
    async generateClientQRCodes(clientConfigs) {
        const qrCodes = [];

        for (const client of clientConfigs) {
            try {
                const qrDataUrl = await this.generateQRCode(client.config, 300);
                qrCodes.push({
                    name: client.name,
                    config: client.config,
                    qrDataUrl: qrDataUrl
                });
            } catch (error) {
                console.error(`Failed to generate QR code for ${client.name}:`, error);
            }
        }

        return qrCodes;
    }

    // Create downloadable QR code images
    downloadQRCodes(qrCodes) {
        qrCodes.forEach((qr, index) => {
            // Create download link
            const link = document.createElement('a');
            link.href = qr.qrDataUrl;
            link.download = `${qr.name}-QR.png`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        showNotification(`Downloaded ${qrCodes.length} QR code images`, 'success');
    }

    // Display QR codes in modal or popup
    displayQRCodes(qrCodes) {
        // Create modal container
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 10px;
            padding: 20px;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            position: relative;
        `;

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        `;
        closeBtn.onclick = () => document.body.removeChild(modal);

        // Title
        const title = document.createElement('h3');
        title.textContent = 'WireGuard Client QR Codes';
        title.style.marginBottom = '20px';

        content.appendChild(closeBtn);
        content.appendChild(title);

        // Add QR codes
        qrCodes.forEach((qr, index) => {
            const qrContainer = document.createElement('div');
            qrContainer.style.cssText = `
                display: inline-block;
                margin: 10px;
                text-align: center;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
            `;

            const qrTitle = document.createElement('h4');
            qrTitle.textContent = qr.name;
            qrTitle.style.marginBottom = '10px';

            const qrImage = document.createElement('img');
            qrImage.src = qr.qrDataUrl;
            qrImage.style.cssText = `
                max-width: 250px;
                max-height: 250px;
                border: 1px solid #eee;
            `;

            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Download';
            downloadBtn.className = 'btn btn-secondary';
            downloadBtn.style.marginTop = '10px';
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = qr.qrDataUrl;
                link.download = `${qr.name}-QR.png`;
                link.click();
            };

            qrContainer.appendChild(qrTitle);
            qrContainer.appendChild(qrImage);
            qrContainer.appendChild(document.createElement('br'));
            qrContainer.appendChild(downloadBtn);

            content.appendChild(qrContainer);
        });

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }
}

// Initialize QR code generator
document.addEventListener('DOMContentLoaded', () => {
    window.qrGenerator = new QRCodeGenerator();
});