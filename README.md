# CodePilot

A modern online IDE for real-time collaborative code editing with project management and a built-in terminal.

## Features

- **Monaco Editor** - Full-featured code editor (same as VS Code)
- **Integrated Terminal** - xterm.js powered terminal with node-pty
- **Real-time Collaboration** - Work together via room codes
- **Project Management** - Create, edit, clone, delete, and export projects
- **Grid & List Views** - Switch between dashboard display modes
- **Sort & Filter** - Organize projects by name, date, or status
- **Multi-language Support** - JavaScript, TypeScript, Python, Java, C++, Markdown
- **S3 File Storage** - Project files stored securely in AWS S3
- **Dark Theme** - Modern, sleek dark interface

## Tech Stack

- **Frontend**: Next.js 16, React 19, Monaco Editor, xterm.js, TailwindCSS 4
- **Backend**: Node.js, Express, WebSocket (ws), Prisma, node-pty
- **Database**: PostgreSQL (via Prisma)
- **Storage**: AWS S3 (Cloudflare R2 compatible)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- AWS S3 or Cloudflare R2 account
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
- Backend API: http://localhost:8080

### Environment Variables

**Frontend** (`.env`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/codepilot
PORT=8080
JWT_SECRET=your-secret-key
endpoint=your-r2-endpoint
accessKeyId=your-access-key
secretAccessKey=your-secret-key
```

## Project Structure

```
CODE-PILOT/
├── frontend/                    # Next.js frontend application
│   ├── app/
│   │   ├── editor/             # Monaco editor page
│   │   ├── join/               # Login/signup page
│   │   └── dashboard/          # Project dashboard
│   ├── components/             # React components
│   │   └── FileStructure.tsx   # File tree sidebar
│   └── hooks/
│       └── websocket.ts        # WebSocket hook
│
└── backend/                     # Node.js backend server
    ├── src/
    │   ├── app.ts              # Express app
    │   ├── server.ts           # Server entry point
    │   ├── RepleManager.ts     # REPL process manager
    │   ├── routes/            # API routes
    │   └── lib/               # Utilities (Prisma)
    ├── prisma/
    │   └── schema.prisma       # Database schema
    └── templates/             # Language templates
        ├── typescript/
        ├── javascript/
        ├── python/
        ├── java/
        ├── cpp/
        └── markdown/
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/clone` - Clone project
- `GET /api/projects/:id/export` - Export as ZIP

### Users
- `POST /api/users/signup` - Create account
- `POST /api/users/login` - Sign in

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:id` - Get room details

## WebSocket Messages

**Client → Server**:
```json
{ "type": "files", "files": [...] }
{ "type": "terminal", "data": "command" }
{ "type": "join", "roomId": "room-code" }
```

**Server → Client**:
```json
{ "type": "files", "files": [...] }
{ "type": "terminal", "data": "output" }
{ "type": "run", "output": "..." }
```

## Development

```bash
# Build frontend
cd frontend && npm run build

# Type check backend
cd backend && npx tsc --noEmit

# Run migrations
cd backend && npx prisma migrate dev
```

## License

MIT