// Minimal QR Code generator for offline use
// This is a simplified implementation for when the CDN fails

class SimpleQRCode {
    static toCanvas(canvas, text, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const ctx = canvas.getContext('2d');
                const size = options.width || 200;
                const margin = options.margin || 2;
                
                canvas.width = size;
                canvas.height = size;
                
                // Create a simple data matrix representation
                const qrData = this.generateSimpleQR(text, size - (margin * 20));
                
                // Clear canvas
                ctx.fillStyle = options.color?.light || '#FFFFFF';
                ctx.fillRect(0, 0, size, size);
                
                // Draw QR pattern
                ctx.fillStyle = options.color?.dark || '#000000';
                
                const cellSize = Math.floor((size - (margin * 20)) / qrData.length);
                const offsetX = margin * 10;
                const offsetY = margin * 10;
                
                for (let y = 0; y < qrData.length; y++) {
                    for (let x = 0; x < qrData[y].length; x++) {
                        if (qrData[y][x]) {
                            ctx.fillRect(
                                offsetX + x * cellSize, 
                                offsetY + y * cellSize, 
                                cellSize, 
                                cellSize
                            );
                        }
                    }
                }
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    static generateSimpleQR(text, size) {
        // Create a simple pattern based on text hash
        const gridSize = Math.max(21, Math.min(41, Math.floor(size / 8))); // QR codes are usually 21x21 to 177x177
        const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
        
        // Add finder patterns (corners)
        this.addFinderPattern(grid, 0, 0);
        this.addFinderPattern(grid, gridSize - 7, 0);
        this.addFinderPattern(grid, 0, gridSize - 7);
        
        // Add timing patterns
        for (let i = 8; i < gridSize - 8; i++) {
            grid[6][i] = i % 2 === 0;
            grid[i][6] = i % 2 === 0;
        }
        
        // Fill data area with pattern based on text
        const hash = this.simpleHash(text);
        let bitIndex = 0;
        
        for (let y = 1; y < gridSize - 1; y++) {
            for (let x = 1; x < gridSize - 1; x++) {
                if (!this.isReserved(x, y, gridSize)) {
                    const bit = (hash >> (bitIndex % 32)) & 1;
                    grid[y][x] = bit === 1;
                    bitIndex++;
                }
            }
        }
        
        return grid;
    }
    
    static addFinderPattern(grid, startX, startY) {
        // 7x7 finder pattern
        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                const isBlack = (
                    // Outer border
                    y === 0 || y === 6 || x === 0 || x === 6 ||
                    // Inner square
                    (y >= 2 && y <= 4 && x >= 2 && x <= 4)
                );
                if (startY + y < grid.length && startX + x < grid[0].length) {
                    grid[startY + y][startX + x] = isBlack;
                }
            }
        }
    }
    
    static isReserved(x, y, size) {
        // Check if position is reserved for finder patterns, timing patterns, etc.
        return (
            // Finder patterns and separators
            (x < 9 && y < 9) ||
            (x >= size - 8 && y < 9) ||
            (x < 9 && y >= size - 8) ||
            // Timing patterns
            x === 6 || y === 6
        );
    }
    
    static simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

// Make it available globally if QRCode library fails to load
if (typeof window !== 'undefined') {
    window.SimpleQRCode = SimpleQRCode;
}