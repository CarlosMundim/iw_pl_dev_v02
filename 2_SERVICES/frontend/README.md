# Frontend Service

## Overview
Main user interface for the iWORKZ platform built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library

## Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Key Features
- Responsive design for all screen sizes
- Server-side rendering for optimal SEO
- Real-time updates via WebSocket
- Progressive Web App capabilities
- Multi-language support (i18n)

## Project Structure
```
frontend/
├── src/
│   ├── app/           # App Router pages
│   ├── components/    # Reusable components
│   ├── lib/          # Utilities and configurations
│   ├── hooks/        # Custom React hooks
│   ├── store/        # State management
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── tests/           # Test files
```

## Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode