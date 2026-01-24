# Deployment Guide - Scribd PDF Downloader

## Overview
Aplikasi ini terdiri dari dua komponen utama:
1. **Frontend**: React SPA dengan Vite
2. **Backend**: Deno serverless function di Blink

## Backend Deployment (Blink Serverless Function)

Backend sudah di-deploy di Blink dengan URL:
```
https://zy5iy33q--scribd-downloader.functions.blink.new
```

### Re-deploy Backend
Jika perlu update backend:
1. Login ke [blink.new](https://blink.new)
2. Navigate ke project `scribd-pdf-downloader-jm4r9t07`
3. Update file `functions/scribd-downloader/index.ts`
4. Blink akan auto-deploy

## Frontend Deployment

### Environment Variables
Buat file `.env.local`:
```
VITE_API_URL=https://zy5iy33q--scribd-downloader.functions.blink.new
VITE_BLINK_PROJECT_ID=scribd-pdf-downloader-jm4r9t07
VITE_BLINK_PUBLISHABLE_KEY=blnk_pk_QmHZ1ndDYbEGjVhyqjMZZlMgP8PygRw1
```

### Build & Deploy

#### Option 1: Vercel
```bash
npm install -g vercel
vercel
```

#### Option 2: Netlify
```bash
npm run build
# Upload folder 'dist' ke Netlify
```

#### Option 3: GitHub Pages
```bash
npm run build
# Deploy folder 'dist' ke GitHub Pages
```

## Testing

### Local Development
```bash
bun install
bun run dev
```

### Test dengan Scribd URL
Contoh URL untuk testing:
- https://www.scribd.com/document/[ID]/[title]
- https://www.scribd.com/doc/[ID]

## Features

### Backend (6 Download Strategies)
1. Direct Download Endpoint
2. Classic API Endpoint
3. Download Button Endpoint
4. Reader Download Parameter
5. Embeds Content Endpoint
6. Archive Endpoint

### Frontend Features
- URL validation
- Progress indicator
- Auto-retry (max 3 attempts)
- Cancel download
- File size display
- Metadata extraction (title, pages, author)
- Toast notifications
- Responsive design

## Troubleshooting

### CORS Errors
Backend sudah configure dengan CORS headers yang proper. Jika masih ada error:
- Check browser console
- Verify API URL di `.env.local`
- Test langsung backend dengan Postman/curl

### Download Gagal
Backend mencoba 6 strategi berbeda. Jika semua gagal:
- Document mungkin private/premium
- Scribd mungkin update API
- Check backend logs di Blink dashboard

### File Tidak Terdownload
- Check browser download permissions
- Verify PDF blob valid
- Check file size > 0
- Test dengan browser berbeda

## Support
Untuk issue atau pertanyaan, check:
- Backend logs: Blink dashboard
- Frontend console: Browser DevTools
- Network tab: Verify API calls
