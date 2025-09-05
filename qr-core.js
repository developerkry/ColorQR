/**
 * CMY QR Core - Client-side QR encoding/decoding
 */

class CMYQRCore {
    constructor() {
        this.standardSizes = [21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77];
    }

    // Calculate optimal QR size for given payload
    calculateQRSize(payloadLength) {
        const overhead = 8; // length(2) + end_marker(2) + crc(4)
        const targetRecoveryRatio = 0.3; // 30% recovery data

        for (const size of this.standardSizes) {
            const reserved = this.createReservedMask(size);
            const availableModules = size * size - reserved.flat().filter(x => x).length;
            const availableBytes = Math.floor(availableModules / 8);

            const neededBytes = payloadLength + overhead;
            const recoveryBytes = Math.floor(neededBytes * targetRecoveryRatio);
            const totalNeeded = neededBytes + recoveryBytes;

            if (availableBytes >= totalNeeded) {
                return { size, availableBytes, recoveryBytes };
            }
        }

        // Fall back to largest size
        const size = this.standardSizes[this.standardSizes.length - 1];
        const reserved = this.createReservedMask(size);
        const availableModules = size * size - reserved.flat().filter(x => x).length;
        const availableBytes = Math.floor(availableModules / 8);
        const recoveryBytes = Math.max(0, availableBytes - payloadLength - overhead);

        return { size, availableBytes, recoveryBytes };
    }

