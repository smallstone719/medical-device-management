/**
 * VICAS Device Management - Auto Updater
 * Checks GitHub releases for new versions and handles download/install
 */

const { app, dialog, shell, BrowserWindow } = require('electron');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const GITHUB_REPO = 'thuanhuynhh/medical-device-management';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

/**
 * Get current app version from package.json
 */
function getCurrentVersion() {
  try {
    const pkgPath = path.join(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch (e) {
    return '0.0.0';
  }
}

/**
 * Compare semver versions. Returns:
 *  1 if a > b, -1 if a < b, 0 if equal
 */
function compareVersions(a, b) {
  const partsA = a.replace(/^v/, '').split('.').map(Number);
  const partsB = b.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

/**
 * Fetch latest release info from GitHub API
 */
function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      method: 'GET',
      headers: {
        'User-Agent': 'VICAS-Device-Management-Updater',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else if (res.statusCode === 404) {
            resolve(null); // No releases
          } else {
            reject(new Error(`GitHub API returned ${res.statusCode}: ${data.substring(0, 200)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

/**
 * Find the setup.exe asset from a release
 */
function findSetupAsset(release) {
  if (!release || !release.assets) return null;

  // Prefer "setup.exe", then any .exe file with "setup" in the name
  let asset = release.assets.find(a => a.name.toLowerCase() === 'setup.exe');
  if (!asset) {
    asset = release.assets.find(a =>
      a.name.toLowerCase().includes('setup') && a.name.toLowerCase().endsWith('.exe')
    );
  }
  if (!asset) {
    // Fallback: any .exe that isn't portable
    asset = release.assets.find(a =>
      a.name.toLowerCase().endsWith('.exe') && !a.name.toLowerCase().includes('portable')
    );
  }
  return asset;
}

/**
 * Download file with progress window
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    // Create progress window
    const progressWin = new BrowserWindow({
      width: 450,
      height: 180,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      autoHideMenuBar: true,
      title: 'Đang tải cập nhật...',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: calc(100vh - 48px);
          }
          h3 { margin: 0 0 16px 0; color: #333; font-size: 14px; }
          .progress-bar {
            width: 100%;
            height: 22px;
            background: #e0e0e0;
            border-radius: 11px;
            overflow: hidden;
            margin-bottom: 10px;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            border-radius: 11px;
            transition: width 0.3s ease;
            width: 0%;
          }
          .status { color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h3>⬇️ Đang tải bản cập nhật...</h3>
        <div class="progress-bar">
          <div class="progress-fill" id="fill"></div>
        </div>
        <div class="status" id="status">Đang kết nối...</div>
        <script>
          const { ipcRenderer } = require('electron');
          ipcRenderer.on('download-progress', (e, pct, downloaded, total) => {
            document.getElementById('fill').style.width = pct + '%';
            const mb = (downloaded / 1024 / 1024).toFixed(1);
            const totalMb = (total / 1024 / 1024).toFixed(1);
            document.getElementById('status').textContent = 
              pct.toFixed(0) + '% - ' + mb + ' MB / ' + totalMb + ' MB';
          });
        </script>
      </body>
      </html>
    `;

    progressWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));

    // Follow redirects and download
    function doDownload(downloadUrl) {
      const urlObj = new URL(downloadUrl);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'VICAS-Device-Management-Updater'
        }
      };

      const protocol = urlObj.protocol === 'https:' ? https : require('http');
      const req = protocol.request(options, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doDownload(res.headers.location);
          return;
        }

        if (res.statusCode !== 200) {
          progressWin.destroy();
          reject(new Error(`Download failed with status ${res.statusCode}`));
          return;
        }

        const totalSize = parseInt(res.headers['content-length'], 10) || 0;
        let downloadedSize = 0;
        const file = fs.createWriteStream(destPath);

        res.on('data', (chunk) => {
          downloadedSize += chunk.length;
          file.write(chunk);
          if (totalSize > 0 && !progressWin.isDestroyed()) {
            const pct = (downloadedSize / totalSize) * 100;
            progressWin.webContents.send('download-progress', pct, downloadedSize, totalSize);
          }
        });

        res.on('end', () => {
          file.end(() => {
            if (!progressWin.isDestroyed()) {
              progressWin.destroy();
            }
            resolve(destPath);
          });
        });

        res.on('error', (err) => {
          file.end();
          if (!progressWin.isDestroyed()) {
            progressWin.destroy();
          }
          // Clean up partial download
          try { fs.unlinkSync(destPath); } catch (e) {}
          reject(err);
        });
      });

      req.on('error', (err) => {
        if (!progressWin.isDestroyed()) {
          progressWin.destroy();
        }
        reject(err);
      });

      req.setTimeout(300000, () => { // 5 min timeout for large files
        req.destroy();
        if (!progressWin.isDestroyed()) {
          progressWin.destroy();
        }
        reject(new Error('Download timeout'));
      });

      req.end();
    }

    doDownload(url);
  });
}

