const { execSync } = require('child_process');

console.log('🔨 Building application...');

try {
  // Install frontend dependencies if needed
  console.log('Checking frontend dependencies...');
  try {
    execSync('cd frontend && npm ci --include=dev', { stdio: 'inherit' });
  } catch (e) {
    console.log('Frontend dependencies already installed or error:', e.message);
  }

  // Build frontend
  console.log('Building frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });

  // Build Electron app (skip if not needed)
  if (process.env.BUILD_ELECTRON !== 'false') {
    console.log('Building Electron app...');
    try {
      execSync('npm run build:electron', { stdio: 'inherit' });
    } catch (e) {
      console.log('Skipping Electron build:', e.message);
    }
  }

  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
