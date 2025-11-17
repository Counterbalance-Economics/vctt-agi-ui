#!/bin/bash
# Add scripts to package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.type = 'module';
pkg.version = '1.0.0';
pkg.scripts = {
  dev: 'vite',
  build: 'tsc && vite build',
  preview: 'vite preview'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"
