# 🕌 Masjid Website Starter

Starter project lengkap untuk website masjid modern — dibangun dengan **Next.js 16**, **Prisma 7**, **Better Auth**, **Midtrans**, dan **Cloudflare R2**.

```
┌─────────────────────────────────────────────────────┐
│                   ARSITEKTUR                        │
│                                                     │
│  Browser ──► Next.js App Router                     │
│               ├── /home/*     (Halaman Publik)      │
│               ├── /dashboard/* (Panel Admin)        │
│               └── /api/*      (REST API)            │
│                    ├── Prisma ──► PostgreSQL         │
│                    ├── Better Auth (Sesi & Peran)    │
│                    ├── Midtrans (Pembayaran)         │
│                    └── Cloudflare R2 (Storage)       │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Fitur](#-fitur)
- [Struktur Folder](#-struktur-folder)
- [Instalasi](#-instalasi)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Routing](#-routing)
- [API Reference](#-api-reference)
- [Integrasi Midtrans](#-integrasi-midtrans)
- [Integrasi Cloudflare R2](#-integrasi-cloudflare-r2)
- [Autentikasi](#-autentikasi)
- [Deployment](#-deployment)

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript |
| Database | PostgreSQL + Prisma 7 |
| Auth | Better Auth (email/password + roles) |
| Payment | Midtrans Snap API |
| Storage | Cloudflare R2 (S3-compatible) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Validasi | Zod 4 |
| Toast | Sonner |
| Icons | Lucide React |

---

## ✨ Fitur

### Halaman Publik (`/home`)
- 🏠 **Homepage** — Hero, layanan, artikel terbaru, CTA donasi
- 📰 **Artikel** — Listing dengan search & filter kategori, halaman detail
- 📅 **Kegiatan** — Daftar kegiatan/acara masjid dengan filter status
- 💰 **Donasi** — Form donasi dengan pilihan preset nominal, integrasi Midtrans Snap
- 🖼️ **Galeri** — Grid galeri foto kegiatan

### Panel Admin (`/dashboard`)
- 📊 **Dashboard** — Overview statistik, quick actions, aktivitas terbaru
- 📝 **Manajemen Artikel** — CRUD dengan filter status & kategori
- 📅 **Manajemen Kegiatan** — CRUD event
- 💰 **Monitor Donasi** — Tracking donasi real-time, statistik harian/mingguan/bulanan
- 🎯 **Kampanye** — Manajemen kampanye donasi dengan target & progress
- 🖼️ **Galeri** — Manajemen album & upload foto
- 📢 **Pengumuman** — Kelola pengumuman dengan prioritas & durasi aktif
- 🕌 **Profil Masjid** — Kelola info masjid, alamat, sosial media, rekening
- 👥 **Pengguna** — Manajemen user & role
- ⚙️ **Pengaturan** — Konfigurasi umum, Midtrans, R2

---

## 📁 Struktur Folder

```
masjid/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   ├── home/                   # 🌐 Halaman Publik (route group)
│   │   ├── layout.tsx          # Layout: header + footer
│   │   ├── page.tsx            # Homepage
│   │   ├── artikel/
│   │   │   ├── page.tsx        # Listing artikel
│   │   │   └── [slug]/page.tsx # Detail artikel
│   │   ├── kegiatan/page.tsx
│   │   ├── donasi/
│   │   │   ├── page.tsx        # Form donasi
│   │   │   └── status/page.tsx # Cek status donasi
│   │   ├── galeri/page.tsx
│   ├── dashboard/              # 🔒 Panel Admin (route group)
│   │   ├── layout.tsx          # Layout: sidebar + topbar
│   │   ├── page.tsx            # Dashboard overview
│   │   ├── login/page.tsx
│   │   ├── artikel/page.tsx
│   │   ├── kegiatan/page.tsx
│   │   ├── donasi/page.tsx
│   │   ├── kampanye/page.tsx
│   │   ├── galeri/page.tsx
│   │   ├── pengumuman/page.tsx
│   │   ├── profil-masjid/page.tsx
│   │   ├── pengguna/page.tsx
│   │   └── pengaturan/page.tsx
│   └── api/                    # 🔌 API Routes
│       ├── auth/[...all]/route.ts
│       ├── articles/
│       ├── events/
│       ├── donations/
│       ├── campaigns/
│       ├── galleries/
│       ├── announcements/
│       ├── masjid-profile/
│       └── upload/
├── components/
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth.ts                 # Better Auth config (server)
│   ├── auth-client.ts          # Better Auth hooks (client)
│   ├── prisma.ts               # Prisma client singleton
│   ├── r2.ts                   # Cloudflare R2 helpers
│   ├── midtrans.ts             # Midtrans integration
│   ├── validators.ts           # Zod schemas
│   └── utils.ts                # Utility functions
├── prisma/
│   └── schema.prisma           # Database schema
├── proxy.ts                     # Subdomain routing
├── .env                        # Environment variables
└── .env.example                # Template
```

---

## 🚀 Instalasi

### Prerequisites
- Node.js 18+
- PostgreSQL database (lokal atau [Neon](https://neon.tech))
- Akun [Midtrans](https://midtrans.com) (Sandbox untuk development)
- Akun [Cloudflare R2](https://developers.cloudflare.com/r2/)

### Setup

```bash
# 1. Clone repo
git clone <repo-url> masjid
cd masjid

