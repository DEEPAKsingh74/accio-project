#!/bin/bash

echo "🚀 Setting up Accio AI-Powered Micro-Frontend Playground"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create environment files
echo "🔧 Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration"
else
    echo "✅ Backend .env already exists"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend .env.local file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > frontend/.env.local
    echo "✅ Frontend .env.local created"
else
    echo "✅ Frontend .env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your configuration:"
echo "   - MongoDB URI"
echo "   - JWT Secret"
echo "   - OpenRouter API Key"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo ""
echo "📚 For more information, see README.md" 