/**
 * Check for updates and prompt user if a new version is available
 * @param {boolean} silent - If true, don't show "up to date" dialog
 */
async function checkAndPromptUpdate(silent = false) {
  try {
    const currentVersion = getCurrentVersion();
    const release = await fetchLatestRelease();

    if (!release) {
      if (!silent) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Kiểm tra cập nhật',
          message: 'Không tìm thấy thông tin phiên bản trên GitHub.',
          buttons: ['OK']
        });
      }
      return { hasUpdate: false };
    }

    const latestVersion = release.tag_name.replace(/^v/, '');

    if (compareVersions(latestVersion, currentVersion) <= 0) {
      if (!silent) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Kiểm tra cập nhật',
          message: `Bạn đang dùng phiên bản mới nhất (v${currentVersion}).`,
          buttons: ['OK']
        });
      }
      return { hasUpdate: false, currentVersion, latestVersion };
    }

    // New version available!
    const asset = findSetupAsset(release);
    const releaseNotes = release.body || 'Không có ghi chú phiên bản.';

    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Có phiên bản mới!',
      message: `Phiên bản mới: v${latestVersion}\nPhiên bản hiện tại: v${currentVersion}`,
      detail: asset
        ? `${releaseNotes}\n\nBạn có muốn tải và cài đặt bản cập nhật?\n\n⚠️ Dữ liệu (database, uploads) sẽ được giữ nguyên.`
        : `${releaseNotes}\n\nKhông tìm thấy file cài đặt. Bạn có muốn mở trang tải về?`,
      buttons: asset ? ['Tải & Cài đặt', 'Mở trang GitHub', 'Để sau'] : ['Mở trang GitHub', 'Để sau'],
      defaultId: 0,
      cancelId: asset ? 2 : 1
    });

    if (asset && result.response === 0) {
      // Download and install
      await downloadAndInstall(asset, latestVersion);
    } else if ((asset && result.response === 1) || (!asset && result.response === 0)) {
      // Open GitHub release page
      shell.openExternal(release.html_url);
    }

    return { hasUpdate: true, currentVersion, latestVersion };
  } catch (err) {
    if (!silent) {
      dialog.showMessageBox({
        type: 'error',
        title: 'Lỗi kiểm tra cập nhật',
        message: `Không thể kiểm tra cập nhật:\n${err.message}`,
        detail: 'Vui lòng kiểm tra kết nối internet và thử lại.',
        buttons: ['OK']
      });
    }
    console.error('Update check failed:', err);
    return { hasUpdate: false, error: err.message };
  }
}

/**
 * Download the installer and run it
 */
async function downloadAndInstall(asset, version) {
  try {
    const tempDir = app.getPath('temp');
    const fileName = `VICAS-Setup-v${version}.exe`;
    const destPath = path.join(tempDir, fileName);

    // Remove old download if exists
    try { fs.unlinkSync(destPath); } catch (e) {}

    // Download
    await downloadFile(asset.browser_download_url, destPath);

    // Verify file exists and has reasonable size
    const stats = fs.statSync(destPath);
    if (stats.size < 1024 * 1024) { // Less than 1MB is suspicious
      throw new Error('File tải về quá nhỏ, có thể bị lỗi.');
    }

    // Ask to install now
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Tải xong!',
      message: `Đã tải bản cập nhật v${version} thành công.\nKích thước: ${(stats.size / 1024 / 1024).toFixed(1)} MB`,
      detail: 'Ứng dụng sẽ đóng lại để cài đặt bản mới.\nDữ liệu của bạn sẽ được giữ nguyên.',
      buttons: ['Cài đặt ngay', 'Cài đặt sau'],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      // Launch installer and quit app
      spawn(destPath, [], {
        detached: true,
        stdio: 'ignore'
      }).unref();

      // Quit the app so installer can replace files
      setTimeout(() => {
        app.quit();
      }, 500);
    } else {
      // Open folder containing the installer
      shell.showItemInFolder(destPath);
    }
  } catch (err) {
    dialog.showMessageBox({
      type: 'error',
      title: 'Lỗi tải cập nhật',
      message: `Không thể tải bản cập nhật:\n${err.message}`,
      buttons: ['OK']
    });
  }
}

/**
 * Silent check - used on app startup
 */
async function checkForUpdatesSilent() {
  return checkAndPromptUpdate(true);
}

module.exports = {
  checkAndPromptUpdate,
  checkForUpdatesSilent,
  getCurrentVersion,
  compareVersions
};
