#!/bin/bash
set -e

echo "Building client..."
vite build --outDir dist/public --emptyOutDir

echo "Building server..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

echo "Build complete!"
echo "Client files are in: dist/public/"
echo "Server file is: dist/index.js"
