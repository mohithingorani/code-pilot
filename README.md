# CodePilot

A real-time collaborative code editor running in the browser with a built-in terminal.

## Features

- **Monaco Editor** - Full-featured code editor (same as VS Code)
- **Integrated Terminal** - xterm.js powered terminal with node-pty
- **Real-time Collaboration** - Share workspace via room codes
- **WebSocket Communication** - Live file sync between frontend and backend
- **Room-based Sessions** - Create/join rooms with unique codes
- **Multi-language Support** - Syntax highlighting for JS, Python, C++, Java, Markdown

## Tech Stack

- **Frontend**: Next.js 16, React 19, Monaco Editor, xterm.js, TailwindCSS 4
- **Backend**: Node.js, Express, WebSocket (ws), Prisma, node-pty
- **Database**: PostgreSQL (via Prisma)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (for production) or SQLite (for development)
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

The application will be available at:
- Frontend: http://localhost:3000
- Backend: ws://localhost:8080

### Environment Variables

**Frontend** (`.env`):
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/codepilot
PORT=8080
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-bucket
```

## Project Structure

```
CODE-PILOT/
├── frontend/                    # Next.js frontend application
│   ├── app/                  # App router pages
│   │   ├── editor/          # Main editor page
│   │   ├── join/           # Room join page
│   │   └── dashboard/       # User dashboard
│   ├── components/          # React components
│   │   ├── Terminal.tsx     # xterm.js terminal
│   │   ├── FileStructure.tsx  # File tree sidebar
│   │   └── HeadingTabs.tsx # Editor tabs
│   ├── hooks/              # Custom React hooks
│   │   └── websocket.ts    # WebSocket hook
│   └── public/             # Static assets (icons)
│
└── backend/                 # Node.js backend server
    ├── src/
    │   ├── app.ts          # Express app setup
    │   ├── server.ts       # WebSocket server
    │   ├── RepleManager.ts # REPL process manager
    │   ├── routes/        # API routes
    │   ├── controllers/  # Route controllers
    │   └── lib/          # Utilities
    ├── prisma/            # Database schema
    └── templates/         # Language templates
        ├── javascript/
        └── python/
```

## Architecture

### Frontend Flow

1. User creates a room or joins via room code
2. WebSocket connection established
3. Files synced from backend on connect
4. Monaco editor loads selected file
5. Terminal connects to backend pty
6. File changes debounced and synced via WebSocket

### Backend Components

- **WebSocket Server**: Handles WebSocket connections, room management
- **Process Manager**: Spawns node-pty processes for terminal
- **File Sync**: Broadcasts file changes to room participants
- **S3 Integration**: Stores project files in AWS S3 (optional)

## API Reference

### WebSocket Messages

**Client → Server**:
```json
{ "type": "files", "payload": { "files": [...] } }
{ "type": "terminal", "payload": { "data": "..." } }
{ "type": "join", "payload": { "roomId": "..." } }
```

**Server → Client**:
```json
{ "type": "files", "payload": { "files": [...] } }
{ "type": "terminal", "payload": { "data": "..." } }
```

### REST Endpoints

- `POST /api/user/signup` - Create new user
- `POST /api/user/login` - Authenticate user
- `POST /api/user/rooms` - Create new room
- `GET /api/user/rooms/:id` - Get room details

## Language Templates

### JavaScript
```javascript
console.log("Hello, World!");
```

### Python
```python
print("Hello, World!")
```

## Development

### Building

```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

### Running Tests

```bash
cd backend && npm test
```

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines first.