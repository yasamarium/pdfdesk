# PDFDesk 📄⚡

> **Minimalist iOS-Themed Client-Side PDF Splitter & Editor with Cloud Storage via GitHub Releases.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyasamarium%2Fpdfdesk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Vault](https://img.shields.io/badge/Cloud%20Vault-pdfdatabase-blue)](https://github.com/yasamarium/pdfdatabase)

---

## 🌟 What's New in PDFDesk Pro

1. **Integrated PDF Editor Studio**:
   - **Freehand Pen & Ink**: Draw with customizable stroke widths and Apple palette colors.
   - **Highlighter Tool**: Semi-transparent markup for contracts and notes.
   - **Text Annotations**: Click anywhere on a page to insert custom typography (custom size, bold, color).
   - **Digital Signature Stamp**: Draw signatures by mouse or touch, or type cursive signatures to stamp onto any page.
   - **Watermark Engine**: Apply diagonal/horizontal watermark stamps (e.g. `CONFIDENTIAL`, `DRAFT`, `APPROVED`, or custom text) with opacity and font size controls.
   - **Page Operations**: Rotate pages 90° CW/CCW, duplicate, and delete pages before exporting.

2. **Cloud Storage Vault ([yasamarium/pdfdatabase](https://github.com/yasamarium/pdfdatabase))**:
   - Save split or edited PDFs directly to the Cloud backed by **GitHub Releases**!
   - Permanent direct CDN download links.
   - User authentication: Sign in with GitHub PAT; user profiles and login records are cataloged directly into `pdfdatabase/users.json` and documents into `pdfdatabase/documents.json`.
   - Manage documents in the Cloud Vault: copy direct links, preview in browser, and delete.

3. **Custom Export File Name**:
   - Rename output files with filesystem-safe sanitization.
   - One-tap preset tags (`_split`, `_pages`, `_selected`, `_date`).
   - Automatic `.pdf` or `.zip` extension handling.

4. **Dedicated Phone (Mobile) & PC (Desktop) Layouts**:
   - **Mobile Phone**: 2-column touch cards, finger steppers `[-] [ Page ] [+]`, expandable settings sheet, and bottom iOS action dock (`pb-safe`).
   - **Desktop Studio**: 2-column productivity workspace with sticky tool panel, multi-column density switcher (3×, 4×, 5×), and keyboard shortcuts (<kbd>Ctrl</kbd> + <kbd>Enter</kbd> to split).

---

## 🚀 1-Click Vercel Deployment

PDFDesk is 100% client-side and pre-configured for Vercel with `vercel.json`:

1. Click **[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyasamarium%2Fpdfdesk)**.
2. Select your repository `yasamarium/pdfdesk`.
3. Click **Deploy**. Your app is live in seconds on the Vercel Edge CDN!

---

## 🗄️ Connected Repositories

- **Application Frontend**: [yasamarium/pdfdesk](https://github.com/yasamarium/pdfdesk)
- **Cloud Vault & Storage Database**: [yasamarium/pdfdatabase](https://github.com/yasamarium/pdfdatabase)
  - Releases Storage: [pdfdatabase/releases](https://github.com/yasamarium/pdfdatabase/releases)
  - User Directory: `users.json`
  - Document Catalog: `documents.json`

---

## 🛠️ Local Development

```bash
# Clone
git clone https://github.com/yasamarium/pdfdesk.git
cd pdfdesk

# Install
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## 🔒 Security & Privacy

Document processing is performed entirely in memory using WebAssembly (`pdf-lib` & `pdfjs-dist`). Cloud saving is strictly opt-in and stored directly in your own authenticated GitHub repository vault.

---

## 📄 License

MIT License © 2026 [yasamarium](https://github.com/yasamarium)
