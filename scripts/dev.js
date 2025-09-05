#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

// Development script to handle common issues
console.log('🚀 Starting Storify development server...')

const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
})

devProcess.on('close', (code) => {
  console.log(`Development server exited with code ${code}`)
})

devProcess.on('error', (error) => {
  console.error('Failed to start development server:', error)
  process.exit(1)
})
