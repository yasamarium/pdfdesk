# PDFDesk 📄⚡

> **Minimalist iOS-Themed Client-Side PDF Splitter & Extractor with Real-Time Live Preview.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyasamarium%2Fpdfdesk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yasamarium/pdfdesk?style=social)](https://github.com/yasamarium/pdfdesk)

---

## ✨ Features

- **100% Client-Side Privacy**: Files never leave your browser. Zero uploads to any server. Completely safe for confidential documents, tax forms, IDs, and financial statements.
- **Pure Black iOS Dark Theme**: Apple Human Interface Guidelines-inspired minimalist OLED aesthetic with frosted acrylic blur, fluid micro-interactions, and Cupertino typography.
- **Interactive Live Preview**:
  - Crisp high-resolution thumbnail grid rendered directly from PDF vectors.
  - Fullscreen iOS Lightbox Viewer with zoom in/out, page flipping, and keyboard navigation (`←`, `→`, `Esc`).
  - Pre-flight split output preview before saving.
- **Multiple Precision Split Modes**:
  - **Range & From-To**: Select ranges like `1-4, 7, 9-12` or set start and end boundaries.
  - **Visual Selection**: One-click thumbnail toggle, range click, invert selection, odd/even selectors.
  - **Extract Every Page**: Splits every page into single PDF documents packaged into a convenient ZIP.
  - **Chunk Splitter**: Split document into equal parts of $N$ pages each.
- **Page Transformations**: Rotate pages 90° clockwise before splitting.
- **Instant Testing**: Built-in 8-page sample document so you can test features without needing a local PDF.
- **Keyboard Shortcuts**: Press <kbd>Cmd</kbd> + <kbd>Enter</kbd> / <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to instantly split and download.

---

## 🚀 Live Demo & Deployment

### Deploy to Vercel in 1 Click

PDFDesk is preconfigured for zero-configuration Vercel deployment with included `vercel.json`:

1. Click the **[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyasamarium%2Fpdfdesk)** button.
2. Connect your GitHub account and import `yasamarium/pdfdesk`.
3. Click **Deploy**. Vercel will build and host the static site globally on Edge CDN within seconds.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (iOS Glassmorphism & OLED Dark Mode)
- **PDF Core**: [`pdf-lib`](https://pdf-lib.js.org/) for lossless client-side document assembly
- **PDF Renderer**: [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) for vector canvas previews
- **Archive Packager**: [`jszip`](https://stuk.github.io/jszip/) for multi-file ZIP bundles
- **Icons**: [`lucide-react`](https://lucide.dev/)
- **Micro-interactions**: [`canvas-confetti`](https://www.npmjs.com/package/canvas-confetti)

---

## 💻 Local Development

Clone the repository and run locally:

```bash
# Clone repository
git clone https://github.com/yasamarium/pdfdesk.git
cd pdfdesk

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔒 Security & Privacy

PDFDesk uses WebAssembly and client-side JavaScript APIs to process documents directly in memory. At no point are your PDF bytes sent across the network or stored in databases. You can even disconnect your internet connection and the app will function seamlessly.

---

## 📄 License

MIT License © 2026 [yasamarium](https://github.com/yasamarium)
