#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Run TypeScript compiler to check for type errors across the project.
# This ensures that all components and hooks are correctly typed and integrated.
# It catches errors like missing props, incorrect types, or undefined variables.
echo "Checking TypeScript..."
npm exec tsc -- -b

# Run the full build process (TypeScript + Vite build).
# This verifies that the project can be successfully bundled for production
# and that all assets (images, styles, etc.) are correctly referenced.
echo "Running full build..."
npm run build