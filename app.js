/**
 * CMY QR Application - Main UI Logic
 */

class CMYQRApp {
    constructor() {
        this.qrCore = new CMYQRCore();
        this.selectedFile = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Auto-generate filename from text input
        document.getElementById('textInput').addEventListener('input', (e) => {
            this.updateFilenameFromText(e.target.value);
        });

        // Drag and drop support
        this.setupDragAndDrop();
    }

    updateFilenameFromText(text) {
        // Auto-generate filename based on content
        // This is just for UX, not used in static version
    }

    setupDragAndDrop() {
        const fileInput = document.querySelector('.form-file');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileInput.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            fileInput.addEventListener(eventName, () => {
                fileInput.style.borderColor = 'var(--accent)';
                fileInput.style.background = 'rgba(59, 130, 246, 0.1)';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileInput.addEventListener(eventName, () => {
                fileInput.style.borderColor = 'var(--border)';
                fileInput.style.background = 'var(--bg-tertiary)';
            });
        });

        fileInput.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('fileInput').files = files;
                handleFileSelect({ target: { files } });
            }
        });
    }

    showLoading(elementId, show = true) {
        const element = document.getElementById(elementId);
        element.style.display = show ? 'block' : 'none';
    }

    hideResult(elementId) {
        document.getElementById(elementId).style.display = 'none';
    }

    showResult(elementId, content, type = 'success') {
        const element = document.getElementById(elementId);
        element.innerHTML = content;
        element.className = `result ${type}`;
        element.style.display = 'block';
    }

    // Convert threshold number to human-readable text
    getThresholdText(value) {
        if (value < 85) return 'Very Low';
        if (value < 110) return 'Low';
        if (value < 145) return 'Medium';
        if (value < 170) return 'High';
        return 'Very High';
    }

    // Encode QR Code
    async encodeQR() {
        const text = document.getElementById('textInput').value.trim();
        const sizeSelect = document.getElementById('qrSizeSelect').value;
        
        if (!text) {
            this.showResult('encodeResult', `
                <div class="result-title">⚠️ Input Required</div>
                <div class="result-content">Please enter some text or URL to encode.</div>
            `, 'error');
            return;
        }
        
        if (text.length > 1000) {
            this.showResult('encodeResult', `
                <div class="result-title">⚠️ Text Too Long</div>
                <div class="result-content">Please keep your text under 1000 characters. Current length: ${text.length}</div>
            `, 'error');
            return;
        }
        
        this.showLoading('encodeLoading', true);
        this.hideResult('encodeResult');
        
        try {
            // Simulate async operation for better UX
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const targetSize = sizeSelect === 'auto' ? null : parseInt(sizeSelect);
            const result = this.qrCore.renderCMYCode(text, targetSize, 10);
            
            // Convert canvas to data URL
            const dataUrl = result.canvas.toDataURL('image/png');
            
            // Generate filename with random code
            const randomCode = this.generateRandomCode();
            const filename = `ColorQR_${randomCode}.png`;
            
            // Detect if URL
            const isUrl = text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.');
            
            const content = `
                <div class="result-title">✅ QR Code Generated Successfully!</div>
                <div class="result-content">
                    <p><strong>Content:</strong> ${this.escapeHtml(text.substring(0, 100))}${text.length > 100 ? '...' : ''}</p>
                    
                    <div class="qr-info">
                        <div class="qr-stat">
                            <span class="qr-stat-value">${result.size}×${result.size}</span>
                            <span class="qr-stat-label">QR Size</span>
                        </div>
                        <div class="qr-stat">
                            <span class="qr-stat-value">${result.availableBytes}</span>
                            <span class="qr-stat-label">Bytes/Channel</span>
                        </div>
                        <div class="qr-stat">
                            <span class="qr-stat-value">${result.recoveryBytes}</span>
                            <span class="qr-stat-label">Recovery Data</span>
                        </div>
                        <div class="qr-stat">
                            <span class="qr-stat-value">${Math.round(result.recoveryBytes / result.availableBytes * 100)}%</span>
                            <span class="qr-stat-label">Error Protection</span>
                        </div>
                    </div>
                    
                    <div class="qr-display">
                        <img src="${dataUrl}" alt="Generated CMY QR Code" class="qr-image">
                        <div style="margin-top: 1rem;">
                            <a href="${dataUrl}" download="${filename}" class="btn">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px;">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                                </svg>
                                Download QR Code
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            this.showResult('encodeResult', content, 'success');
            
        } catch (error) {
            console.error('Encoding error:', error);
            this.showResult('encodeResult', `
                <div class="result-title">❌ Generation Failed</div>
                <div class="result-content">Error: ${error.message}</div>
            `, 'error');
        } finally {
            this.showLoading('encodeLoading', false);
        }
    }

    // Decode QR Code
    async decodeQR() {
        if (!this.selectedFile) {
            this.showResult('decodeResult', `
                <div class="result-title">⚠️ No File Selected</div>
                <div class="result-content">Please select a CMY QR code image to decode.</div>
            `, 'error');
            return;
        }
        
        const threshold = parseInt(document.getElementById('thresholdInput').value);
        
        this.showLoading('decodeLoading', true);
        this.hideResult('decodeResult');
        
        try {
            const imageData = await this.loadImageData(this.selectedFile);
            const result = this.qrCore.decodeQR(imageData, threshold);
            
            if (result.success) {
                const isUrl = result.text.startsWith('http://') || result.text.startsWith('https://') || result.text.startsWith('www.');
                const linkHtml = isUrl ? `<br><a href="${result.text}" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: none;">→ Open Link</a>` : '';
                
                // Show extraction status
                const extractionStatus = result.wasExtracted ? 
                    '<p style="color: var(--accent); font-size: 0.9rem; margin-bottom: 0.5rem;">🔍 QR code automatically detected and extracted from image</p>' : 
                    '';
                
                const content = `
                    <div class="result-title">✅ QR Code Read Successfully!</div>
                    <div class="result-content">
                        ${extractionStatus}
                        <div style="background: var(--bg-primary); padding: 1rem; border-radius: 6px; border: 1px solid var(--border); margin: 1rem 0; word-break: break-all;">
                            <strong>${this.escapeHtml(result.text)}</strong>
                            ${linkHtml}
                        </div>
                        
                        <div class="qr-info">
                            <div class="qr-stat">
                                <span class="qr-stat-value">${result.detectedSize}×${result.detectedSize}</span>
                                <span class="qr-stat-label">Detected Size</span>
                            </div>
                            <div class="qr-stat">
                                <span class="qr-stat-value">${result.detectedScale}x</span>
                                <span class="qr-stat-label">Auto Scale</span>
                            </div>
                            <div class="qr-stat">
                                <span class="qr-stat-value">${result.bytesDecoded}</span>
                                <span class="qr-stat-label">Bytes Decoded</span>
                            </div>
                            <div class="qr-stat">
                                <span class="qr-stat-value">${this.getThresholdText(threshold)}</span>
                                <span class="qr-stat-label">Sensitivity</span>
                            </div>
                        </div>
                    </div>
                `;
                
                this.showResult('decodeResult', content, 'success');
            } else {
                this.showResult('decodeResult', `
                    <div class="result-title">❌ Could Not Read QR Code</div>
                    <div class="result-content">
                        <p>Error: ${result.error}</p>
                        <p style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">
                            Try adjusting the detection sensitivity or use the quality test feature.
                        </p>
                    </div>
                `, 'error');
            }
            
        } catch (error) {
            console.error('Decoding error:', error);
            this.showResult('decodeResult', `
                <div class="result-title">❌ Decoding Failed</div>
                <div class="result-content">Error: ${error.message}</div>
            `, 'error');
        } finally {
            this.showLoading('decodeLoading', false);
        }
    }

    // Test robustness with multiple thresholds
    async testRobustness() {
        if (!this.selectedFile) {
            this.showResult('decodeResult', `
                <div class="result-title">⚠️ No File Selected</div>
                <div class="result-content">Please select a CMY QR code image to test.</div>
            `, 'error');
            return;
        }
        
        this.showLoading('decodeLoading', true);
        this.hideResult('decodeResult');
        
        try {
            const imageData = await this.loadImageData(this.selectedFile);
            const thresholds = [75, 100, 128, 155, 180];
            const results = {};
            const successfulResults = [];
            
            for (const threshold of thresholds) {
                try {
                    const result = this.qrCore.decodeQR(imageData, threshold);
                    if (result.success) {
                        results[threshold] = {
                            success: true,
                            text: result.text,
                            detectedScale: result.detectedScale,
                            detectedSize: result.detectedSize
                        };
                        successfulResults.push(result.text);
                    } else {
                        results[threshold] = {
                            success: false,
                            error: result.error
                        };
                    }
                } catch (error) {
                    results[threshold] = {
                        success: false,
                        error: error.message
                    };
                }
            }
            
            const consistency = successfulResults.length > 1 && 
                              successfulResults.every(r => r === successfulResults[0]);
            const successfulDecode = successfulResults.length > 0 ? successfulResults[0] : null;
            
            let content = `
                <div class="result-title">🔬 Quality Test Results</div>
                <div class="result-content">
            `;
            
            for (const [threshold, data] of Object.entries(results)) {
                const status = data.success ? '✅' : '❌';
                const details = data.success ? 
                    `${data.text.length} chars, ${data.detectedSize}×${data.detectedSize}` : 
                    data.error.substring(0, 30) + '...';
                const thresholdText = this.getThresholdText(parseInt(threshold));
                
                content += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                        <span><strong>${thresholdText}</strong> (${threshold})</span>
                        <span>${status} ${details}</span>
                    </div>
                `;
            }
            
            content += `
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 6px; border: 1px solid var(--border);">
                        <strong>Consistency:</strong> ${consistency ? '✅ All results match' : '❌ Results vary'}
                    </div>
            `;
            
            if (successfulDecode) {
                const isUrl = successfulDecode.startsWith('http://') || successfulDecode.startsWith('https://') || successfulDecode.startsWith('www.');
                const linkHtml = isUrl ? `<br><a href="${successfulDecode}" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: none;">→ Open Link</a>` : '';
                
                content += `
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 6px; border: 1px solid var(--border); word-break: break-all;">
                        <strong>Decoded Content:</strong><br>
                        ${this.escapeHtml(successfulDecode)}
                        ${linkHtml}
                    </div>
                `;
            }
            
            content += '</div>';
            
            this.showResult('decodeResult', content, consistency ? 'success' : 'error');
            
        } catch (error) {
            console.error('Robustness test error:', error);
            this.showResult('decodeResult', `
                <div class="result-title">❌ Test Failed</div>
                <div class="result-content">Error: ${error.message}</div>
            `, 'error');
        } finally {
            this.showLoading('decodeLoading', false);
        }
    }

    // Load image data from file
    async loadImageData(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    resolve(imageData);
                } catch (error) {
                    reject(new Error('Could not read image data'));
                }
            };
            
            img.onerror = () => reject(new Error('Could not load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generate random 4-digit string for filename
    generateRandomCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
}

// Global functions for HTML event handlers
let app;

function updateThreshold(value) {
    const display = document.getElementById('thresholdValue');
    display.textContent = app.getThresholdText(parseInt(value));
}

function handleFileSelect(event) {
    app.selectedFile = event.target.files[0];
    const preview = document.getElementById('filePreview');
    
    if (app.selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="QR Code Preview">
                <div class="file-info">
                    ${app.selectedFile.name} (${(app.selectedFile.size / 1024).toFixed(1)} KB)
                </div>
            `;
        };
        reader.readAsDataURL(app.selectedFile);
    } else {
        preview.innerHTML = '';
    }
}

function encodeQR() {
    app.encodeQR();
}

function decodeQR() {
    app.decodeQR();
}

function testRobustness() {
    app.testRobustness();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new CMYQRApp();
});
