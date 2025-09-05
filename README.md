# ColorQR - Professional Color QR Code Generator

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://developerkry.github.io/colorqr)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A professional, client-side color QR code generator that creates beautiful CMY-encoded QR codes with advanced error correction. Works entirely in your browser - no server required!

![ColorQR Screenshot](https://via.placeholder.com/800x400/0a0a0a/3b82f6?text=ColorQR+Screenshot)

## 🌟 Features

- **🎨 Professional Dark Design** - Modern, sleek interface optimized for usability
- **📱 Mobile Responsive** - Perfect experience on phones, tablets, and desktops
- **🔍 Auto-Scale Detection** - Automatically determines the correct scale when decoding
- **📏 Smart Size Selection** - Choose QR size by dimensions (21×21, 25×25, etc.)
- **🎯 Intuitive Controls** - Human-readable sensitivity settings (Low, Medium, High)
- **🧪 Quality Testing** - Test decoding across multiple sensitivity levels
- **🔒 Privacy First** - All processing happens locally in your browser
- **📂 Drag & Drop** - Easy file uploading with visual feedback
- **🔗 URL Detection** - Automatically detects and makes URLs clickable

## 🚀 Live Demo

**[Try it now →](https://developerkry.github.io/colorqr)**

## 🛠️ Technology

### CMY Color Encoding
Unlike traditional black & white QR codes, CMY QR uses three color channels:
- **🔵 Cyan Channel**: First third of your data
- **🔴 Magenta Channel**: Middle third of your data  
- **🟡 Yellow Channel**: Last third of your data

This creates beautiful, colorful QR codes that are optimized for printing and offer better error correction.

### Technical Specifications
- **📐 Dynamic Sizing**: 21×21 to 77×77 modules based on content length
- **🛡️ Error Correction**: 30% recovery data with CRC32 verification
- **🎯 Auto-Detection**: Automatic scale and size detection from images
- **⚡ Client-Side**: Pure JavaScript with no dependencies
- **🌐 Universal**: Works in all modern browsers

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Main Interface
![Main Interface](https://via.placeholder.com/600x400/1a1a1a/ffffff?text=Main+Interface)

### QR Code Generation
![QR Generation](https://via.placeholder.com/600x400/1a1a1a/3b82f6?text=QR+Generation)

### Quality Testing
![Quality Testing](https://via.placeholder.com/600x400/1a1a1a/10b981?text=Quality+Testing)

</details>

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Just visit the [live demo](https://developerkry.github.io/cmy-qr-generator) - no installation needed!

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/developerkry/colorqr.git
cd colorqr

# Serve locally (Python)
python -m http.server 8080

# Or with Node.js
npx serve .

# Open http://localhost:8080
```

### Option 3: GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → main
4. Your site will be available at `https://developerkry.github.io/colorqr`

## 📖 Usage Guide

### Creating QR Codes
1. **Enter your text or URL** in the input area
2. **Choose QR size** (Auto recommended for optimal sizing)
3. **Click "Generate QR Code"** to create your colorful QR
4. **Download** your QR code as a PNG image

### Reading QR Codes
1. **Upload a CMY QR image** (drag & drop supported)
2. **Adjust sensitivity** if needed (Medium works for most images)
3. **Click "Read QR Code"** to decode the content
4. **Use "Test Quality"** to verify across multiple sensitivity levels

## 🔧 Development

### Project Structure
```
📁 colorqr/
├── 🌐 index.html          # Main webpage
├── ⚙️ qr-core.js          # QR encoding/decoding engine  
├── 🎨 app.js              # Application logic
├── 📚 README.md           # This file
├── 📄 LICENSE             # MIT License
└── 📁 docs/               # Documentation
    ├── 🎯 USAGE.md        # Detailed usage guide
    └── 🔧 API.md          # JavaScript API documentation
```

### Key Components

#### QR Core Engine (`qr-core.js`)
- CMY color encoding/decoding algorithms
- Dynamic QR size calculation
- Error correction with CRC32 verification
- Auto-scale detection

#### Application Logic (`app.js`)
- User interface management
- File handling and drag & drop
- Result display and formatting
- Quality testing functionality

#### Modern UI (`index.html`)
- Professional dark theme
- Responsive grid layout
- Accessible form controls
- Mobile-optimized design

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **🐛 Report Bugs** - Open an issue with details
2. **💡 Suggest Features** - Share your ideas
3. **🔧 Submit PRs** - Fork, develop, and submit pull requests
4. **📚 Improve Docs** - Help make the documentation better

### Development Setup
```bash
# Fork and clone your fork
git clone https://github.com/developerkry/colorqr.git
cd colorqr

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and test locally
python -m http.server 8080

# Commit and push
git commit -m "Add your feature"
git push origin feature/your-feature-name

# Open a pull request
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **QR Code Technology** - Based on the QR Code standard with CMY color enhancement
- **Modern Web Standards** - Built with vanilla JavaScript and CSS Grid
- **Open Source Community** - Inspired by the collaborative spirit of open source

## 📊 Browser Support

- ✅ **Chrome/Chromium** 88+ (Recommended)
- ✅ **Firefox** 85+
- ✅ **Safari** 14+
- ✅ **Edge** 88+
- ✅ **Mobile Browsers** (iOS Safari, Chrome Mobile)

## 🔗 Links

- **🌐 Live Demo**: [https://developerkry.github.io/colorqr](https://developerkry.github.io/colorqr)
- **📁 Repository**: [https://github.com/developerkry/colorqr](https://github.com/developerkry/colorqr)
- **🐛 Issues**: [Report a bug or request a feature](https://github.com/developerkry/colorqr/issues)
- **💬 Discussions**: [Join the conversation](https://github.com/developerkry/colorqr/discussions)

---

**⭐ Star this repository if you find it useful!**

Made with ❤️ by [Your Name](https://github.com/developerkry)
