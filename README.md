# 🚀 Accio - AI-Powered Micro-Frontend Playground

A full-stack AI chatbot interface that allows authenticated users to generate and preview React components (JSX + CSS), save their sessions, and download the generated code. All chat history, code, and UI state are preserved across logins.

## ✨ Features

- **🤖 AI-Powered Code Generation**: Generate React components using GPT-4o-mini via OpenRouter
- **💬 Chat Interface**: Interactive chat with AI for component creation and modifications
- **👀 Live Preview**: Real-time preview of generated components in a sandboxed iframe
- **📝 Code Tabs**: Syntax-highlighted JSX and CSS code with copy/download functionality
- **💾 Session Management**: Save and restore chat sessions with generated code
- **🔐 Authentication**: Secure user authentication with JWT tokens
- **📦 Export Functionality**: Download components as ZIP files with all necessary files
- **🎨 Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** for SSR and routing
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Syntax Highlighter** for code display
- **JSZip** for file downloads

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose for data persistence
- **Redis** for session caching
- **JWT** for authentication
- **bcryptjs** for password hashing
- **OpenRouter API** for AI integration

### AI Integration
- **OpenRouter** for accessing GPT-4o-mini (free tier available)
- **Custom prompts** optimized for React component generation
- **Code extraction** from AI responses

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Redis (optional, for caching)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd accio_project
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 3. Environment Setup

#### Backend Environment
```bash
cd backend
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/accio_project

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI API Configuration (OpenRouter)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment
```bash
cd frontend
cp .env.example .env.local
```

### 4. Start Development Servers

#### Option 1: Start Both (Recommended)
```bash
# From root directory
npm run dev
```

#### Option 2: Start Separately
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
accio_project/
├── frontend/                 # Next.js frontend
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utilities and stores
│   └── package.json
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Database and Redis config
│   │   ├── middleware/     # Auth and validation
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── index.js        # Main server file
│   └── package.json
└── package.json            # Root package.json
```

## 🔧 Configuration

### OpenRouter API Setup
1. Sign up at [OpenRouter](https://openrouter.ai)
2. Get your API key from the dashboard
3. Add it to your backend `.env` file

### MongoDB Setup
- **Local**: Install MongoDB locally
- **Atlas**: Create a free cluster at MongoDB Atlas

### Redis Setup (Optional)
- **Local**: Install Redis locally
- **Cloud**: Use Redis Cloud or similar service

## 🎯 Usage

### 1. Authentication
- Register with email and password
- Login to access the playground

### 2. Session Management
- Create new sessions for different projects
- Switch between sessions seamlessly
- All data is automatically saved

### 3. AI Chat
- Describe the component you want to create
- AI generates JSX and CSS code
- Modify existing components with follow-up requests

### 4. Code Preview
- Live preview of generated components
- Sandboxed iframe for security
- Refresh button to update preview

### 5. Code Export
- Copy JSX or CSS individually
- Download complete component as ZIP
- Includes package.json and README

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Express-validator for API validation
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configured for production
- **Helmet**: Security headers

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Render/Railway)
```bash
cd backend
npm run build
# Deploy to Render or Railway
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use MongoDB Atlas for database
- Use Redis Cloud for caching
- Set proper CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Create an issue for bugs or feature requests
- Check the documentation for common issues
- Ensure all environment variables are properly set

## 🔮 Future Enhancements

- [ ] Component library with pre-built templates
- [ ] Real-time collaboration
- [ ] Advanced code editing with Monaco Editor
- [ ] Component testing integration
- [ ] Version control for sessions
- [ ] Team workspaces
- [ ] Advanced AI models support 