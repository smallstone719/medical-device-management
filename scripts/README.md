# Build & Deployment Scripts

Thư mục này chứa các script build và deployment cho project.

## Scripts

### build.js
Build frontend và Electron app thông thường.

**Chức năng:**
- Build frontend với Vite (`npm run build`)
- Build Electron app với electron-builder

**Sử dụng:**
```bash
node scripts/build.js
# hoặc
npm run build
```

**Output:**
- `frontend/dist/` - Frontend production build
- `dist/` - Electron app installers (.exe, .dmg, etc.)

---

### build-standalone.js
Build standalone executable (.exe) với tất cả dependencies embedded.

**Chức năng:**
- Package server.js thành .exe với @yao-pkg/pkg
- Embed public/ folder vào executable
- Copy native binaries (cloudflared, better-sqlite3)
- Tạo launcher scripts (start.bat)
- Tạo documentation (README.txt)

**Sử dụng:**
```bash
node scripts/build-standalone.js
```

**Output:**
```
dist/
├── VICAS.exe              # Main executable (all code embedded)
├── start.bat              # Launcher script
├── README.txt             # User documentation
├── bin/
│   └── cloudflared.exe    # Tunnel binary
├── data/
│   ├── logo.png           # Customizable logo
│   ├── vicas.ico          # System tray icon
│   └── devices.db         # Database (auto-created)
└── prebuilds/             # Native modules (better-sqlite3)
```

**Requirements:**
- @yao-pkg/pkg installed globally or in devDependencies
- nport installed globally (for cloudflared)
- Visual C++ Redistributable 2015-2022 (runtime requirement)

**Use case:**
- Portable distribution
- Single-file deployment
- No Node.js installation required on target machine

---

### migrate.js
Chạy database migrations.

**Chức năng:**
- Chạy tất cả migrations trong `backend/database/migrations/`
- Tạo tables và indexes
- Seed initial data

**Sử dụng:**
```bash
node scripts/migrate.js
# hoặc
npm run migrate
```

---

### seed.js
Seed database với dữ liệu mẫu.

**Chức năng:**
- Tạo admin user
- Tạo departments, categories
- Tạo demo devices, inspections, tickets

**Sử dụng:**
```bash
node scripts/seed.js
# hoặc
npm run seed
```

**Note:** Script này gọi `backend/database/seeds/seed.js`

---

## Build Comparison

| Feature | build.js | build-standalone.js |
|---------|----------|---------------------|
| Output | Electron installer | Standalone .exe |
| Node.js required | Yes (on target) | No (embedded) |
| Size | Smaller | Larger (~100MB+) |
| Updates | Auto-update support | Manual update |
| Distribution | Install wizard | Portable zip |
| Use case | Standard deployment | Portable/offline |

## Deployment Workflows

### Standard Deployment (Electron)
```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Build Electron app
npm run build:electron

# 3. Distribute installer
# Output: dist/VICAS-Setup-1.0.0.exe
```

### Standalone Deployment
```bash
# 1. Build standalone
node scripts/build-standalone.js

# 2. Zip dist folder
# 3. Distribute zip file
# Users extract and run start.bat
```

### Web Deployment
```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Deploy backend + frontend/dist
# 3. Run on server with Node.js
node server.js
```

## Environment Variables

Build scripts respect these environment variables:

- `NODE_ENV` - development/production
- `VITE_API_URL` - API endpoint for frontend
- `DB_PATH` - Database location

## Notes

- All scripts should be run from project root
- Ensure dependencies are installed (`npm install`)
- For standalone build, install @yao-pkg/pkg: `npm install -g @yao-pkg/pkg`
