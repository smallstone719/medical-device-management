const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const QRCode = require("qrcode");
const crypto = require("crypto");
const XLSX = require("xlsx");
const cron = require("node-cron");
const multer = require("multer");
const tinify = require("tinify");
const { spawn, exec, execSync } = require("child_process");
const ZaloBot = require("./zalobot");
const { seedData } = require("./seed-data");
// SystemTray disabled - native modules don't work with pkg

// Helper function to open URL in default browser (Windows)
function openBrowser(url) {
  try {
    exec(`start "" "${url}"`, (err) => {
      if (err) {
        console.log(`   Could not auto-open browser. Please open ${url} manually.`);
      }
    });
  } catch (e) {
    console.log(`   Please open ${url} manually`);
  }
}

// ============ PACKAGING SUPPORT ============
// Detect if running as packaged executable
const isPackaged = typeof process.pkg !== 'undefined';

// Get the base directory (where the exe is located or project root)
const getBaseDir = () => {
  if (isPackaged) {
    return path.dirname(process.execPath);
  }
  return __dirname;
};

const baseDir = getBaseDir();

// Tunnel state
let tunnelInfo = {
  url: null,
  subdomain: null,
  connected: false,
  process: null
};

// TinyPNG API Key
tinify.key = process.env.TINYPNG_API_KEY || "yQIhBlBVnVTaoXAHPOXbAj3orc1F7tZ8";

// Data directory for persistent storage
const dataDir = process.env.DATA_DIR || path.join(baseDir, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Multer setup for file upload
const uploadsDir = path.join(dataDir, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files configuration
// When packaged: public/ is embedded in exe, accessed via __dirname (snapshot)
// When dev: public/ is in project folder
const publicDir = path.join(__dirname, "public");

// Logo customization: serve custom logo from data/ if exists
const customLogoPath = path.join(dataDir, "logo.png");
app.get('/images/logo.png', (req, res, next) => {
  if (fs.existsSync(customLogoPath)) {
    res.sendFile(customLogoPath);
  } else {
    next(); // Fall through to static middleware
  }
});

// Serve static files (embedded in exe when packaged)
app.use(express.static(publicDir));

// Serve uploads from data directory
app.use('/uploads', express.static(uploadsDir));

// Database setup
const dbPath = path.join(dataDir, "devices.db");
const db = new Database(dbPath);

// Create/Update tables
db.exec(`
  CREATE TABLE IF NOT EXISTS device_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#0ea5e9',
    created_by INTEGER,
    updated_by INTEGER,
    deleted_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    FOREIGN KEY (deleted_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    model TEXT,
    serial_number TEXT,
    manufacturer TEXT,
    location TEXT,
    department TEXT DEFAULT 'Chẩn đoán hình ảnh',
    category_id INTEGER,
    purchase_date TEXT,
    warranty_expiry TEXT,
    status TEXT DEFAULT 'active',
    require_auth INTEGER DEFAULT 0,
    inspection_password TEXT,
    notes TEXT,
    created_by INTEGER,
    updated_by INTEGER,
    deleted_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    FOREIGN KEY (category_id) REFERENCES device_categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    FOREIGN KEY (deleted_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    user_id INTEGER,
    inspection_date TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL,
    notes TEXT,
    issues TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'inspector',
    phone TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scheduled_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    schedule_type TEXT NOT NULL,
    schedule_time TEXT NOT NULL,
    schedule_day INTEGER,
    chat_ids TEXT,
    report_type TEXT DEFAULT 'uninspected',
    active INTEGER DEFAULT 1,
    last_run TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS zalo_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT UNIQUE NOT NULL,
    display_name TEXT,
    subscribed_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS incident_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    created_by INTEGER,
    assigned_to INTEGER,
    resolved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ticket_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES incident_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Add columns if not exist (for existing databases)
try { db.exec("ALTER TABLE devices ADD COLUMN category_id INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN require_auth INTEGER DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN inspection_password TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN department_id INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN inspection_frequency TEXT DEFAULT 'monthly'"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN phone TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN department_id INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN zalo_user_id TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE inspections ADD COLUMN images TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE inspections ADD COLUMN user_id INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE zalo_subscribers ADD COLUMN department_id INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE scheduled_reports ADD COLUMN department_id INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN image_url TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN usage_start_date TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN next_maintenance_date TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN last_maintenance_date TEXT"); } catch(e) {}

// Check if first-time setup is needed (no admin user exists)
const isFirstTimeSetup = () => {
  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  return !admin;
};

// Generate random subdomain
const generateSubdomain = () => {
  return 'vicas-' + Math.floor(100000 + Math.random() * 900000);
};

// Get saved subdomain or generate new one
const getSubdomain = () => {
  const saved = db.prepare("SELECT value FROM system_config WHERE key = ?").get('tunnel_subdomain');
  if (saved && saved.value) return saved.value;
  
  const newSubdomain = generateSubdomain();
  db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)").run('tunnel_subdomain', newSubdomain);
  return newSubdomain;
};

// Insert default categories if not exist
const categoryCount = db.prepare("SELECT COUNT(*) as count FROM device_categories").get().count;
if (categoryCount === 0) {
  const categories = [
    { name: "X-quang", description: "Máy X-quang các loại", color: "#0ea5e9" },
    { name: "CT Scanner", description: "Máy chụp cắt lớp vi tính", color: "#8b5cf6" },
    { name: "MRI", description: "Máy cộng hưởng từ", color: "#ec4899" },
    { name: "Siêu âm", description: "Máy siêu âm các loại", color: "#10b981" },
    { name: "Khác", description: "Thiết bị khác", color: "#6b7280" }
  ];
  const insertCat = db.prepare("INSERT INTO device_categories (name, description, color) VALUES (?, ?, ?)");
  categories.forEach(cat => insertCat.run(cat.name, cat.description, cat.color));
}

// ============ SETUP ROUTES ============
// Redirect to setup page if first-time
app.use((req, res, next) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/css/') || 
      req.path.startsWith('/js/') || 
      req.path.startsWith('/images/') ||
      req.path === '/setup.html') {
    return next();
  }
  
  // If first-time setup and not on setup page, redirect
  if (isFirstTimeSetup() && req.path !== '/setup.html') {
    return res.redirect('/setup.html');
  }
  
  next();
});

// Check setup status
app.get("/api/setup/status", (req, res) => {
  res.json({ 
    needsSetup: isFirstTimeSetup(),
    tunnelConnected: tunnelInfo.connected,
    tunnelUrl: tunnelInfo.url
  });
});

// Create admin account (first-time setup only)
app.post("/api/setup/admin", (req, res) => {
  if (!isFirstTimeSetup()) {
    return res.status(400).json({ success: false, message: "Hệ thống đã được cài đặt" });
  }
  
  const { full_name, username, password, subdomain, import_demo_data, domain_type, custom_domain } = req.body;
  
  if (!full_name || !username || !password) {
    return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" });
  }
  
  try {
    // Create admin user
    db.prepare("INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)").run(username, password, full_name, 'admin');
    
    // Save domain type
    const domainTypeValue = domain_type || 'nport';
    db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)").run('domain_type', domainTypeValue);
    
    // Save subdomain if provided
    if (subdomain) {
      db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)").run('tunnel_subdomain', subdomain);
    }
    
    let expectedTunnelUrl;
    
    if (domainTypeValue === 'custom' && custom_domain) {
      // Custom domain mode
      db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)").run('custom_domain', custom_domain);
      expectedTunnelUrl = custom_domain.startsWith('http') ? custom_domain : `https://${custom_domain}`;
      db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)").run('domain_url', expectedTunnelUrl);
    } else {
      // Nport mode
      const savedSubdomain = subdomain || getSubdomain();
      expectedTunnelUrl = `https://${savedSubdomain}.nport.link`;
      db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)").run('domain_url', expectedTunnelUrl);
    }
    
    // Import demo data if requested
    if (import_demo_data) {
      console.log('📥 Importing demo data...');
      seedData(db);
    }
    
    res.json({ 
      success: true, 
      message: "Cài đặt thành công",
      tunnelUrl: expectedTunnelUrl,
      subdomain: subdomain || getSubdomain()
    });
    
    // Start tunnel with the new subdomain after setup completes (only for nport mode)
    if (domainTypeValue !== 'custom') {
      const savedSubdomain = subdomain || getSubdomain();
      console.log('');
      console.log(`🔄 Khởi động tunnel với subdomain: ${savedSubdomain}...`);
      initTunnel().catch(err => {
        console.error('❌ Tunnel startup error:', err.message);
      });
    } else {
      console.log('');
      console.log(`🌐 Sử dụng tên miền tùy chọn: ${custom_domain}`);
      console.log('   Tunnel nport sẽ không được khởi động.');
    }
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get tunnel info
app.get("/api/tunnel/info", (req, res) => {
  res.json({
    connected: tunnelInfo.connected,
    url: tunnelInfo.url,
    subdomain: tunnelInfo.subdomain || getSubdomain()
  });
});

