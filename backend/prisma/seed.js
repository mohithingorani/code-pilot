"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const connectionString = process.env.DATABASE_URL;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log("Seeding database...");
    // Create demo user
    const user = await prisma.user.upsert({
        where: { email: "demo@codepilot.com" },
        update: {},
        create: {
            email: "demo@codepilot.com",
            name: "Demo User",
            password: "hashed_password_placeholder",
        },
    });
    console.log("Created user:", user.id);
    // Create projects
    const projects = await Promise.all([
        prisma.project.upsert({
            where: { id: "proj-1" },
            update: {},
            create: {
                id: "proj-1",
                name: "Portfolio Website",
                description: "Personal portfolio built with Next.js and TypeScript",
                language: "TypeScript",
                status: "active",
                ownerId: user.id,
            },
        }),
        prisma.project.upsert({
            where: { id: "proj-2" },
            update: {},
            create: {
                id: "proj-2",
                name: "API Backend",
                description: "REST API with authentication and database",
                language: "Python",
                status: "idle",
                ownerId: user.id,
            },
        }),
        prisma.project.upsert({
            where: { id: "proj-3" },
            update: {},
            create: {
                id: "proj-3",
                name: "Mobile App",
                description: "React Native mobile application",
                language: "JavaScript",
                status: "idle",
                ownerId: user.id,
            },
        }),
        prisma.project.upsert({
            where: { id: "proj-4" },
            update: {},
            create: {
                id: "proj-4",
                name: "Data Scraper",
                description: "Web scraping automation tool with Python",
                language: "Python",
                status: "idle",
                ownerId: user.id,
            },
        }),
    ]);
    console.log("Created projects:", projects.length);
    // Create files for Portfolio project
    const files = await Promise.all([
        prisma.file.upsert({
            where: { projectId_path: { projectId: "proj-1", path: "src/pages/index.tsx" } },
            update: {},
            create: {
                name: "index.tsx",
                path: "src/pages/index.tsx",
                content: `export default function Home() {
  return (
    <div>
      <h1>Welcome to my Portfolio</h1>
    </div>
  );
}`,
                language: "typescript",
                projectId: "proj-1",
            },
        }),
        prisma.file.upsert({
            where: { projectId_path: { projectId: "proj-1", path: "src/app/layout.tsx" } },
            update: {},
            create: {
                name: "layout.tsx",
                path: "src/app/layout.tsx",
                content: `export default function Layout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}`,
                language: "typescript",
                projectId: "proj-1",
            },
        }),
        prisma.file.upsert({
            where: { projectId_path: { projectId: "proj-1", path: "styles/globals.css" } },
            update: {},
            create: {
                name: "globals.css",
                path: "styles/globals.css",
                content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}`,
                language: "css",
                projectId: "proj-1",
            },
        }),
    ]);
    console.log("Created files:", files.length);
    // Create user settings
    await prisma.userSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            darkMode: true,
            notifications: false,
            autoSave: true,
            twoFactor: false,
        },
    });
    console.log("Created user settings");
    console.log("Seeding complete!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
