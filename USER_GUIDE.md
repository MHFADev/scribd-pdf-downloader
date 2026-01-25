# User Guide - Scribd PDF Downloader

## 📖 Panduan Penggunaan

### Cara Menggunakan Aplikasi

1. **Buka Aplikasi**
   - Akses aplikasi melalui browser
   - URL produksi: (akan di-deploy)
   - URL development: http://localhost:3000

2. **Masukkan URL Scribd**
   - Copy URL dokumen Scribd yang ingin diunduh
   - Format URL yang didukung:
     - `https://www.scribd.com/document/123456789/Title`
     - `https://www.scribd.com/doc/123456789`
     - `https://www.scribd.com/embeds/123456789`

3. **Download Dokumen**
   - Paste URL ke input field
   - Klik tombol "Download"
   - Tunggu progress bar sampai 100%
   - Sistem akan otomatis mencoba 6 strategi download berbeda

4. **Simpan ke Perangkat**
   - Setelah download selesai, akan muncul preview dokumen
   - Klik tombol "Save to Device"
   - File PDF akan terdownload ke folder Downloads Anda

5. **Download Dokumen Lain** (Opsional)
   - Klik "Download another document" untuk reset
   - Ulangi proses dari langkah 2

## ✨ Fitur Utama

### 1. Multiple Download Strategies
Aplikasi mencoba 6 metode berbeda untuk download:
- Direct Download Endpoint
- Classic API Endpoint
- Download Button Endpoint
- Reader Download Parameter
- Embeds Content Endpoint
- Archive Endpoint

### 2. Auto-Retry
- Otomatis retry sampai 3 kali jika download gagal
- Anda tidak perlu klik tombol retry manual
- Progress ditampilkan untuk setiap attempt

### 3. Validasi URL
- Aplikasi validasi format URL sebelum download
- Menampilkan error message jika URL tidak valid
- Mendukung berbagai format URL Scribd

### 4. Metadata Display
- Menampilkan judul dokumen
- Menampilkan jumlah halaman
- Menampilkan penulis (jika tersedia)
- Menampilkan ukuran file (MB)

### 5. Progress Indicator
- Real-time progress bar
- Persentase download
- Status text (Downloading, Retrying, Completed)

### 6. Cancel Download
- Bisa cancel download yang sedang berjalan
- Klik tombol "Cancel" saat progress bar muncul

### 7. Toast Notifications
- Notifikasi sukses saat download selesai
- Notifikasi error dengan detail pesan
- Notifikasi info saat cancel

### 8. Responsive Design
- Bekerja di desktop, tablet, dan mobile
- Layout responsif untuk semua ukuran layar
- Touch-friendly buttons untuk mobile

## ⚠️ Limitasi

### Dokumen yang Tidak Bisa Diunduh
Beberapa dokumen mungkin tidak bisa diunduh karena:

1. **Premium/Subscription Only**
   - Dokumen hanya untuk subscriber Scribd
   - Memerlukan akun premium untuk akses

2. **Private Documents**
   - Dokumen di-set sebagai private oleh pemilik
   - Tidak tersedia untuk public download

3. **DRM Protected**
   - Dokumen dilindungi DRM (Digital Rights Management)
   - Tidak bisa diunduh karena copyright protection

4. **Deleted or Unavailable**
   - Dokumen sudah dihapus dari Scribd
   - Link sudah expired atau tidak valid

### Error Messages

- **"Invalid Scribd URL format"**
  - URL yang Anda masukkan bukan URL Scribd yang valid
  - Pastikan URL dimulai dengan https://www.scribd.com/

- **"Unable to download this document"**
  - Semua 6 strategi download gagal
  - Document mungkin premium atau private

- **"Received empty PDF file"**
  - Server mengembalikan file kosong
  - Coba lagi atau gunakan URL dokumen lain

- **"Network error occurred"**
  - Koneksi internet bermasalah
  - Coba cek koneksi dan retry

## 🔧 Troubleshooting

### Download Stuck di 90%
- Tunggu beberapa saat, server mungkin lambat
- Jika lebih dari 1 menit, klik Cancel dan coba lagi

### Tombol Save to Device Tidak Muncul
- Pastikan download sudah 100%
- Refresh halaman dan coba lagi
- Check browser console untuk error

### PDF Terdownload Tapi Kosong/Corrupt
- Dokumen mungkin protected
- Coba dokumen lain untuk test
- Update browser ke versi terbaru

### Browser Block Download
- Check browser download settings
- Allow downloads dari website ini
- Check antivirus/firewall settings

## 💡 Tips & Tricks

### Untuk Hasil Terbaik
1. Gunakan URL dokumen yang complete (dengan title)
2. Pastikan dokumen adalah public/free
3. Gunakan browser modern (Chrome, Firefox, Edge, Safari)
4. Pastikan koneksi internet stabil
5. Jangan close tab saat download sedang berjalan

### Finding Public Scribd Documents
1. Search di Google: "site:scribd.com [topic] free"
2. Filter hasil dengan "free" atau "public"
3. Check preview dokumen di Scribd sebelum download

### Batch Download
- Saat ini aplikasi hanya support 1 dokumen per request
- Untuk multiple documents, download satu per satu
- Setiap download memakan waktu 5-30 detik tergantung ukuran

## 🆘 Dukungan

Jika mengalami masalah:
1. Check panduan troubleshooting di atas
2. Coba dengan browser berbeda
3. Clear browser cache & cookies
4. Disable browser extensions yang mungkin interfere

## 🔐 Privacy & Security

- Aplikasi tidak menyimpan URL yang Anda masukkan
- Tidak ada tracking atau analytics
- File PDF langsung ke device Anda, tidak disimpan di server
- CORS-enabled API untuk keamanan cross-origin request

## 📱 Browser Compatibility

**Fully Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Limited Support:**
- IE 11 (tidak direkomendasikan)
- Chrome/Firefox versi lama

## 🚀 Performance

**Average Download Time:**
- Dokumen kecil (1-10 MB): 5-15 detik
- Dokumen medium (10-50 MB): 15-45 detik
- Dokumen besar (50+ MB): 45-120 detik

**Factors Affecting Speed:**
- Ukuran dokumen
- Kecepatan internet
- Server load Scribd
- Strategi download yang berhasil

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Developer:** MHFADev
