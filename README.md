# CodePilot

A modern online IDE with real-time code editing, integrated terminal, and project management.

![System Architecture](assets/system-architecture.jpg)

## Features

- **Monaco Editor** - Full-featured code editing with syntax highlighting, IntelliSense, and debugging support
- **Integrated Terminal** - xterm.js powered terminal with Docker-based language execution
- **Project Management** - Create, edit, clone, delete, and export projects as ZIP
- **Multi-language Support** - Python, JavaScript, TypeScript, Java, C++, Markdown
- **Dark Theme** - Sleek dark interface designed for focused coding

## Tech Stack

- **Frontend**: Next.js 16, React 19, Monaco Editor, xterm.js, Tailwind CSS 4
- **Backend**: Node.js, Express, WebSocket (ws), Prisma, node-pty
- **Database**: PostgreSQL
- **Storage**: AWS S3 / Cloudflare R2

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- Docker
- AWS S3 or Cloudflare R2 account

### Installation

```bash
# Install dependencies
cd frontend && npm install
cd backend && npm install

# Configure environment variables (see below)
```

### Environment Variables

**Frontend** (`frontend/.env`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/codepilot
PORT=8080
JWT_SECRET=your-secret-key
endpoint=your-r2-endpoint
accessKeyId=your-access-key
secretAccessKey=your-secret-key
```

### Running

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## Project Structure

```
CODE-PILOT/
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── editor/[id]/    # Monaco editor page
│   │   ├── join/           # Authentication page
│   │   └── dashboard/      # Project dashboard
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── constants/          # App constants
│   └── utils/              # Utility functions
│
└── backend/                 # Node.js backend
    ├── src/
    │   ├── server.ts       # WebSocket server
    │   ├── RepleManager.ts # Terminal process manager
    │   ├── routes/         # API routes
    │   └── lib/            # Utilities
    ├── prisma/
    │   └── schema.prisma   # Database schema
    └── templates/          # Language templates
```

## Supported Languages

| Language | Command |
|----------|---------|
| Python | `python3` |
| JavaScript | `node` |
| TypeScript | `ts-node` |
| Java | `javac && java` |
| C++ | `g++ && ./a.out` |
| Markdown | `cat` |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save file |
| `Ctrl+Enter` | Run code |
| `Ctrl+F` | Find |
| `Ctrl+H` | Find & Replace |
| `Ctrl+Shift+L` | Toggle minimap |
| `Ctrl+K Ctrl+M` | Show shortcuts |

## Development

```bash
# Build frontend for production
cd frontend && npm run build

# Type check backend
cd backend && npx tsc --noEmit

# Run database migrations
cd backend && npx prisma migrate dev
```