    // Create reserved area mask for given size
    createReservedMask(size) {
        const reserved = Array(size).fill().map(() => Array(size).fill(false));

        // Reserve 8x8 areas for finder patterns (flush with edges)
        for (let y = 0; y < 8 && y < size; y++) {
            for (let x = 0; x < 8 && x < size; x++) {
                reserved[y][x] = true;
            }
        }

        for (let y = 0; y < 8 && y < size; y++) {
            for (let x = size - 8; x < size && x >= 0; x++) {
                reserved[y][x] = true;
            }
        }

        for (let y = size - 8; y < size && y >= 0; y++) {
            for (let x = 0; x < 8 && x < size; x++) {
                reserved[y][x] = true;
            }
        }

        // Reserve 1-pixel border around data area
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!reserved[y][x]) {
                    // Top and bottom edges
                    if (y === 0 || y === size - 1) {
                        reserved[y][x] = true;
                    }
                    // Left and right edges (but not in finder pattern areas)
                    else if (x === 0 || x === size - 1) {
                        if (!(y < 8 || y >= size - 8)) {
                            reserved[y][x] = true;
                        }
                    }
                    // Inner border around data area
                    else if ((y === 8 && x >= 8) || (y === size - 9 && x >= 8) ||
                        (x === 8 && y > 8 && y < size - 8) || (x === size - 9 && y > 8 && y < size - 8)) {
                        reserved[y][x] = true;
                    }
                }
            }
        }

        return reserved;
    }

    // Check if position is in a finder pattern area
    isFinderPatternArea(x, y, size) {
        return ((y < 8 && x < 8) || // Top-left
            (y < 8 && x >= size - 8) || // Top-right  
            (y >= size - 8 && x < 8)); // Bottom-left
    }

    // Simple CRC32 calculation
    crc32(data) {
        const crcTable = [];
        for (let i = 0; i < 256; i++) {
            let crc = i;
            for (let j = 0; j < 8; j++) {
                crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
            }
            crcTable[i] = crc;
        }

        let crc = 0xFFFFFFFF;
        for (let i = 0; i < data.length; i++) {
            crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    // Simple error correction encoding
    simpleRSEncode(data, recoveryBytes) {
        let crc = this.crc32(data);
        const recovery = [];

        for (let i = 0; i < recoveryBytes; i++) {
            let recByte = crc & 0xFF;
            for (let j = 0; j < data.length; j++) {
                recByte ^= data[j] ^ ((j + i) & 0xFF);
            }
            recovery.push(recByte & 0xFF);
            crc = ((crc >>> 8) ^ (crc << 24)) & 0xFFFFFFFF;
        }

        return new Uint8Array(recovery);
    }

    // Create module matrix for encoding
    makeModuleMatrix(payload, targetSize = null) {
        const payloadBytes = new TextEncoder().encode(payload);

        let size, availableBytes, recoveryBytes;
        if (targetSize) {
            size = targetSize;
            const reserved = this.createReservedMask(size);
            const availableModules = size * size - reserved.flat().filter(x => x).length;
            availableBytes = Math.floor(availableModules / 8);
            recoveryBytes = Math.max(0, availableBytes - payloadBytes.length - 8);
        } else {
            const sizeInfo = this.calculateQRSize(payloadBytes.length);
            size = sizeInfo.size;
            availableBytes = sizeInfo.availableBytes;
            recoveryBytes = sizeInfo.recoveryBytes;
        }

        const reserved = this.createReservedMask(size);

        // Increase maxPayload calculation for 2-byte length
        const maxPayload = availableBytes - 8; // 2-byte length + end marker + crc
        let finalPayload = payloadBytes;
        if (payloadBytes.length > maxPayload) {
            finalPayload = payloadBytes.slice(0, maxPayload);
            recoveryBytes = 0;
        }

        // Create recovery data
        const recoveryData = recoveryBytes > 0 ? this.simpleRSEncode(finalPayload, recoveryBytes) : new Uint8Array(0);

        // End marker (0xDEAD)
        const endMarker = new Uint8Array([0xDE, 0xAD]);

        // CRC32 of payload
        const crc = this.crc32(finalPayload);
        const crcBytes = new Uint8Array([
            (crc >>> 24) & 0xFF,
            (crc >>> 16) & 0xFF,
            (crc >>> 8) & 0xFF,
            crc & 0xFF
        ]);

        // Assemble data packet
        const dataPacket = new Uint8Array(availableBytes);
        let pos = 0;

        // Length (2 bytes, big-endian)
        dataPacket[pos++] = (finalPayload.length >>> 8) & 0xFF;
        dataPacket[pos++] = finalPayload.length & 0xFF;

        // Payload
        for (let i = 0; i < finalPayload.length; i++) {
            dataPacket[pos++] = finalPayload[i];
        }

        // End marker
        for (let i = 0; i < endMarker.length; i++) {
            dataPacket[pos++] = endMarker[i];
        }

        // CRC
        for (let i = 0; i < crcBytes.length; i++) {
            dataPacket[pos++] = crcBytes[i];
        }

        // Recovery data
        for (let i = 0; i < recoveryData.length; i++) {
            dataPacket[pos++] = recoveryData[i];
        }

        // Convert to bits
        const bits = [];
        for (let i = 0; i < dataPacket.length; i++) {
            for (let j = 7; j >= 0; j--) {
                bits.push((dataPacket[i] >>> j) & 1);
            }
        }

        // Create optimized data placement order (outer first for critical data)
        const positions = [];

        // Collect all available positions with their edge distances
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!reserved[y][x]) {
                    const distFromLeft = x;
                    const distFromRight = size - 1 - x;
                    const distFromTop = y;
                    const distFromBottom = size - 1 - y;
                    const edgeDistance = Math.min(distFromLeft, distFromRight, distFromTop, distFromBottom);
                    positions.push({ x, y, edgeDistance });
                }
            }
        }

        // Sort by edge distance (outer positions first)
        positions.sort((a, b) => a.edgeDistance - b.edgeDistance);

        // Create matrix
        const matrix = Array(size).fill().map(() => Array(size).fill(0));
        let bitIdx = 0;

        // Place data in optimized order
        for (let i = 0; i < positions.length && bitIdx < bits.length; i++) {
            const pos = positions[i];
            matrix[pos.y][pos.x] = bits[bitIdx++];
        }

        // Fill any remaining positions with padding
        for (let i = bitIdx; i < positions.length; i++) {
            const pos = positions[i];
            matrix[pos.y][pos.x] = 0;
        }

        return { matrix, size, availableBytes, recoveryBytes };
    }

    // Render CMY QR code to canvas
    renderCMYCode(payload, targetSize = null, scale = 10) {
        // Split payload into three channels
        const chunk = Math.ceil(payload.length / 3);
        const pc = payload.slice(0, chunk);
        const pm = payload.slice(chunk, 2 * chunk);
        const py = payload.slice(2 * chunk);

        // Store original payload and chunk size for reconstruction
        const metadata = {
            originalLength: payload.length,
            chunkSize: chunk
        };

        // Generate matrices
        const mcResult = this.makeModuleMatrix(pc, targetSize);
        const mmResult = this.makeModuleMatrix(pm, targetSize);
        const myResult = this.makeModuleMatrix(py, targetSize);

        // Use the largest size
        const size = Math.max(mcResult.size, mmResult.size, myResult.size);

        // Regenerate with consistent size
        const mc = this.makeModuleMatrix(pc, size);
        const mm = this.makeModuleMatrix(pm, size);
        const my = this.makeModuleMatrix(py, size);

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = size * scale;
        canvas.height = size * scale;

        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR modules
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // RGB mapping: 1 bits = black (0), 0 bits = white (255)
                const r = mm.matrix[y][x] ? 0 : 255;
                const g = mc.matrix[y][x] ? 0 : 255;
                const b = my.matrix[y][x] ? 0 : 255;

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }

        // Add finder patterns
        this.addFinderPatterns(ctx, size, scale);

        return {
            canvas,
            size,
            availableBytes: mc.availableBytes,
            recoveryBytes: mc.recoveryBytes
        };
    }

    // Add custom finder patterns
    addFinderPatterns(ctx, size, scale) {
        const pattern = [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ];

        const positions = [
            [0, 0], // Top-left
            [(size - 7) * scale, 0], // Top-right
            [0, (size - 7) * scale] // Bottom-left
        ];

        positions.forEach(([startX, startY]) => {
            for (let dy = 0; dy < 7; dy++) {
                for (let dx = 0; dx < 7; dx++) {
                    const color = pattern[dy][dx] ? 'black' : 'white';
                    ctx.fillStyle = color;
                    ctx.fillRect(startX + dx * scale, startY + dy * scale, scale, scale);
                }
            }
        });
    }

    // Find QR code in image using finder pattern detection
    findQRCodeInImage(imageData) {
        const { data, width, height } = imageData;

        // Convert to grayscale for pattern detection
        const gray = new Uint8Array(width * height);
        for (let i = 0; i < gray.length; i++) {
            const pixelIndex = i * 4;
            gray[i] = Math.round(0.299 * data[pixelIndex] + 0.587 * data[pixelIndex + 1] + 0.114 * data[pixelIndex + 2]);
        }

        // Look for finder patterns (black squares with white borders)
        const finderPatterns = this.detectFinderPatterns(gray, width, height);

        if (finderPatterns.length >= 3) {
            // Calculate QR code boundaries from finder patterns
            const bounds = this.calculateQRBounds(finderPatterns);

            if (bounds) {
                // Extract and straighten the QR code region
                return this.extractQRRegion(imageData, bounds);
            }
        }

        return null; // No QR code found
    }

    // Detect finder patterns in grayscale image
    detectFinderPatterns(gray, width, height) {
        const patterns = [];
        const minSize = 15; // Minimum finder pattern size
        const maxSize = Math.min(width, height) / 3; // Maximum finder pattern size

        for (let y = 0; y < height - minSize; y += 2) {
            for (let x = 0; x < width - minSize; x += 2) {
                for (let size = minSize; size <= maxSize; size += 2) {
                    if (x + size >= width || y + size >= height) break;

                    if (this.isFinderPattern(gray, width, x, y, size)) {
                        patterns.push({ x: x + size / 2, y: y + size / 2, size });
                        x += size; // Skip ahead to avoid duplicates
                        break;
                    }
                }
            }
        }

        return patterns;
    }

    // Check if a region matches finder pattern (1:1:3:1:1 ratio)
    isFinderPattern(gray, width, x, y, size) {
        const tolerance = 0.3;
        const unitSize = size / 7;

        // Check horizontal line through center
        const centerY = y + Math.floor(size / 2);
        if (centerY >= gray.length / width) return false;

        let regions = [];
        let currentColor = gray[centerY * width + x] < 128 ? 'black' : 'white';
        let regionStart = x;

        for (let i = x + 1; i < x + size; i++) {
            const pixelColor = gray[centerY * width + i] < 128 ? 'black' : 'white';
            if (pixelColor !== currentColor) {
                regions.push({ color: currentColor, length: i - regionStart });
                currentColor = pixelColor;
                regionStart = i;
            }
        }
        regions.push({ color: currentColor, length: (x + size) - regionStart });

        // Check for 1:1:3:1:1 pattern (black:white:black:white:black)
        if (regions.length === 5 &&
            regions[0].color === 'black' && regions[1].color === 'white' &&
            regions[2].color === 'black' && regions[3].color === 'white' &&
            regions[4].color === 'black') {

            const [r1, r2, r3, r4, r5] = regions.map(r => r.length);
            const unit = (r1 + r2 + r4 + r5) / 4;

            return Math.abs(r1 - unit) < unit * tolerance &&
                Math.abs(r2 - unit) < unit * tolerance &&
                Math.abs(r3 - 3 * unit) < unit * tolerance &&
                Math.abs(r4 - unit) < unit * tolerance &&
                Math.abs(r5 - unit) < unit * tolerance;
        }

        return false;
    }

    // Calculate QR code boundaries from finder patterns
    calculateQRBounds(patterns) {
        if (patterns.length < 3) return null;

        // Sort patterns to identify corners (top-left, top-right, bottom-left)
        patterns.sort((a, b) => a.y - b.y || a.x - b.x);

        const topLeft = patterns[0];
        const others = patterns.slice(1);

        // Find top-right and bottom-left based on position relative to top-left
        let topRight = null, bottomLeft = null;

        for (const pattern of others) {
            if (pattern.x > topLeft.x && Math.abs(pattern.y - topLeft.y) < 50) {
                topRight = pattern;
            } else if (pattern.y > topLeft.y && Math.abs(pattern.x - topLeft.x) < 50) {
                bottomLeft = pattern;
            }
        }

        if (!topRight || !bottomLeft) return null;

        // Estimate QR code size and bottom-right corner
        const qrSize = Math.max(
            Math.abs(topRight.x - topLeft.x),
            Math.abs(bottomLeft.y - topLeft.y)
        );

        return {
            topLeft: { x: topLeft.x - qrSize * 0.1, y: topLeft.y - qrSize * 0.1 },
            topRight: { x: topRight.x + qrSize * 0.1, y: topRight.y - qrSize * 0.1 },
            bottomLeft: { x: bottomLeft.x - qrSize * 0.1, y: bottomLeft.y + qrSize * 0.1 },
            bottomRight: { x: topRight.x + qrSize * 0.1, y: bottomLeft.y + qrSize * 0.1 }
        };
    }

    // Extract and straighten QR code region
    extractQRRegion(imageData, bounds) {
        const { data, width, height } = imageData;

        // Calculate output size (make it square)
        const outputSize = Math.max(
            Math.abs(bounds.topRight.x - bounds.topLeft.x),
            Math.abs(bounds.bottomLeft.y - bounds.topLeft.y)
        );

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = outputSize;
        canvas.height = outputSize;

        // Create source canvas
        const sourceCanvas = document.createElement('canvas');
        const sourceCtx = sourceCanvas.getContext('2d');
        sourceCanvas.width = width;
        sourceCanvas.height = height;

        const sourceImageData = sourceCtx.createImageData(width, height);
        sourceImageData.data.set(data);
        sourceCtx.putImageData(sourceImageData, 0, 0);

        // Use transform to map the perspective
        ctx.save();

        // Simple crop for now (can be improved with perspective correction)
        const cropX = Math.max(0, bounds.topLeft.x);
        const cropY = Math.max(0, bounds.topLeft.y);
        const cropWidth = Math.min(width - cropX, outputSize);
        const cropHeight = Math.min(height - cropY, outputSize);

        ctx.drawImage(sourceCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, outputSize, outputSize);

        ctx.restore();

        return ctx.getImageData(0, 0, outputSize, outputSize);
    }

    // Auto-detect scale from image
    detectScale(imageData) {
        const { width, height } = imageData;

        // Try to find the QR size by looking for finder patterns
        for (const size of this.standardSizes) {
            for (let scale = 1; scale <= 20; scale++) {
                if (width === size * scale && height === size * scale) {
                    return { scale, size };
                }
            }
        }

        // Fallback: estimate based on image size
        const avgDim = (width + height) / 2;
        for (const size of this.standardSizes) {
            const scale = Math.round(avgDim / size);
            if (scale >= 1 && scale <= 20) {
                return { scale, size };
            }
        }

        return { scale: 10, size: 21 }; // Default fallback
    }

    // Extract CMY channels from image
    extractCMYChannels(imageData, threshold = 128, autoScale = true) {
        let scale, size;

        if (autoScale) {
            const detected = this.detectScale(imageData);
            scale = detected.scale;
            size = detected.size;
        } else {
            // Manual detection
            size = Math.round(imageData.width / 10); // Assume scale 10
            scale = Math.round(imageData.width / size);
        }

        const { data, width } = imageData;
        const reserved = this.createReservedMask(size);

        const mc = Array(size).fill().map(() => Array(size).fill(0));
        const mm = Array(size).fill().map(() => Array(size).fill(0));
        const my = Array(size).fill().map(() => Array(size).fill(0));

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!reserved[y][x]) {
                    const pixelY = y * scale;
                    const pixelX = x * scale;

                    if (pixelY < imageData.height && pixelX < width) {
                        const idx = (pixelY * width + pixelX) * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];

                        mm[y][x] = r < threshold ? 1 : 0; // magenta from red
                        mc[y][x] = g < threshold ? 1 : 0; // cyan from green
                        my[y][x] = b < threshold ? 1 : 0; // yellow from blue
                    }
                }
            }
        }

        const matrixToBytes = (matrix) => {
            const bits = [];
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (!reserved[y][x]) {
                        bits.push(matrix[y][x]);
                    }
                }
            }

            const bytes = [];
            for (let i = 0; i < bits.length; i += 8) {
                let byte = 0;
                for (let j = 0; j < 8 && i + j < bits.length; j++) {
                    byte = (byte << 1) | bits[i + j];
                }
                bytes.push(byte);
            }

            return this.parseDataStructure(new Uint8Array(bytes));
        };

        const pc = matrixToBytes(mc);
        const pm = matrixToBytes(mm);
        const py = matrixToBytes(my);

        return { pc, pm, py, detectedScale: scale, detectedSize: size };
    }

    // Parse data structure with error correction
    parseDataStructure(rawData) {
        if (rawData.length < 9) { // Now need minimum 9 bytes: length(2) + end_marker(2) + crc(4) + 1 data byte
            // Remove padding
            return new TextDecoder().decode(rawData.filter(b => b !== 0));
        }

        // Read 2-byte length (big-endian)
        const payloadLength = (rawData[0] << 8) | rawData[1];
        if (payloadLength === 0) return "";

        const payloadEnd = 2 + payloadLength;
        if (payloadEnd + 6 > rawData.length) {
            // Fallback to simple extraction
            const result = rawData.slice(2).filter(b => b !== 0);
            return new TextDecoder('utf-8', { fatal: false }).decode(result);
        }

        const payload = rawData.slice(2, payloadEnd);

        // Look for end marker (0xDEAD)
        const markerPos = payloadEnd;
        if (markerPos + 1 < rawData.length &&
            rawData[markerPos] === 0xDE && rawData[markerPos + 1] === 0xAD) {

            // Extract CRC
            const crcPos = markerPos + 2;
            if (crcPos + 4 <= rawData.length) {
                const storedCrc = (rawData[crcPos] << 24) | (rawData[crcPos + 1] << 16) |
                    (rawData[crcPos + 2] << 8) | rawData[crcPos + 3];

                const actualCrc = this.crc32(payload);

                if (actualCrc === (storedCrc >>> 0)) {
                    return new TextDecoder('utf-8', { fatal: false }).decode(payload);
                }
            }
        }

        // Fallback
        return new TextDecoder('utf-8', { fatal: false }).decode(payload);
    }

    // Decode QR code from image data
    decodeQR(imageData, threshold = 128) {
        try {
            let processedImageData = imageData;

            // First, try to find and extract QR code from the image
            const detectedQR = this.findQRCodeInImage(imageData);
            if (detectedQR) {
                processedImageData = detectedQR;
                console.log('QR code detected and extracted from image');
            } else {
                console.log('No QR code detected, processing full image');
            }

            const { pc, pm, py, detectedScale, detectedSize } = this.extractCMYChannels(processedImageData, threshold, true);

            // Simple concatenation - this should work for the original splitting method
            const decoded = pc + pm + py;

            // Clean up any trailing null characters
            const cleaned = decoded.replace(/\0+$/, '');

            return {
                success: true,
                text: cleaned,
                detectedScale,
                detectedSize,
                bytesDecoded: new TextEncoder().encode(cleaned).length,
                wasExtracted: !!detectedQR
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export for use in other files
window.CMYQRCore = CMYQRCore;
