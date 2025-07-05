const { spawn } = require('child_process');
const path = require('path');

console.log('Starting OddsGetter Application...\n');

// Start the backend server
console.log('Starting backend server on port 5000...');
const backend = spawn('npm', ['run', 'server'], {
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start, then start frontend
setTimeout(() => {
  console.log('\nStarting frontend server on port 3000...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (error) => {
    console.error('Frontend error:', error);
  });
}, 2000);

backend.on('error', (error) => {
  console.error('Backend error:', error);
});

process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  backend.kill();
  process.exit();
}); 