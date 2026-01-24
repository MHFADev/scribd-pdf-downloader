# 📄 Scribd PDF Downloader

Aplikasi web untuk mengunduh dokumen dari Scribd ke format PDF secara instant, gratis, dan tanpa registrasi.

## 🚀 Features

### Core Functionality
- **6 Download Strategies**: Multiple fallback methods untuk memastikan success rate tinggi
- **Auto-Retry**: Otomatis mencoba ulang sampai 3x jika download gagal
- **Real-time Progress**: Progress bar dengan persentase untuk tracking download
- **Metadata Display**: Menampilkan title, pages, author, dan file size
- **Cancel Download**: Bisa membatalkan download yang sedang berjalan

### User Experience
- **URL Validation**: Validasi format URL Scribd sebelum download
- **Toast Notifications**: Feedback real-time untuk setiap action
- **Responsive Design**: Bekerja sempurna di desktop, tablet, dan mobile
- **PDF Validation**: Memastikan file yang didownload adalah PDF valid

### Technical
- **Modern Stack**: Vite 7 + React 18 + TypeScript
- **UI Components**: Tailwind CSS + shadcn/ui
- **Serverless Backend**: Deno function di Blink platform
- **CORS Enabled**: Secure cross-origin requests
- **Enhanced Linting**: ESLint + Stylelint + TypeScript checks

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ atau Bun
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd scribd-pdf-downloader

# Install dependencies
bun install
# atau
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
bun run dev
# atau
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

## 📝 Available Scripts

```bash
# Development
bun run dev          # Start dev server

# Build
bun run build        # Build untuk production
bun run preview      # Preview production build

# Linting & Type Checking
bun run lint         # Run all checks
bun run lint:types   # TypeScript type checking
bun run lint:js      # ESLint
bun run lint:css     # Stylelint
```

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── features/
│   │   └── Downloader.tsx    # Main download component
│   ├── layout/
│   │   ├── Navbar.tsx        # Navigation bar
│   │   └── Footer.tsx        # Footer
│   └── ui/                   # shadcn/ui components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions
└── index.css                 # Global styles + Tailwind
```

### Backend (Deno Serverless Function)
```
functions/
└── scribd-downloader/
    └── index.ts              # Download logic with 6 strategies
```

### Download Strategies
Backend mencoba 6 metode berbeda secara berurutan:

1. **Direct Download Endpoint** - Paling umum untuk public docs
2. **Classic API Endpoint** - Legacy API
3. **Download Button Endpoint** - Modal download
4. **Reader Download Parameter** - Reader endpoint
5. **Embeds Content Endpoint** - Embed endpoint
6. **Archive Endpoint** - Archive URL

## 🔒 Environment Variables

```env
# Blink Configuration
VITE_BLINK_PROJECT_ID=scribd-pdf-downloader-jm4r9t07
VITE_BLINK_PUBLISHABLE_KEY=blnk_pk_...

# API Endpoint
VITE_API_URL=https://zy5iy33q--scribd-downloader.functions.blink.new
```

## 📚 Documentation

- **[USER_GUIDE.md](./USER_GUIDE.md)** - Panduan lengkap untuk pengguna
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Panduan deployment

## 🧪 Testing

```bash
# Type checking
bun run lint:types

# Build test
bun run build

# Check if dev server starts
bun run dev
```