// ============ AUTH ROUTES ============
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT id, username, full_name, role, phone, department_id FROM users WHERE username = ? AND password = ? AND active = 1").get(username, password);
  if (user) {
    res.json({ success: true, user });
  } else {
    // Check if account exists but is locked
    const lockedUser = db.prepare("SELECT id FROM users WHERE username = ? AND password = ? AND active = 0").get(username, password);
    if (lockedUser) {
      res.status(403).json({ success: false, error: "account_locked", message: "Tài khoản của bạn đã bị khóa" });
    } else {
      res.status(401).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu" });
    }
  }
});

// Verify user session
app.post("/api/auth/verify", (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(401).json({ success: false, error: "no_session", message: "Chưa đăng nhập" });
  
  const user = db.prepare("SELECT id, username, full_name, role, phone, active, department_id FROM users WHERE id = ?").get(user_id);
  if (!user) return res.status(401).json({ success: false, error: "invalid_user", message: "Tài khoản không tồn tại" });
  if (!user.active) return res.status(403).json({ success: false, error: "account_locked", message: "Tài khoản của bạn đã bị khóa" });
  
  res.json({ success: true, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role, phone: user.phone, department_id: user.department_id } });
});

// Check page access permission
app.post("/api/auth/check-page-access", (req, res) => {
  const { user_id, page } = req.body;
  if (!user_id) return res.status(401).json({ allowed: false, error: "no_session", message: "Chưa đăng nhập" });
  
  const user = db.prepare("SELECT id, role, active FROM users WHERE id = ?").get(user_id);
  if (!user) return res.status(401).json({ allowed: false, error: "invalid_user", message: "Tài khoản không tồn tại" });
  if (!user.active) return res.status(403).json({ allowed: false, error: "account_locked", message: "Tài khoản của bạn đã bị khóa" });
  
  // Define page permissions
  const pagePermissions = {
    "dashboard.html": ["admin", "inspector"],
    "devices.html": ["admin", "inspector", "technician"],
    "inspections.html": ["admin", "inspector", "viewer", "technician"],
    "inspect.html": ["admin", "inspector", "viewer", "technician"],
    "settings.html": ["admin"],
    "users.html": ["admin", "inspector"],
    "tickets.html": ["admin", "inspector", "technician"]
  };
  
  const allowedRoles = pagePermissions[page] || ["admin"];
  const allowed = allowedRoles.includes(user.role);
  
  if (allowed) {
    res.json({ allowed: true });
  } else {
    res.status(403).json({ allowed: false, error: "no_permission", message: "Bạn không có quyền truy cập trang này" });
  }
});

// ============ CONFIG ROUTES ============
app.get("/api/config", (req, res) => {
  const configs = db.prepare("SELECT key, value FROM system_config").all();
  const configObj = {};
  configs.forEach(c => configObj[c.key] = c.value);
  res.json(configObj);
});

app.post("/api/config", (req, res) => {
  const { entries } = req.body;
  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ success: false, message: "Invalid config entries" });
  }
  
  const upsert = db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)");
  entries.forEach(entry => {
    upsert.run(entry.key, entry.value);
  });
  
  res.json({ success: true });
});

