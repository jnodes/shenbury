# Shenbury 神堡
## The Art of Provenance

A Web3-enabled auction platform for authenticated Chinese ceramics and artifacts, featuring ERC-404 fractional ownership.

![Shenbury Platform](https://img.shields.io/badge/Platform-Live-brightgreen)
![ERC-404](https://img.shields.io/badge/ERC--404-Enabled-blue)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)

## 🏺 Features

- **Authenticated Chinese Artifacts**: Museum-quality ceramics from Song, Yuan, Ming, and Qing dynasties
- **ERC-404 Fractional Ownership**: Own portions of priceless artifacts through innovative token standards
- **360° Video Views**: High-definition video showcasing of each artifact
- **Multi-language Support**: English and Chinese (简体中文)
- **Web3 Integration**: MetaMask wallet connection for bidding and token purchases
- **SEO Optimized**: Structured data and optimized images for search visibility

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (for local development)
- MetaMask wallet (for Web3 features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shenbury.git
cd shenbury

# Install dependencies (if any)
npm install

# Run locally
npm start
```

### Deployment

This project is configured for automatic deployment on Vercel:

1. Fork this repository
2. Connect to Vercel
3. Deploy with one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/shenbury)

## 📁 Project Structure

```
shenbury/
├── public/
│   ├── index.html          # Main application
│   ├── sw.js              # Service worker
│   └── assets/
│       ├── images/
│       │   └── relics/    # Artifact images
│       └── videos/        # 360° videos
├── vercel.json            # Vercel configuration
├── package.json           # Project metadata
└── README.md             # This file
```

## 🎨 Adding New Artifacts

1. Add images to `/public/assets/images/relics/[lot-number]-[artifact-name]/`
2. Add videos to `/public/assets/videos/`
3. Update the artifacts array in `index.html`

### Image Requirements
- Main images: 4000x4000px source, optimized to 1200px
- Thumbnails: 600x600px
- Formats: JPEG for photos, WebP for modern browsers

### Video Requirements
- Format: MP4 (H.264) + WebM fallback
- Resolution: 1920x1080 minimum
- Duration: 30-60 seconds for 360° views

## 🔧 Configuration

### Environment Variables
Create a `.env` file for local development:

```env
NEXT_PUBLIC_INFURA_PROJECT_ID=your_infura_id
NEXT_PUBLIC_ERC404_ADDRESS=0x...
NEXT_PUBLIC_AUCTION_ADDRESS=0x...
```

### Smart Contracts
- **ERC-404 Token**: Fractional ownership implementation
- **Auction Contract**: Handles bidding and settlements

## 📊 SEO & Analytics

- Structured data for Google Rich Results
- Image and video sitemaps included
- Google Analytics 4 ready
- Core Web Vitals optimized

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chinese ceramics expertise provided by specialist consultants
- ERC-404 implementation inspired by Pandora project
- Built with Web3.js and Ethers.js

## 📞 Contact

- Website: [shenbury.com](https://shenbury.com)
- Email: info@shenbury.com
- Twitter: [@shenbury](https://twitter.com/shenbury)

---

**Shenbury 神堡** - The Art of Provenance