# 2. Install dependencies
npm install

# 3. Salin environment variables
cp .env.example .env
# Edit .env sesuai konfigurasi Anda

# 4. Generate Prisma Client
npx prisma generate

# 5. Push schema ke database (development)
npx prisma db push

# 6. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk halaman publik.

Buka [http://admin.localhost:3000](http://admin.localhost:3000) untuk panel admin.

---

## 🔐 Environment Variables

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `NEXT_PUBLIC_APP_URL` | URL utama website | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Nama masjid | `Masjid Al-Ikhlas` |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://...` |
| `BETTER_AUTH_SECRET` | Secret key untuk auth | Random string 32+ chars |
| `BETTER_AUTH_URL` | Base URL untuk auth | `http://localhost:3000` |
| `BETTER_AUTH_COOKIE_DOMAIN` | Domain cookie auth (`localhost` untuk dev) | `localhost` |
| `MIDTRANS_SERVER_KEY` | Server key dari Midtrans | `SB-Mid-server-xxx` |
| `MIDTRANS_CLIENT_KEY` | Client key dari Midtrans | `SB-Mid-client-xxx` |
| `MIDTRANS_IS_PRODUCTION` | Mode produksi | `false` |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | `abc123...` |
| `R2_ACCESS_KEY_ID` | R2 Access Key | `xxx` |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key | `xxx` |
| `R2_BUCKET_NAME` | Nama bucket R2 | `masjid-storage` |
| `R2_PUBLIC_URL` | Public URL bucket | `https://storage.masjid.id` |

---

## 🗃 Database Schema

### Model Utama

| Model | Deskripsi |
|-------|-----------|
| `User` | User dengan role (SUPER_ADMIN, ADMIN, TAKMIR, JAMAAH) |
| `Session`, `Account`, `Verification` | Tabel Better Auth |
| `MasjidProfile` | Profil masjid (singleton) |
| `Article` + `ArticleCategory` | Artikel/blog dengan kategori |
| `Event` | Kegiatan/acara masjid |
| `Donation` + `DonationCampaign` | Donasi & kampanye dengan tracking |
| `Gallery` + `GalleryImage` | Album foto & gambar |
| `Announcement` | Pengumuman dengan prioritas & durasi |

### Enum

| Enum | Values |
|------|--------|
| `UserRole` | SUPER_ADMIN, ADMIN, TAKMIR, JAMAAH |
| `ArticleStatus` | DRAFT, PUBLISHED, ARCHIVED |
| `EventStatus` | UPCOMING, ONGOING, COMPLETED, CANCELLED |
| `DonationStatus` | PENDING, SUCCESS, FAILED, EXPIRED, REFUND |
| `DonationType` | INFAQ, ZAKAT, SEDEKAH, WAKAF, FIDYAH, QURBAN, OTHER |
| `AnnouncementPriority` | LOW, NORMAL, HIGH, URGENT |

---

## 🌐 Routing

Routing menggunakan **subdomain** melalui `proxy.ts`:

| URL | Route Group | Deskripsi |
|-----|-------------|-----------|
| `masjid.id/*` | `/home/*` | Halaman publik |
| `admin.masjid.id/*` | `/dashboard/*` | Panel admin |
| `*/api/*` | `/api/*` | API endpoints (tidak di-rewrite) |

### Development
- Publik: `http://localhost:3000`
- Admin: `http://admin.localhost:3000`

---

## 📡 API Reference

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `*` | `/api/auth/*` | Better Auth handler (login, register, session, dll) |

### Artikel
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/articles?page=1&limit=10&status=PUBLISHED&categoryId=xxx&search=keyword` | List artikel (paginated) |
| `POST` | `/api/articles` | Buat artikel baru |
| `GET` | `/api/articles/[slug]` | Detail artikel (auto increment viewCount) |
| `PATCH` | `/api/articles/[slug]` | Update artikel |
| `DELETE` | `/api/articles/[slug]` | Hapus artikel |

### Kegiatan
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/events?page=1&limit=10&status=UPCOMING` | List kegiatan |
| `POST` | `/api/events` | Buat kegiatan baru |
| `GET` | `/api/events/[slug]` | Detail kegiatan |
| `PATCH` | `/api/events/[slug]` | Update kegiatan |
| `DELETE` | `/api/events/[slug]` | Hapus kegiatan |

### Donasi
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/donations?page=1&limit=10&status=SUCCESS&type=INFAQ` | List donasi |
| `POST` | `/api/donations` | Buat donasi baru (return Snap token) |
| `POST` | `/api/donations/notification` | Midtrans webhook notification |
| `GET` | `/api/donations/[orderId]/status` | Cek status donasi |

### Kampanye
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/campaigns` | List kampanye (dengan collected amount) |
| `POST` | `/api/campaigns` | Buat kampanye baru |

### Galeri
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/galleries` | List album galeri |
| `POST` | `/api/galleries` | Buat album baru |

### Pengumuman
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/announcements?active=true` | List pengumuman |
| `POST` | `/api/announcements` | Buat pengumuman |

### Profil Masjid
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/masjid-profile` | Get profil masjid |
| `PUT` | `/api/masjid-profile` | Update profil masjid (upsert) |

### Upload
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/upload` | Upload file ke R2 (max 10MB) |
| `DELETE` | `/api/upload?key=xxx` | Hapus file dari R2 |

---

## 💳 Integrasi Midtrans

### Alur Donasi

```
1. User isi form donasi → POST /api/donations
2. Backend buat Snap token via Midtrans
3. Frontend redirect ke Midtrans payment page
4. User bayar (transfer, e-wallet, dll)
5. Midtrans kirim notification → POST /api/donations/notification
6. Backend update status donasi di database
7. User cek status → GET /api/donations/[orderId]/status
```

### Setup Midtrans

1. Daftar di [Midtrans Dashboard](https://dashboard.midtrans.com)
2. Ambil **Server Key** dan **Client Key** dari Settings → Access Keys
3. Set Notification URL di Settings → Configuration:
   ```
   https://yourdomain.com/api/donations/notification
   ```
4. Untuk development, gunakan **Sandbox** keys (prefix `SB-`)

### Tipe Donasi yang Didukung
- Infaq, Zakat, Sedekah, Wakaf, Fidyah, Qurban, Lainnya

---

## ☁️ Integrasi Cloudflare R2

### Setup R2

1. Buat bucket di [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Buat API token dengan permission `Object Read & Write`
3. (Opsional) Setup custom domain untuk public URL
4. Isi environment variables R2 di `.env`

### Fungsi yang Tersedia (`lib/r2.ts`)

| Fungsi | Deskripsi |
|--------|-----------|
| `uploadToR2(file, folder)` | Upload file buffer ke R2 |
| `deleteFromR2(key)` | Hapus file dari R2 |
| `getPresignedUploadUrl(key)` | URL upload langsung (client-side) |
| `getPresignedDownloadUrl(key)` | URL download sementara |
| `generateFileKey(filename, folder)` | Generate unique key |
| `extractKeyFromUrl(url)` | Ekstrak key dari public URL |

---

## 🔑 Autentikasi

Menggunakan **Better Auth** dengan konfigurasi:

- **Method**: Email + Password
- **Session**: Cookie-based, 7 hari expiry
- **Roles**: `SUPER_ADMIN`, `ADMIN`, `TAKMIR`, `JAMAAH`
- **Additional fields**: `role`, `phone`, `address`

### Client-side Usage

```tsx
import { useSession, signIn, signUp, signOut } from "@/lib/auth-client";

// Cek session
const { data: session } = useSession();

// Login
await signIn.email({ email: "admin@masjid.id", password: "password" });

// Register
await signUp.email({ email: "user@masjid.id", password: "password", name: "User" });

// Logout
await signOut();
```

---

## 🚢 Deployment

### Checklist

- [ ] Set semua environment variables di hosting provider
- [ ] Ganti `MIDTRANS_IS_PRODUCTION` ke `true`
- [ ] Ganti Midtrans keys ke production keys
- [ ] Jalankan `npx prisma migrate deploy` (bukan `db push`)
- [ ] Setup Midtrans notification URL ke domain production
- [ ] Setup Cloudflare R2 custom domain
- [ ] Setup DNS subdomain `admin.*` mengarah ke server yang sama
- [ ] Pastikan `BETTER_AUTH_SECRET` menggunakan secret yang kuat
- [ ] Enable HTTPS

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

> **Catatan**: Untuk subdomain routing di Vercel, Anda perlu mengkonfigurasi domain di Vercel Dashboard dan menambahkan wildcard domain (`*.masjid.id`).

---

## 📝 Lisensi

MIT License — Gunakan dan modifikasi sesuai kebutuhan masjid Anda.

---

<p align="center">
  Dibuat dengan ❤️ untuk masjid-masjid di Indonesia
</p>
# ahlul-quran