// ============ USER ROUTES ============
app.get("/api/users", (req, res) => {
  const { department_id, page, limit } = req.query;
  let query = "SELECT u.id, u.username, u.full_name, u.role, u.phone, u.active, u.department_id, u.zalo_user_id, u.created_at, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id";
  const params = [];
  
  if (department_id) {
    query += " WHERE u.department_id = ?";
    params.push(department_id);
  }
  
  query += " ORDER BY u.created_at DESC";

  // Pagination
  if (page) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    
    const countQuery = `SELECT COUNT(*) as count FROM (${query})`;
    // Re-bind params for count query because `db.prepare` binds strictly by position
    const total = db.prepare(countQuery).get(...params).count;

    query += " LIMIT ? OFFSET ?";
    params.push(limitNum, offset);
    
    const users = db.prepare(query).all(...params);
    res.json({
      data: users,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } else {
    const users = db.prepare(query).all(...params);
    res.json(users);
  }
});

app.get("/api/users/:id", (req, res) => {
  const user = db.prepare("SELECT u.id, u.username, u.full_name, u.role, u.phone, u.active, u.department_id, u.zalo_user_id, u.created_at, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?").get(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User không tồn tại" });
  }
});

app.post("/api/users", (req, res) => {
  const { username, password, full_name, role, phone, department_id, zalo_user_id } = req.body;
  try {
    const result = db.prepare("INSERT INTO users (username, password, full_name, role, phone, department_id, zalo_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)").run(username, password, full_name, role || "inspector", phone, department_id || null, zalo_user_id || null);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/users/:id", (req, res) => {
  const { username, password, full_name, role, phone, active, department_id, zalo_user_id } = req.body;
  try {
    if (password) {
      db.prepare("UPDATE users SET username = ?, password = ?, full_name = ?, role = ?, phone = ?, active = ?, department_id = ?, zalo_user_id = ? WHERE id = ?").run(username, password, full_name, role, phone, active ? 1 : 0, department_id || null, zalo_user_id || null, req.params.id);
    } else {
      db.prepare("UPDATE users SET username = ?, full_name = ?, role = ?, phone = ?, active = ?, department_id = ?, zalo_user_id = ? WHERE id = ?").run(username, full_name, role, phone, active ? 1 : 0, department_id || null, zalo_user_id || null, req.params.id);
    }
    const user = db.prepare("SELECT id, username, full_name, role, phone, active, department_id, zalo_user_id FROM users WHERE id = ?").get(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete("/api/users/:id", (req, res) => {
  if (req.params.id === "1") {
    return res.status(400).json({ success: false, message: "Không thể xóa admin mặc định" });
  }
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ============ CATEGORY ROUTES ============
app.get("/api/categories", (req, res) => {
  const categories = db.prepare("SELECT c.*, (SELECT COUNT(*) FROM devices WHERE category_id = c.id) as device_count FROM device_categories c ORDER BY name").all();
  res.json(categories);
});

app.post("/api/categories", (req, res) => {
  const { name, description, color } = req.body;
  try {
    const result = db.prepare("INSERT INTO device_categories (name, description, color) VALUES (?, ?, ?)").run(name, description, color || "#0ea5e9");
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/categories/:id", (req, res) => {
  const { name, description, color } = req.body;
  db.prepare("UPDATE device_categories SET name = ?, description = ?, color = ? WHERE id = ?").run(name, description, color, req.params.id);
  res.json({ success: true });
});

app.delete("/api/categories/:id", (req, res) => {
  db.prepare("UPDATE devices SET category_id = NULL WHERE category_id = ?").run(req.params.id);
  db.prepare("DELETE FROM device_categories WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ============ DEPARTMENT ROUTES ============
app.get("/api/departments", (req, res) => {
  const departments = db.prepare("SELECT d.*, (SELECT COUNT(*) FROM users WHERE department_id = d.id) as user_count, (SELECT COUNT(*) FROM devices WHERE department_id = d.id) as device_count FROM departments d ORDER BY name").all();
  res.json(departments);
});

app.post("/api/departments", (req, res) => {
  const { name, description } = req.body;
  try {
    const result = db.prepare("INSERT INTO departments (name, description) VALUES (?, ?)").run(name, description);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/departments/:id", (req, res) => {
  const { name, description } = req.body;
  db.prepare("UPDATE departments SET name = ?, description = ? WHERE id = ?").run(name, description, req.params.id);
  res.json({ success: true });
});

app.delete("/api/departments/:id", (req, res) => {
  db.prepare("UPDATE users SET department_id = NULL WHERE department_id = ?").run(req.params.id);
  db.prepare("UPDATE devices SET department_id = NULL WHERE department_id = ?").run(req.params.id);
  db.prepare("DELETE FROM departments WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ============ INCIDENT TICKET ROUTES ============
app.get("/api/tickets", (req, res) => {
  const { status, assigned_to, device_id, department_id } = req.query;
  let query = `SELECT t.*, d.name as device_name, d.location as device_location, 
    u1.full_name as created_by_name, u2.full_name as assigned_to_name
    FROM incident_tickets t 
    LEFT JOIN devices d ON t.device_id = d.id 
    LEFT JOIN users u1 ON t.created_by = u1.id
    LEFT JOIN users u2 ON t.assigned_to = u2.id
    WHERE 1=1`;
  const params = [];
  if (status) { query += " AND t.status = ?"; params.push(status); }
  if (assigned_to) { query += " AND t.assigned_to = ?"; params.push(assigned_to); }
  if (device_id) { query += " AND t.device_id = ?"; params.push(device_id); }
  if (department_id) { query += " AND d.department_id = ?"; params.push(department_id); }
  query += " ORDER BY t.created_at DESC";
  const tickets = db.prepare(query).all(...params);
  res.json(tickets);
});

app.get("/api/tickets/:id", (req, res) => {
  const ticket = db.prepare(`SELECT t.*, d.name as device_name, d.location as device_location,
    u1.full_name as created_by_name, u2.full_name as assigned_to_name
    FROM incident_tickets t 
    LEFT JOIN devices d ON t.device_id = d.id 
    LEFT JOIN users u1 ON t.created_by = u1.id
    LEFT JOIN users u2 ON t.assigned_to = u2.id
    WHERE t.id = ?`).get(req.params.id);
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404).json({ message: "Ticket không tồn tại" });
  }
});

app.post("/api/tickets", (req, res) => {
  const { device_id, title, description, priority, assigned_to, created_by } = req.body;
  try {
    const result = db.prepare("INSERT INTO incident_tickets (device_id, title, description, priority, assigned_to, created_by) VALUES (?, ?, ?, ?, ?, ?)").run(device_id, title, description, priority || "medium", assigned_to || null, created_by);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/tickets/:id", (req, res) => {
  const { title, description, status, priority, assigned_to } = req.body;
  let resolved_at = null;
  if (status === "resolved" || status === "closed") {
    const existing = db.prepare("SELECT resolved_at FROM incident_tickets WHERE id = ?").get(req.params.id);
    resolved_at = existing?.resolved_at || new Date().toISOString();
  }
  db.prepare("UPDATE incident_tickets SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, resolved_at = ? WHERE id = ?").run(title, description, status, priority, assigned_to || null, resolved_at, req.params.id);
  res.json({ success: true });
});

app.delete("/api/tickets/:id", (req, res) => {
  db.prepare("DELETE FROM incident_tickets WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ============ DEVICE ROUTES ============
app.get("/api/devices", (req, res) => {
  const { category_id, department_id, status, location, search, page, limit } = req.query;
  let query = `SELECT d.*, c.name as category_name, c.color as category_color FROM devices d LEFT JOIN device_categories c ON d.category_id = c.id WHERE 1=1`;
  const params = [];
  if (category_id) { query += " AND d.category_id = ?"; params.push(category_id); }
  if (department_id) { query += " AND d.department_id = ?"; params.push(department_id); }
  if (status) { query += " AND d.status = ?"; params.push(status); }
  if (location) { query += " AND d.location = ?"; params.push(location); }
  if (search) {
    query += " AND (d.name LIKE ? OR d.model LIKE ? OR d.serial_number LIKE ?)";
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  
  query += " ORDER BY d.created_at DESC";

  if (page) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) as count FROM devices d WHERE 1=1` + 
      (category_id ? " AND d.category_id = ?" : "") +
      (department_id ? " AND d.department_id = ?" : "") +
      (status ? " AND d.status = ?" : "") +
      (location ? " AND d.location = ?" : "") +
      (search ? " AND (d.name LIKE ? OR d.model LIKE ? OR d.serial_number LIKE ?)" : "");
    
    const countParams = [];
    if (category_id) countParams.push(category_id);
    if (department_id) countParams.push(department_id);
    if (status) countParams.push(status);
    if (location) countParams.push(location);
    if (search) { const term = `%${search}%`; countParams.push(term, term, term); }
    
    const total = db.prepare(countQuery).get(...countParams).count;

    query += " LIMIT ? OFFSET ?";
    params.push(limitNum, offset);
    
    const devices = db.prepare(query).all(...params);
    res.json({
      data: devices,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } else {
    const devices = db.prepare(query).all(...params);
    res.json(devices);
  }
});

app.get("/api/devices/:id", (req, res) => {
  const device = db.prepare(`SELECT d.*, c.name as category_name, c.color as category_color FROM devices d LEFT JOIN device_categories c ON d.category_id = c.id WHERE d.id = ?`).get(req.params.id);
  if (device) {
    res.json(device);
  } else {
    res.status(404).json({ message: "Thiết bị không tồn tại" });
  }
});

app.post("/api/devices", (req, res) => {
  const { name, model, serial_number, manufacturer, location, department_id, category_id, purchase_date, warranty_expiry, notes, require_auth, inspection_password, inspection_frequency, image_url, usage_start_date, next_maintenance_date, last_maintenance_date } = req.body;
  const id = crypto.randomUUID();
  try {
    db.prepare(`INSERT INTO devices (id, name, model, serial_number, manufacturer, location, department_id, category_id, purchase_date, warranty_expiry, notes, require_auth, inspection_password, inspection_frequency, image_url, usage_start_date, next_maintenance_date, last_maintenance_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, name, model, serial_number, manufacturer, location, department_id || null, category_id, purchase_date, warranty_expiry, notes, require_auth ? 1 : 0, inspection_password, inspection_frequency || 'monthly', image_url || null, usage_start_date || null, next_maintenance_date || null, last_maintenance_date || null);
    const device = db.prepare("SELECT * FROM devices WHERE id = ?").get(id);
    res.json({ success: true, device });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/devices/:id", (req, res) => {
  const { name, model, serial_number, manufacturer, location, department_id, category_id, purchase_date, warranty_expiry, status, notes, require_auth, inspection_password, inspection_frequency, image_url, usage_start_date, next_maintenance_date, last_maintenance_date } = req.body;
  db.prepare(`UPDATE devices SET name = ?, model = ?, serial_number = ?, manufacturer = ?, location = ?, department_id = ?, category_id = ?, purchase_date = ?, warranty_expiry = ?, status = ?, notes = ?, require_auth = ?, inspection_password = ?, inspection_frequency = ?, image_url = ?, usage_start_date = ?, next_maintenance_date = ?, last_maintenance_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(name, model, serial_number, manufacturer, location, department_id || null, category_id, purchase_date, warranty_expiry, status, notes, require_auth ? 1 : 0, inspection_password, inspection_frequency || 'monthly', image_url || null, usage_start_date || null, next_maintenance_date || null, last_maintenance_date || null, req.params.id);
  const device = db.prepare("SELECT * FROM devices WHERE id = ?").get(req.params.id);
  res.json({ success: true, device });
});

app.delete("/api/devices/:id", (req, res) => {
  db.prepare("DELETE FROM inspections WHERE device_id = ?").run(req.params.id);
  db.prepare("DELETE FROM devices WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/devices/:id/qrcode", async (req, res) => {
  const device = db.prepare("SELECT * FROM devices WHERE id = ?").get(req.params.id);
  if (!device) {
    return res.status(404).json({ message: "Thiết bị không tồn tại" });
  }
  // Get domain URL from config, fallback to localhost
  const domainConfig = db.prepare("SELECT value FROM system_config WHERE key = ?").get("domain_url");
  const baseUrl = (domainConfig?.value || `http://localhost:${PORT}`).replace(/\/$/, '');
  const qrUrl = `${baseUrl}/inspect.html?device=${device.id}`;
  const qrcode = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2, color: { dark: "#1e293b", light: "#ffffff" } });
  res.json({ device, qrcode, url: qrUrl });
});

// Verify device password for inspection
app.post("/api/devices/:id/verify-password", (req, res) => {
  const { password } = req.body;
  const device = db.prepare("SELECT inspection_password FROM devices WHERE id = ?").get(req.params.id);
  if (!device) {
    return res.status(404).json({ success: false, message: "Thiết bị không tồn tại" });
  }
  if (device.inspection_password === password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Mật khẩu không đúng" });
  }
});

// ============ DEVICE IMPORT ROUTES ============

// Download import template
app.get("/api/devices/import/template", (req, res) => {
  try {
    const categories = db.prepare("SELECT name FROM device_categories ORDER BY name").all();
    const departments = db.prepare("SELECT name FROM departments ORDER BY name").all();

    const templateData = [
      {
        'Tên thiết bị (*)': 'Máy X-quang DR',
        'Model': 'DRX-Evolution',
        'Số Serial': 'XR2024001',
        'Nhà sản xuất': 'Carestream',
        'Vị trí': 'Phòng X-quang số 1',
        'Khoa/Phòng': departments.length > 0 ? departments[0].name : 'Chẩn đoán hình ảnh',
        'Loại thiết bị': categories.length > 0 ? categories[0].name : 'X-quang',
        'Ngày mua (YYYY-MM-DD)': '2024-01-15',
        'Hết hạn bảo hành (YYYY-MM-DD)': '2026-01-15',
        'Ngày bắt đầu sử dụng (YYYY-MM-DD)': '2024-02-01',
        'Ngày bảo trì tiếp theo (YYYY-MM-DD)': '2026-06-01',
        'Ngày bảo trì cuối (YYYY-MM-DD)': '2025-12-01',
        'Tần suất kiểm tra': 'monthly',
        'Trạng thái': 'active',
        'Ghi chú': 'Thiết bị mới'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
      { wch: 25 }, { wch: 15 }, { wch: 22 }, { wch: 28 },
      { wch: 32 }, { wch: 32 }, { wch: 28 },
      { wch: 18 }, { wch: 12 }, { wch: 25 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Thiết bị');

    // Add a reference sheet with valid category/department values
    const refData = [];
    const maxRows = Math.max(categories.length, departments.length, 5);
    const frequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
    const statuses = ['active', 'maintenance', 'inactive'];
    for (let i = 0; i < maxRows; i++) {
      refData.push({
        'Loại thiết bị': categories[i]?.name || '',
        'Khoa/Phòng': departments[i]?.name || '',
        'Tần suất kiểm tra': frequencies[i] || '',
        'Trạng thái': statuses[i] || ''
      });
    }
    const ws2 = XLSX.utils.json_to_sheet(refData);
    ws2['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Giá trị tham chiếu');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=mau_import_thiet_bi.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Import devices from Excel/CSV
const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)'), false);
    }
  }
});

app.post("/api/devices/import", importUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file để import' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'File không có dữ liệu' });
    }

    // Load lookup maps
    const categories = db.prepare("SELECT id, name FROM device_categories").all();
    const departments = db.prepare("SELECT id, name FROM departments").all();
    const catMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
    const deptMap = new Map(departments.map(d => [d.name.toLowerCase(), d.id]));

    const results = { success: 0, errors: [], total: rows.length };

    const insertStmt = db.prepare(`INSERT INTO devices (id, name, model, serial_number, manufacturer, location, department_id, category_id, purchase_date, warranty_expiry, usage_start_date, next_maintenance_date, last_maintenance_date, inspection_frequency, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    const insertMany = db.transaction((rows) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // +2 because row 1 is header

        // Map column names (support both Vietnamese and English)
        const name = row['Tên thiết bị (*)'] || row['Tên thiết bị'] || row['name'] || '';
        if (!name.trim()) {
          results.errors.push(`Dòng ${rowNum}: Thiếu tên thiết bị`);
          continue;
        }

        const model = row['Model'] || row['model'] || '';
        const serial = row['Số Serial'] || row['serial_number'] || '';
        const manufacturer = row['Nhà sản xuất'] || row['manufacturer'] || '';
        const location = row['Vị trí'] || row['location'] || '';
        const deptName = row['Khoa/Phòng'] || row['department'] || '';
        const catName = row['Loại thiết bị'] || row['category'] || '';
        const purchaseDate = row['Ngày mua (YYYY-MM-DD)'] || row['purchase_date'] || '';
        const warrantyExpiry = row['Hết hạn bảo hành (YYYY-MM-DD)'] || row['warranty_expiry'] || '';
        const usageStartDate = row['Ngày bắt đầu sử dụng (YYYY-MM-DD)'] || row['usage_start_date'] || '';
        const nextMaintenanceDate = row['Ngày bảo trì tiếp theo (YYYY-MM-DD)'] || row['next_maintenance_date'] || '';
        const lastMaintenanceDate = row['Ngày bảo trì cuối (YYYY-MM-DD)'] || row['last_maintenance_date'] || '';
        const frequency = row['Tần suất kiểm tra'] || row['inspection_frequency'] || 'monthly';
        const status = row['Trạng thái'] || row['status'] || 'active';
        const notes = row['Ghi chú'] || row['notes'] || '';

        const deptId = deptName ? (deptMap.get(deptName.toLowerCase()) || null) : null;
        const catId = catName ? (catMap.get(catName.toLowerCase()) || null) : null;

        try {
          const id = crypto.randomUUID();
          insertStmt.run(
            id, name.trim(), model, serial, manufacturer, location,
            deptId, catId,
            purchaseDate || null, warrantyExpiry || null,
            usageStartDate || null, nextMaintenanceDate || null, lastMaintenanceDate || null,
            frequency, status, notes
          );
          results.success++;
        } catch (err) {
          results.errors.push(`Dòng ${rowNum}: ${err.message}`);
        }
      }
    });

    insertMany(rows);

    res.json({
      success: true,
      message: `Import thành công ${results.success}/${results.total} thiết bị`,
      results
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ IMAGE UPLOAD ROUTES ============
app.post("/api/upload-image", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    // Resize and compress with TinyPNG
    const source = tinify.fromBuffer(req.file.buffer);
    const resized = source.resize({
      method: "fit",
      width: 1000,
      height: 1000
    });
    
    // Generate filename
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.png`;
    const filepath = path.join(uploadsDir, filename);
    
    // Save compressed image
    await resized.toFile(filepath);
    
    res.json({
      success: true,
      url: `/uploads/${filename}`,
      filename: filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ INSPECTION ROUTES ============
app.get("/api/inspections", (req, res) => {
  const { device_id, start_date, end_date, user_id, department_id, status, page, limit } = req.query;
  let query = `SELECT i.*, d.name as device_name, d.location as device_location, d.category_id, c.name as category_name FROM inspections i JOIN devices d ON i.device_id = d.id LEFT JOIN device_categories c ON d.category_id = c.id WHERE 1=1`;
  const params = [];
  if (device_id) { query += " AND i.device_id = ?"; params.push(device_id); }
  if (user_id) { query += " AND i.user_id = ?"; params.push(user_id); }
  if (department_id) { query += " AND d.department_id = ?"; params.push(department_id); }
  if (status) { query += " AND i.status = ?"; params.push(status); }
  if (start_date) { query += " AND date(i.inspection_date) >= date(?)"; params.push(start_date); }
  if (end_date) { query += " AND date(i.inspection_date) <= date(?)"; params.push(end_date); }
  query += " ORDER BY i.inspection_date DESC";
  
  if (page) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Construct count query
    // We can wrap the select query to count matches
    // But we need to handle the params correctly. 
    // Since we are building query string dynamically, we can inject COUNT(*) instead of SELECT i.* ...
    
    // Safer: Filter params are identical for count
    const countQuery = `SELECT COUNT(*) as count FROM inspections i JOIN devices d ON i.device_id = d.id WHERE 1=1` +
      (device_id ? " AND i.device_id = ?" : "") +
      (user_id ? " AND i.user_id = ?" : "") +
      (department_id ? " AND d.department_id = ?" : "") +
      (status ? " AND i.status = ?" : "") +
      (start_date ? " AND date(i.inspection_date) >= date(?)" : "") +
      (end_date ? " AND date(i.inspection_date) <= date(?)" : "");
      
    // Count params must match filter params
    const countParams = [...params]; // params only has filter args so far
    const total = db.prepare(countQuery).get(...countParams).count;

    query += " LIMIT ? OFFSET ?";
    params.push(limitNum, offset);
    
    const inspections = db.prepare(query).all(...params);
    res.json({
      data: inspections,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } else {
    const inspections = db.prepare(query).all(...params);
    res.json(inspections);
  }
});

app.post("/api/inspections", async (req, res) => {
  const { device_id, inspector_name, user_id, status, notes, issues, images } = req.body;
  try {
    const imagesJson = images ? JSON.stringify(images) : null;
    // Use Vietnam timezone (+7) for inspection_date
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace(' ', 'T');
    const result = db.prepare("INSERT INTO inspections (device_id, inspector_name, user_id, status, notes, issues, images, inspection_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(device_id, inspector_name, user_id || null, status, notes, issues, imagesJson, now);
    
    // Gửi thông báo qua Zalo Bot
    const device = db.prepare("SELECT * FROM devices WHERE id = ?").get(device_id);
    if (device) {
      ZaloBot.sendInspectionNotification({ inspector_name, status, notes, issues, images: images || [] }, device).catch(err => console.error("Zalo notification error:", err));
    }
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete inspection (admin only)
app.delete("/api/inspections/:id", (req, res) => {
  const { id } = req.params;
  try {
    // Get inspection to find images before deleting
    const inspection = db.prepare("SELECT images FROM inspections WHERE id = ?").get(id);
    
    // Delete the record
    const result = db.prepare("DELETE FROM inspections WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi" });
    }
    
    // Delete image files if any
    if (inspection && inspection.images) {
      try {
        const images = JSON.parse(inspection.images);
        for (const imageUrl of images) {
          // Extract filename from URL like /uploads/xxx.png
          const filename = imageUrl.replace('/uploads/', '');
          const filepath = path.join(uploadsDir, filename);
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log(`🗑️ Đã xóa ảnh: ${filename}`);
          }
        }
      } catch (e) {
        console.error('Error deleting images:', e.message);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ SCHEDULED REPORTS ROUTES ============
app.get("/api/schedules", (req, res) => {
  const schedules = db.prepare("SELECT * FROM scheduled_reports ORDER BY created_at DESC").all();
  res.json(schedules);
});

app.post("/api/schedules", (req, res) => {
  const { name, schedule_type, schedule_time, schedule_day, chat_ids, report_type } = req.body;
  const result = db.prepare("INSERT INTO scheduled_reports (name, schedule_type, schedule_time, schedule_day, chat_ids, report_type) VALUES (?, ?, ?, ?, ?, ?)").run(name, schedule_type, schedule_time, schedule_day, JSON.stringify(chat_ids || []), report_type || "uninspected");
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/schedules/:id", (req, res) => {
  const { name, schedule_type, schedule_time, schedule_day, chat_ids, report_type, active } = req.body;
  db.prepare("UPDATE scheduled_reports SET name = ?, schedule_type = ?, schedule_time = ?, schedule_day = ?, chat_ids = ?, report_type = ?, active = ? WHERE id = ?").run(name, schedule_type, schedule_time, schedule_day, JSON.stringify(chat_ids || []), report_type, active ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.delete("/api/schedules/:id", (req, res) => {
  db.prepare("DELETE FROM scheduled_reports WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Test scheduled report
app.post("/api/schedules/:id/test", async (req, res) => {
  const schedule = db.prepare("SELECT * FROM scheduled_reports WHERE id = ?").get(req.params.id);
  if (!schedule) return res.status(404).json({ success: false, message: "Schedule không tồn tại" });
  
  const report = await generateReport(schedule.report_type);
  const chatIds = JSON.parse(schedule.chat_ids || "[]");
  
  for (const chatId of chatIds) {
    await ZaloBot.sendMessage(chatId, report);
  }
  
  res.json({ success: true, report, sent_to: chatIds.length });
});

// ============ EXPORT ROUTES ============
app.get("/api/export/devices", (req, res) => {
  const devices = db.prepare(`SELECT d.name, d.model, d.serial_number, d.manufacturer, d.location, d.department, c.name as category, d.status, d.purchase_date, d.warranty_expiry, d.created_at FROM devices d LEFT JOIN device_categories c ON d.category_id = c.id ORDER BY d.name`).all();
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(devices.map(d => ({
    "Tên thiết bị": d.name,
    "Model": d.model,
    "Serial": d.serial_number,
    "Nhà sản xuất": d.manufacturer,
    "Vị trí": d.location,
    "Khoa/Phòng": d.department,
    "Loại": d.category,
    "Trạng thái": d.status === "active" ? "Hoạt động" : d.status === "maintenance" ? "Bảo trì" : "Ngừng HD",
    "Ngày mua": d.purchase_date,
    "Hết bảo hành": d.warranty_expiry,
    "Ngày tạo": d.created_at
  })));
  XLSX.utils.book_append_sheet(wb, ws, "Thiết bị");
  
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", `attachment; filename=thiet-bi-${new Date().toISOString().split("T")[0]}.xlsx`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
});

app.get("/api/export/inspections", (req, res) => {
  const { start_date, end_date } = req.query;
  let query = `SELECT i.inspection_date, d.name as device_name, d.location, c.name as category, i.inspector_name, i.status, i.notes, i.issues FROM inspections i JOIN devices d ON i.device_id = d.id LEFT JOIN device_categories c ON d.category_id = c.id WHERE 1=1`;
  const params = [];
  if (start_date) { query += " AND date(i.inspection_date) >= date(?)"; params.push(start_date); }
  if (end_date) { query += " AND date(i.inspection_date) <= date(?)"; params.push(end_date); }
  query += " ORDER BY i.inspection_date DESC";
  
  const inspections = db.prepare(query).all(...params);
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(inspections.map(i => ({
    "Thời gian": i.inspection_date,
    "Thiết bị": i.device_name,
    "Vị trí": i.location,
    "Loại": i.category,
    "Người kiểm tra": i.inspector_name,
    "Trạng thái": i.status === "good" ? "Tốt" : i.status === "issue" ? "Có vấn đề" : "Nghiêm trọng",
    "Ghi chú": i.notes,
    "Vấn đề": i.issues
  })));
  XLSX.utils.book_append_sheet(wb, ws, "Kiểm tra");
  
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", `attachment; filename=kiem-tra-${new Date().toISOString().split("T")[0]}.xlsx`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
});

// ============ STATISTICS ============
// ============ STATISTICS ============
app.get("/api/statistics", (req, res) => {
  const { department_id } = req.query;
  const params = department_id ? [department_id] : [];
  
  // Helper for device count queries
  const getDeviceCount = (status = null) => {
    let query = "SELECT COUNT(*) as count FROM devices";
    let conditions = [];
    if (department_id) conditions.push("department_id = ?");
    if (status) conditions.push("status = ?");
    
    if (conditions.length) query += " WHERE " + conditions.join(" AND ");
    
    const countParams = [];
    if (department_id) countParams.push(department_id);
    if (status) countParams.push(status);
    
    return db.prepare(query).get(...countParams).count;
  };

  const totalDevices = getDeviceCount();
  const activeDevices = getDeviceCount('active');
  const maintenanceDevices = getDeviceCount('maintenance');
  const inactiveDevices = getDeviceCount('inactive');
  
  const today = new Date().toISOString().split("T")[0];
  
  // Today inspections
  let todayInspectionsQuery = "SELECT COUNT(*) as count FROM inspections i JOIN devices d ON i.device_id = d.id WHERE date(i.inspection_date) = date(?)";
  if (department_id) todayInspectionsQuery += " AND d.department_id = ?";
  const todayInspectionsParams = [today];
  if (department_id) todayInspectionsParams.push(department_id);
  const todayInspections = db.prepare(todayInspectionsQuery).get(...todayInspectionsParams).count;
  
  // Inspections by day (last 30 days)
  let chartQuery = `SELECT date(i.inspection_date) as date, COUNT(*) as count 
    FROM inspections i 
    JOIN devices d ON i.device_id = d.id 
    WHERE date(i.inspection_date) >= date('now', '-30 days')`;
  if (department_id) chartQuery += " AND d.department_id = ?";
  chartQuery += " GROUP BY date(i.inspection_date) ORDER BY date";
  const inspectionsByDay = db.prepare(chartQuery).all(...params);

  // Inspections by status
  let statusQuery = "SELECT i.status, COUNT(*) as count FROM inspections i JOIN devices d ON i.device_id = d.id";
  if (department_id) statusQuery += " WHERE d.department_id = ?";
  statusQuery += " GROUP BY i.status";
  const inspectionsByStatus = db.prepare(statusQuery).all(...params);
  
  // Devices not inspected today
  let notInspectedQuery = `SELECT d.* FROM devices d WHERE d.status = 'active'`;
  if (department_id) notInspectedQuery += " AND d.department_id = ?";
  notInspectedQuery += " AND d.id NOT IN (SELECT device_id FROM inspections WHERE date(inspection_date) = date(?)) ORDER BY d.name";
  const notInspectedParams = [];
  if (department_id) notInspectedParams.push(department_id);
  notInspectedParams.push(today);
  const devicesNotInspectedToday = db.prepare(notInspectedQuery).all(...notInspectedParams);
  
  // Recent inspections
  let recentQuery = `SELECT i.*, d.name as device_name, d.location FROM inspections i JOIN devices d ON i.device_id = d.id`;
  if (department_id) recentQuery += " WHERE d.department_id = ?";
  recentQuery += " ORDER BY i.inspection_date DESC LIMIT 10";
  const recentInspections = db.prepare(recentQuery).all(...params);
  
  res.json({
    devices: { total: totalDevices, active: activeDevices, maintenance: maintenanceDevices, inactive: inactiveDevices },
    inspections: { today: todayInspections, byDay: inspectionsByDay, byStatus: inspectionsByStatus },
    devicesNotInspectedToday,
    recentInspections
  });
});

// ============ ZALO BOT ROUTES ============
app.post("/api/zalo/webhook", async (req, res) => {
  console.log("📨 Zalo Webhook received:", JSON.stringify(req.body, null, 2));
  try {
    const result = await ZaloBot.handleWebhook(req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/zalo/subscribe", (req, res) => {
  const { chat_id } = req.body;
  if (!chat_id) return res.status(400).json({ success: false, message: "chat_id is required" });
  ZaloBot.addNotificationChatId(chat_id);
  res.json({ success: true, message: `Đã đăng ký ${chat_id} nhận thông báo` });
});

app.get("/api/zalo/subscribers", (req, res) => {
  res.json({ subscribers: ZaloBot.getNotificationChatIds() });
});

app.get("/api/zalo/status", async (req, res) => {
  const botInfo = await ZaloBot.testConnection();
  res.json({ connected: !!botInfo, bot: botInfo, subscribers: ZaloBot.getNotificationChatIds(), tokenMasked: ZaloBot.getTokenMasked() });
});

// Update Zalo token
app.post("/api/zalo/token", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: "Token is required" });
  }
  // Save to database
  db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)").run('zalo_token', token);
  // Update in memory
  ZaloBot.setToken(token);
  // Test connection
  const botInfo = await ZaloBot.testConnection();
  if (botInfo) {
    res.json({ success: true, message: "Token updated successfully", bot: botInfo });
  } else {
    res.json({ success: false, message: "Token saved but connection failed. Please check the token." });
  }
});

// Disconnect Zalo bot
app.post("/api/zalo/disconnect", (req, res) => {
  // Remove token from database
  db.prepare("DELETE FROM system_config WHERE key = ?").run('zalo_token');
  // Disconnect bot
  ZaloBot.disconnect();
  res.json({ success: true, message: "Bot disconnected" });
});

// ============ LOGO UPLOAD ============
app.post("/api/upload-logo", upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo uploaded' });
    }
    
    // Resize and compress with TinyPNG
    const source = tinify.fromBuffer(req.file.buffer);
    const resized = source.resize({
      method: "fit",
      width: 256,
      height: 256
    });
    
    // Save as logo.png (overwrite existing)
    const logoPath = path.join(__dirname, "public", "images", "logo-custom.png");
    await resized.toFile(logoPath);
    
    // Save config to use custom logo
    db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)").run('custom_logo', '/images/logo-custom.png');
    
    res.json({
      success: true,
      url: '/images/logo-custom.png'
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ TICKETS API ============
app.get("/api/tickets", (req, res) => {
  const status = req.query.status;
  let query = `
    SELECT t.*, 
      d.name as device_name, d.location as device_location,
      u1.full_name as created_by_name,
      u2.full_name as assigned_to_name
    FROM incident_tickets t
    LEFT JOIN devices d ON t.device_id = d.id
    LEFT JOIN users u1 ON t.created_by = u1.id
    LEFT JOIN users u2 ON t.assigned_to = u2.id
  `;
  if (status) {
    query += ` WHERE t.status = ?`;
    res.json(db.prepare(query + ` ORDER BY t.created_at DESC`).all(status));
  } else {
    res.json(db.prepare(query + ` ORDER BY t.created_at DESC`).all());
  }
});

app.get("/api/tickets/:id", (req, res) => {
  const ticket = db.prepare(`
    SELECT t.*, 
      d.name as device_name, d.location as device_location,
      u1.full_name as created_by_name,
      u2.full_name as assigned_to_name
    FROM incident_tickets t
    LEFT JOIN devices d ON t.device_id = d.id
    LEFT JOIN users u1 ON t.created_by = u1.id
    LEFT JOIN users u2 ON t.assigned_to = u2.id
    WHERE t.id = ?
  `).get(req.params.id);
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404).json({ message: "Ticket not found" });
  }
});

app.post("/api/tickets", (req, res) => {
  const { device_id, title, description, priority, created_by, assigned_to } = req.body;
  const result = db.prepare(`
    INSERT INTO incident_tickets (device_id, title, description, priority, created_by, assigned_to)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(device_id, title, description, priority || 'medium', created_by, assigned_to || null);
  const ticket = db.prepare("SELECT * FROM incident_tickets WHERE id = ?").get(result.lastInsertRowid);
  res.json({ success: true, ticket });
});

app.put("/api/tickets/:id", (req, res) => {
  const { title, description, status, priority, assigned_to } = req.body;
  const resolved_at = status === 'resolved' ? new Date().toISOString() : null;
  db.prepare(`
    UPDATE incident_tickets 
    SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, resolved_at = COALESCE(?, resolved_at)
    WHERE id = ?
  `).run(title, description, status, priority, assigned_to || null, resolved_at, req.params.id);
  const ticket = db.prepare("SELECT * FROM incident_tickets WHERE id = ?").get(req.params.id);
  res.json({ success: true, ticket });
});

app.delete("/api/tickets/:id", (req, res) => {
  db.prepare("DELETE FROM ticket_replies WHERE ticket_id = ?").run(req.params.id);
  db.prepare("DELETE FROM incident_tickets WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Claim ticket (for technicians)
app.post("/api/tickets/:id/claim", (req, res) => {
  const { user_id } = req.body;
  db.prepare(`
    UPDATE incident_tickets SET assigned_to = ?, status = 'in_progress' WHERE id = ?
  `).run(user_id, req.params.id);
  const ticket = db.prepare("SELECT * FROM incident_tickets WHERE id = ?").get(req.params.id);
  res.json({ success: true, ticket });
});

// Ticket replies
app.get("/api/tickets/:id/replies", (req, res) => {
  const replies = db.prepare(`
    SELECT r.*, u.full_name as user_name, u.role as user_role
    FROM ticket_replies r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.ticket_id = ?
    ORDER BY r.created_at ASC
  `).all(req.params.id);
  res.json(replies);
});

app.post("/api/tickets/:id/replies", (req, res) => {
  const { user_id, message } = req.body;
  const result = db.prepare(`
    INSERT INTO ticket_replies (ticket_id, user_id, message) VALUES (?, ?, ?)
  `).run(req.params.id, user_id, message);
  const reply = db.prepare(`
    SELECT r.*, u.full_name as user_name, u.role as user_role
    FROM ticket_replies r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);
  res.json({ success: true, reply });
});

// ============ SCHEDULED REPORT FUNCTIONS ============
async function generateReport(reportType) {
  const today = new Date().toISOString().split("T")[0];
  let message = "";
  
  if (reportType === "uninspected") {
    // Logic: Calculate next due date based on last inspection and frequency
    // If (last_inspection + frequency) < today OR never inspected, then it's due.
    
    // SQLite doesn't have great date math, so we'll fetch devices and simple filter in JS for flexibility
    const devices = db.prepare(`
      SELECT d.id, d.name, d.location, d.inspection_frequency,
      (SELECT MAX(inspection_date) FROM inspections WHERE device_id = d.id) as last_inspection
      FROM devices d 
      WHERE d.status = 'active'
    `).all();
    
    const uninspected = devices.filter(d => {
      if (!d.last_inspection) return true; // Never inspected
      
      const last = new Date(d.last_inspection);
      const freq = d.inspection_frequency || 'monthly';
      let nextDue = new Date(last);
      
      switch(freq) {
        case 'daily': nextDue.setDate(last.getDate() + 1); break;
        case 'weekly': nextDue.setDate(last.getDate() + 7); break;
        case 'monthly': nextDue.setMonth(last.getMonth() + 1); break;
        case 'quarterly': nextDue.setMonth(last.getMonth() + 3); break;
        case 'yearly': nextDue.setFullYear(last.getFullYear() + 1); break;
        case 'irregular': return false; // Không cần kiểm tra định kỳ
        default: nextDue.setMonth(last.getMonth() + 1); // Default monthly
      }
      
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      nextDue.setHours(0,0,0,0);
      
      return nextDue <= todayDate;
    });
    
    if (uninspected.length === 0) {
      message = `✅ BÁO CÁO KIỂM TRA\n📅 ${today}\n\nTất cả thiết bị đến hạn đã được kiểm tra!`;
    } else {
      message = `⚠️ BÁO CÁO THIẾT BỊ CẦN KIỂM TRA\n📅 ${today}\n\nCó ${uninspected.length} thiết bị đến hạn:\n\n`;
      uninspected.forEach((d, i) => {
        message += `${i + 1}. ${d.name} (${d.inspection_frequency || 'monthly'})\n   📍 ${d.location || "N/A"}\n`;
      });
    }
  } else if (reportType === "summary") {
    const stats = {
      total: db.prepare("SELECT COUNT(*) as c FROM devices").get().c,
      active: db.prepare("SELECT COUNT(*) as c FROM devices WHERE status = 'active'").get().c,
      todayInspections: db.prepare("SELECT COUNT(*) as c FROM inspections WHERE date(inspection_date) = date(?)").get(today).c,
      issues: db.prepare("SELECT COUNT(*) as c FROM inspections WHERE date(inspection_date) = date(?) AND status IN ('issue', 'critical')").get(today).c
    };
    message = `📊 BÁO CÁO TỔNG HỢP\n📅 ${today}\n\n📱 Tổng thiết bị: ${stats.total}\n✅ Đang hoạt động: ${stats.active}\n📋 Kiểm tra hôm nay: ${stats.todayInspections}\n⚠️ Có vấn đề: ${stats.issues}`;
  }
  
  return message;
}

function checkSchedules() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  const currentDay = now.getDay(); // 0-6
  const currentDate = now.getDate(); // 1-31
  
  const schedules = db.prepare("SELECT * FROM scheduled_reports WHERE active = 1").all();
  
  schedules.forEach(async (schedule) => {
    let shouldRun = false;
    
    if (schedule.schedule_time === currentTime) {
      const lastRun = schedule.last_run ? new Date(schedule.last_run) : null;
      const today = new Date().toISOString().split("T")[0];
      
      if (!lastRun || lastRun.toISOString().split("T")[0] !== today) {
        if (schedule.schedule_type === "daily") shouldRun = true;
        else if (schedule.schedule_type === "weekly" && (schedule.schedule_day === currentDay)) shouldRun = true;
        else if (schedule.schedule_type === "monthly" && (schedule.schedule_day === currentDate)) shouldRun = true;
        else if (schedule.schedule_type === "quarterly") {
          const month = now.getMonth();
          if ([0, 3, 6, 9].includes(month) && currentDate === (schedule.schedule_day || 1)) shouldRun = true;
        }
      }
    }
    
    if (shouldRun) {
      console.log(`📤 Running scheduled report: ${schedule.name}`);
      const report = await generateReport(schedule.report_type);
      const chatIds = JSON.parse(schedule.chat_ids || "[]");
      
      for (const chatId of chatIds) {
        await ZaloBot.sendMessage(chatId, report);
      }
      
      db.prepare("UPDATE scheduled_reports SET last_run = ? WHERE id = ?").run(now.toISOString(), schedule.id);
    }
  });
}

// Run scheduler every minute
cron.schedule("* * * * *", checkSchedules);

// Initialize tunnel using nport API (https://nport.link)
let tunnelProcess = null;
let tunnelId = null;

const NPORT_CONFIG = {
  BACKEND_URL: "https://nport.tuanngocptn.workers.dev",
  TIMEOUT_HOURS: 4
};

// Auto-download cloudflared binary from GitHub if missing
async function downloadCloudflared(destPath) {
  const binDir = path.dirname(destPath);
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }
  
  const downloadUrl = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';
  console.log('📥 cloudflared.exe not found. Downloading from GitHub...');
  console.log(`   URL: ${downloadUrl}`);
  console.log('   This may take a minute...');
  
  try {
    // Use curl.exe (built into Windows 10+) to download silently
    execSync(`curl.exe -L --silent --show-error -o "${destPath}" "${downloadUrl}"`, {
      stdio: 'pipe',
      timeout: 120000, // 2 minute timeout
      windowsHide: true // Hide CMD window on Windows
    });
    
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`✅ cloudflared.exe downloaded successfully! (${sizeMB} MB)`);
      return true;
    }
  } catch (e) {
    console.error(`❌ Failed to download cloudflared: ${e.message}`);
    console.log('💡 You can manually download from:');
    console.log('   https://github.com/cloudflare/cloudflared/releases');
    console.log('   Place cloudflared.exe in the bin/ folder next to VICAS.exe');
    // Clean up partial download
    try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (_) {}
  }
  return false;
}

async function initTunnel() {
  const subdomain = getSubdomain();
  
  console.log(`🔄 Starting tunnel with subdomain: ${subdomain}...`);
  
  // Find cloudflared binary - check bin/ folder first, then system PATH, then auto-download
  let cloudflaredPath = path.join(baseDir, 'bin', 'cloudflared.exe');
  
  if (!fs.existsSync(cloudflaredPath)) {
    // Try system PATH (development mode)
    try {
      const systemPath = require('child_process').execSync('where cloudflared', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim().split('\n')[0].trim();
      if (systemPath && fs.existsSync(systemPath)) {
        cloudflaredPath = systemPath;
        console.log(`   Found cloudflared in system PATH: ${cloudflaredPath}`);
      } else {
        throw new Error('not found');
      }
    } catch (e) {
      // Not in system PATH either, auto-download to bin/ folder
      console.log('   cloudflared not found in bin/ or system PATH');
      const downloaded = await downloadCloudflared(cloudflaredPath);
      if (!downloaded) {
        console.log('⚠️ Tunnel unavailable. The application will work locally only.');
        return;
      }
    }
  }
  
  try {
    // Step 1: Call nport API to create tunnel and get token
    const axios = require('axios');
    console.log('   Requesting tunnel from nport.link...');
    
    const response = await axios.post(NPORT_CONFIG.BACKEND_URL, { subdomain }, {
      timeout: 30000
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Unknown error from nport backend');
    }
    
    const { tunnelId: tid, tunnelToken, url } = response.data;
    tunnelId = tid;
    
    console.log(`✅ Tunnel created!`);
    console.log(`🌐 Public URL: ${url}`);
    console.log(`📱 QR Scanner: ${url}/inspect.html`);
    console.log(`   (Auto-cleanup in ${NPORT_CONFIG.TIMEOUT_HOURS} hours)`);
    
    // Save tunnel URL to database
    tunnelInfo.url = url;
    tunnelInfo.subdomain = subdomain;
    tunnelInfo.connected = true;
    db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)").run('domain_url', url);
    
    // Step 2: Spawn cloudflared with the token
    console.log('   Connecting to global network...');
    
    const args = ['tunnel', 'run', '--token', tunnelToken, '--url', `http://localhost:${PORT}`];
    
    tunnelProcess = spawn(cloudflaredPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false
    });
    
    let connectionCount = 0;
    const connectionMessages = [
      "✔ Connection established [1/4] - Establishing redundancy...",
      "✔ Connection established [2/4] - Building tunnel network...",
      "✔ Connection established [3/4] - Almost there...",
      "✔ Connection established [4/4] - Tunnel is fully active! 🚀"
    ];
    
    tunnelProcess.stderr.on('data', (data) => {
      const output = data.toString();
      
      // Skip harmless warnings
      const ignorePatterns = [
        'Cannot determine default origin certificate path',
        'No file cert.pem',
        'origincert option',
        'TUNNEL_ORIGIN_CERT',
        'context canceled',
        'failed to run the datagram handler',
        'Connection terminated',
        'Retrying connection'
      ];
      
      if (ignorePatterns.some(p => output.includes(p))) return;
      
      // Show connection progress
      if (output.includes('Registered tunnel connection')) {
        if (connectionCount < 4) {
          console.log(connectionMessages[connectionCount]);
          connectionCount++;
        }
        return;
      }
      
      // Show errors
      if (output.includes('ERR') || output.includes('error')) {
        console.error(`⚠️ Tunnel: ${output.trim()}`);
      }
    });
    
    tunnelProcess.on('close', async (code) => {
      if (code !== 0 && code !== null) {
        console.log(`⚠️ Tunnel process exited with code ${code}`);
      }
      tunnelInfo.connected = false;
      
      // Cleanup tunnel on nport backend
      if (tunnelId) {
        try {
          await axios.delete(NPORT_CONFIG.BACKEND_URL, {
            data: { subdomain, tunnelId }
          });
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      tunnelProcess = null;
    });
    
    tunnelProcess.on('error', (err) => {
      console.error(`❌ Failed to start tunnel: ${err.message}`);
      if (err.code === 'ENOENT') {
        console.log('💡 cloudflared not found.');
        console.log('   Download from: https://github.com/cloudflare/cloudflared/releases');
      }
      tunnelInfo.connected = false;
    });
    
  } catch (error) {
    if (error.response?.data?.error) {
      const errorMsg = error.response.data.error;
      if (errorMsg.includes('SUBDOMAIN_IN_USE') || errorMsg.includes('already in use')) {
        console.error(`❌ Subdomain "${subdomain}" is already in use!`);
        console.log(`💡 Try a different subdomain in Settings page.`);
      } else {
        console.error(`❌ Tunnel error: ${errorMsg}`);
      }
    } else {
      console.error(`❌ Tunnel error: ${error.message}`);
    }
  }
}

// Cleanup tunnel on shutdown
async function cleanupTunnel() {
  if (tunnelProcess) {
    tunnelProcess.kill();
  }
  
  if (tunnelId) {
    try {
      const axios = require('axios');
      const subdomain = getSubdomain();
      await axios.delete(NPORT_CONFIG.BACKEND_URL, {
        data: { subdomain, tunnelId }
      });
      console.log('✔ Tunnel cleanup successful.');
    } catch (e) {
      // Ignore
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await cleanupTunnel();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanupTunnel();
  process.exit(0);
});



app.listen(PORT, async () => {
  console.log('');
  console.log('============================================================');
  console.log('     VICAS Device Management System - Starting...           ');
  console.log('============================================================');
  console.log('');
  console.log(`[*] Local: http://localhost:${PORT}`);
  
  const isFirstTime = isFirstTimeSetup();
  const isElectron = process.env.ELECTRON_RUN_AS_NODE === '1';
  
  // Check if first-time setup
  if (isFirstTime) {
    console.log('');
    console.log('[!] First-time setup required!');
    console.log(`[>] Open: http://localhost:${PORT}/setup.html`);
    
    // Auto-open browser for first-time setup (not in Electron)
    if (!isElectron) {
      openBrowser(`http://localhost:${PORT}/setup.html`);
    }
  } else {
    console.log(`[i] Dashboard: http://localhost:${PORT}/dashboard.html`);
    
    // Auto-open browser to homepage (not in Electron)
    if (!isElectron) {
      openBrowser(`http://localhost:${PORT}`);
    }
  }
  
  // Initialize ZaloBot with database for persistent subscribers
  ZaloBot.init(db);
  
  const botInfo = await ZaloBot.testConnection();
  if (botInfo) {
    console.log(`[+] Zalo Bot connected: ${botInfo.account_name}`);
    ZaloBot.startPolling();
  } else {
    console.log(`[!] Zalo Bot chua ket noi. Kiem tra BOT_TOKEN.`);
  }
  
  // Only initialize tunnel if setup is complete (not first-time)
  if (!isFirstTime) {
    await initTunnel();
  } else {
    console.log('');
    console.log('[~] Tunnel se khoi dong sau khi hoan tat cai dat...');
  }
  
  console.log('');
  console.log('[*] Scheduled reports: Active');
  console.log('[OK] Server is ready!');
  console.log('');
  
  // System Tray disabled - native modules don't work well with pkg packaging
  // TODO: Consider alternative approaches like Electron or native Windows app wrapper
  console.log('[i] Tip: Dong cua so nay se dung server');
  console.log('    Mo browser: http://localhost:' + PORT);
});



