const { execSync } = require('child_process');

console.log('🔨 Building application...');

try {
  // Build frontend
  console.log('Building frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });

  // Build Electron app
  console.log('Building Electron app...');
  execSync('npm run build:electron', { stdio: 'inherit' });

  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
