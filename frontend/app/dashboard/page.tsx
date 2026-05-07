"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  lastEdited: string;
  status: "active" | "idle";
  files: number;
}

const LANGUAGES = [
  { name: "JavaScript", icon: "/file-icons/js.svg", color: "#F7DF1E" },
  { name: "TypeScript", icon: "/file-icons/js.svg", color: "#3178C6" },
  { name: "Python", icon: "/file-icons/py.svg", color: "#3776AB" },
  { name: "Java", icon: "/file-icons/java.svg", color: "#ED8B00" },
  { name: "C++", icon: "/file-icons/cpp.svg", color: "#00599C" },
  { name: "Markdown", icon: "/file-icons/md.svg", color: "#083FA1" },
];

const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "Portfolio Website", description: "Personal portfolio built with Next.js", language: "TypeScript", lastEdited: "2 hours ago", status: "active", files: 12 },
  { id: "2", name: "API Backend", description: "REST API with authentication", language: "Python", lastEdited: "1 day ago", status: "idle", files: 8 },
  { id: "3", name: "Mobile App", description: "React Native mobile application", language: "JavaScript", lastEdited: "3 days ago", status: "idle", files: 24 },
  { id: "4", name: "Data Scraper", description: "Web scraping automation tool", language: "Python", lastEdited: "1 week ago", status: "idle", files: 5 },
];

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "idle">("all");

  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: false,
    autoSave: true,
    twoFactor: false,
  });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      (document.documentElement as any).style.setProperty("--mouse-x", `${e.clientX}px`);
      (document.documentElement as any).style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.language.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = () => {
    if (!newProjectName || !selectedLanguage) return;
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDesc || "No description",
      language: selectedLanguage,
      lastEdited: "Just now",
      status: "active",
      files: 0,
    };
    setProjects([newProject, ...projects]);
    setNewProjectName("");
    setNewProjectDesc("");
    setSelectedLanguage("");
    setShowNewProject(false);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="min-h-screen text-white selection:bg-white/20">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-black to-black" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/3 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/5 flex flex-col">
          {/* Logo */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-lg">C</span>
              </div>
              <div>
                <span className="text-white font-semibold block leading-tight">Code Pilot</span>
                <span className="text-gray-500 text-xs">Online IDE</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
                <path d="M14 12h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
                <path d="M2 4v4a2 2 0 0 0 2 2h6" />
                <path d="M14 4v4a2 2 0 0 0 2 2h6" />
              </svg>
              Projects
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx={12} cy={12} r={10} />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Explore
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx={9} cy={7} r={4} />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Team
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/5 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx={12} cy={7} r={4} />
              </svg>
              Account
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect width={18} height={18} x={3} y={3} rx={2} ry={2} />
                <circle cx={9} cy={9} r={1} />
                <circle cx={15} cy={9} r={1} />
                <circle cx={9} cy={15} r={1} />
                <circle cx={15} cy={15} r={1} />
              </svg>
              Preferences
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-16 bg-black/20 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <circle cx={11} cy={11} r={8} />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition text-sm"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition group">
                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx={12} cy={12} r={3} />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <span className="text-black font-semibold">M</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-white mb-1">Your Projects</h1>
                <p className="text-gray-500 text-sm">{projects.length} projects total</p>
              </div>
              <button
                onClick={() => setShowNewProject(true)}
                className="bg-white hover:bg-gray-100 text-black px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                New Project
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              {(["all", "active", "idle"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterStatus === status
                      ? "bg-white text-black"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50%] text-gray-500">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-400 mb-1">No projects found</p>
                <p className="text-sm">Create your first project to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                        {(() => {
                          const lang = LANGUAGES.find(l => l.name === project.language);
                          return lang ? (
                            <Image src={lang.icon} width={28} height={28} alt={project.language} />
                          ) : (
                            <span className="text-2xl font-bold text-white">C</span>
                          );
                        })()}
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        project.status === "active" 
                          ? "bg-white/10 text-white" 
                          : "bg-white/5 text-gray-500"
                      }`}>
                        {project.status === "active" ? "Active" : "Idle"}
                      </div>
                    </div>
                    <h3 className="text-white font-medium text-lg mb-1 group-hover:text-white transition">{project.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-1">{project.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{project.language}</span>
                      <span className="text-gray-600">Edited {project.lastEdited}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-semibold text-white">Create New Project</h2>
              <p className="text-gray-500 text-sm mt-1">Start a new coding adventure</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-gray-400 text-sm mb-2.5 block">Project Name</label>
                <input
                  type="text"
                  placeholder="My Awesome Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2.5 block">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Brief description of your project"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2.5 block">Select Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.name}
                      onClick={() => setSelectedLanguage(lang.name)}
                      className={`p-4 rounded-xl border transition flex flex-col items-center gap-2 ${
                        selectedLanguage === lang.name
                          ? "border-white bg-white/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <Image src={lang.icon} width={28} height={28} alt={lang.name} />
                      <span className="text-xs text-gray-400">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex gap-3">
              <button
                onClick={() => setShowNewProject(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName || !selectedLanguage}
                className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">Settings</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your preferences</p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2.5 rounded-xl hover:bg-white/5 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-1">
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition">
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-gray-500 text-sm">Always use dark theme</p>
                </div>
                <button
                  onClick={() => toggleSetting("darkMode")}
                  className={`w-14 h-8 rounded-full relative transition ${settings.darkMode ? "bg-white" : "bg-gray-600"}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-black rounded-full transition-all ${settings.darkMode ? "right-1" : "left-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition">
                <div>
                  <p className="text-white font-medium">Notifications</p>
                  <p className="text-gray-500 text-sm">Receive project update alerts</p>
                </div>
                <button
                  onClick={() => toggleSetting("notifications")}
                  className={`w-14 h-8 rounded-full relative transition ${settings.notifications ? "bg-white" : "bg-gray-600"}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-black rounded-full transition-all ${settings.notifications ? "right-1" : "left-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition">
                <div>
                  <p className="text-white font-medium">Auto Save</p>
                  <p className="text-gray-500 text-sm">Automatically save your changes</p>
                </div>
                <button
                  onClick={() => toggleSetting("autoSave")}
                  className={`w-14 h-8 rounded-full relative transition ${settings.autoSave ? "bg-white" : "bg-gray-600"}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-black rounded-full transition-all ${settings.autoSave ? "right-1" : "left-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-gray-500 text-sm">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => toggleSetting("twoFactor")}
                  className={`w-14 h-8 rounded-full relative transition ${settings.twoFactor ? "bg-white" : "bg-gray-600"}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-black rounded-full transition-all ${settings.twoFactor ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex gap-3">
              <button className="flex-1 px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition font-medium">
                Sign Out
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}