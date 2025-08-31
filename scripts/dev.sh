#!/bin/bash

# Development script for OctoBar
echo "🚀 Starting OctoBar development..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if dist directory exists for main process
if [ ! -d "dist" ]; then
    echo "🔨 Building main process..."
    npm run build:main
fi

# Start development
echo "🔥 Starting development server..."
npm run dev
