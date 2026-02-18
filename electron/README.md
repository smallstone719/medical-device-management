# Electron App Structure

Thư mục này chứa code cho Electron desktop app.

## Cấu trúc

```
electron/
├── main.js              # Entry point cho Electron
├── preload.js           # Preload script (context bridge)
├── ipc/                 # IPC handlers
│   ├── index.js         # IPC registry
│   ├── app.ipc.js       # App-related IPC
│   └── window.ipc.js    # Window management IPC
└── utils/               # Utilities
    ├── autoUpdater.js   # Custom GitHub updater
    └── tray.js          # System tray
```

## Files

### main.js
Entry point của Electron app. Khởi tạo BrowserWindow và load frontend.

**Chức năng:**
- Tạo main window
- Load frontend (dev: localhost:5173, prod: dist/index.html)
- Quản lý app lifecycle

### preload.js
Preload script chạy trước khi load web content. Cung cấp context bridge giữa main process và renderer.

**Chức năng:**
- Expose safe APIs cho renderer process
- Bridge giữa IPC và frontend

### ipc/
IPC (Inter-Process Communication) handlers.

**index.js** - Registry tất cả IPC handlers
**app.ipc.js** - App-related handlers (version, updates, etc.)
**window.ipc.js** - Window management (minimize, maximize, close)

### utils/

#### autoUpdater.js
Custom GitHub updater - kiểm tra và tải bản cập nhật từ GitHub Releases.

**Features:**
- Kiểm tra phiên bản mới
- Download với progress bar
- Tự động cài đặt

**Usage:**
```javascript
const updater = require('./electron/utils/autoUpdater');
updater.checkForUpdatesSilent();
```

#### tray.js
System tray icon và menu.

## Development

### Run Electron in dev mode

```bash
npm run electron:dev
```

### Build Electron app

```bash
npm run electron:build
```

## Environment Variables

- `NODE_ENV` - development/production
- `ELECTRON_DEV_URL` - URL cho dev mode (default: http://localhost:5173)

## Dependencies

- electron - Desktop app framework
- electron-builder - Build và package app

## Notes

- Electron app chạy frontend từ Vite dev server (dev) hoặc dist folder (prod)
- Backend API vẫn chạy riêng (Express server)
- IPC được dùng để giao tiếp giữa main process và renderer
- Auto updater kiểm tra GitHub releases để cập nhật
