# CodePilot

A real-time collaborative code editor running in the browser with a built-in terminal.

## Features

- **Monaco Editor** - Full-featured code editor (same as VS Code)
- **Integrated Terminal** - xterm.js powered terminal
- **Real-time Collaboration** - Share workspace via room codes
- **WebSocket Communication** - Live file sync between frontend and backend

## Tech Stack

- **Frontend**: Next.js, React, Monaco Editor, xterm.js
- **Backend**: Node.js, WebSocket, Prisma

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd backend && npm install
```

### Running the Development Servers

```bash
# Terminal 1 - Start backend
cd backend && npm run dev

# Terminal 2 - Start frontend
cd frontend && npm run dev
```

### Environment Variables

**Frontend** (`.env`):
```
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**Backend** (`.env`):
```
DATABASE_URL=file:./dev.db
PORT=8080
```

## Project Structure

```
CODE-PILOT/
├── frontend/           # Next.js frontend application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── hooks/        # Custom React hooks
│   └── public/      # Static assets
│
└── backend/          # Node.js backend server
    ├── src/         # Source code
    ├── prisma/      # Database schema
    └── templates/   # Project templates
```

## License

MIT