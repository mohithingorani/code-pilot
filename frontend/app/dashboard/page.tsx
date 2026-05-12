"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import SettingsModal from "@/components/SettingsModal";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: string;
  name: string;
  description: string | null;
  language: string;
  status: "active" | "idle";
  fileCount: number;
  createdAt: string;
  lastEditedAt: string;
}

const LANGUAGES = [
  { name: "JavaScript", icon: "/file-icons/js.svg", color: "#F7DF1E" },
  { name: "TypeScript", icon: "/file-icons/js.svg", color: "#3178C6" },
  { name: "Python", icon: "/file-icons/py.svg", color: "#3776AB" },
  { name: "Java", icon: "/file-icons/java.svg", color: "#ED8B00" },
  { name: "C++", icon: "/file-icons/cpp.svg", color: "#00599C" },
  { name: "Markdown", icon: "/file-icons/md.svg", color: "#083FA1" },
];

const getLanguageStyle = (lang: string) => {
  const language = LANGUAGES.find(l => l.name.toLowerCase() === lang.toLowerCase());
  return language || { color: "#888" };
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "idle">("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"lastEditedAt" | "name" | "createdAt">("lastEditedAt");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { settings: dashboardSettings, updateSettings } = useDashboardSettings();
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/users/me");
        setUserEmail(res.data.email || "");
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/join");
      return;
    }
    fetchProjects();
  }, [sortBy, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("sort", sortBy);
      const res = await api.get(`/api/projects?${params.toString()}`);
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNewProject(false);
        setShowSettings(false);
        setShowEditModal(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName || !selectedLanguage) return;
    try {
      const res = await api.post(`/api/projects`, {
        name: newProjectName,
        description: newProjectDesc,
        language: selectedLanguage,
      });
      setProjects([res.data, ...projects]);
      setNewProjectName("");
      setNewProjectDesc("");
      setSelectedLanguage("");
      setShowNewProject(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEditProject = async () => {
    if (!editingProject || !editName.trim()) return;
    try {
      const res = await api.put(`/api/projects/${editingProject.id}`, {
        name: editName,
        description: editDesc,
      });
      setProjects(projects.map((p) => (p.id === res.data.id ? res.data : p)));
      setShowEditModal(false);
      setEditingProject(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleCloneProject = async (id: string) => {
    try {
      const res = await api.post(`/api/projects/${id}/clone`);
      setProjects([res.data, ...projects]);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error cloning project:", error);
    }
  };

  const handleExport = async (id: string, name: string) => {
    try {
      const response = await api.get(`/api/projects/${id}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error exporting project:", error);
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDesc(project.description || "");
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen text-white selection:bg-white/20 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-[#0f0f0f] via-black to-black" />
        <div className="absolute -top-24 -right-24 w-[320px] h-80 sm:w-130 sm:h-130 lg:w-150 lg:h-150 bg-white/4 sm:bg-white/5 rounded-full blur-[90px] sm:blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-70 h-70 sm:w-110 sm:h-110 lg:w-125 lg:h-125 bg-white/3 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            />
            <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-black/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
              <Sidebar onOpenSettings={() => { setShowSettings(true); setSidebarOpen(false); }} />
            </div>
          </div>
        )}

        <div className="hidden lg:flex w-64 bg-black/30 backdrop-blur-xl border-r border-white/5 flex-col">
          <Sidebar onOpenSettings={() => setShowSettings(true)} />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-black/20 backdrop-blur-xl border-b border-white/5 px-3 sm:px-5 py-2.5">
            <div className="sm:hidden flex items-center justify-between gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition"
                aria-label="Open sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <line x1={4} y1={6} x2={20} y2={6} />
                  <line x1={4} y1={12} x2={20} y2={12} />
                  <line x1={4} y1={18} x2={20} y2={18} />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx={12} cy={12} r={3} />
                  </svg>
                </button>

                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition"
                >
                  <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                    <span className="text-white/60 text-xs font-medium">{userEmail ? userEmail[0].toUpperCase() : ""}</span>
                  </div>
                </button>

                <div className="relative" ref={userMenuRef}>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-2 top-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-xl py-2 w-56 shadow-xl z-50"
                      >
                        <div className="px-4 py-2 border-b border-white/5">
                          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.removeItem("token");
                            router.replace("/");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1={21} x2={9} y1={12} y2={12} />
                          </svg>
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="mt-2 sm:hidden flex items-center gap-2">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <circle cx={11} cy={11} r={8} />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
              >
                <option  value="lastEditedAt">Edited</option>
                <option value="name">Name</option>
                <option value="createdAt">Created</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 max-w-sm">
                <div className="relative flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <circle cx={11} cy={11} r={8} />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="lastEditedAt">Last Edited</option>
                  <option value="name">Name</option>
                  <option value="createdAt">Created</option>
                </select>

                <button
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition"
                  title={viewMode === "grid" ? "List view" : "Grid view"}
                >
                  {viewMode === "grid" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <line x1={8} y1={6} x2={21} y2={6} />
                      <line x1={8} y1={12} x2={21} y2={12} />
                      <line x1={8} y1={18} x2={21} y2={18} />
                      <line x1={3} y1={6} x2={3.01} y2={6} />
                      <line x1={3} y1={12} x2={3.01} y2={12} />
                      <line x1={3} y1={18} x2={3.01} y2={18} />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <rect x={3} y={3} width={7} height={7} />
                      <rect x={14} y={3} width={7} height={7} />
                      <rect x={14} y={14} width={7} height={7} />
                      <rect x={3} y={14} width={7} height={7} />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-white">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx={12} cy={12} r={3} />
                  </svg>
                </button>

                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition"
                >
                  <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                    <span className="text-white/60 text-xs font-medium">{userEmail ? userEmail[0].toUpperCase() : ""}</span>
                  </div>
                </button>

                <div className="relative" ref={userMenuRef}>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-2 top-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-xl py-2 w-56 shadow-xl z-50"
                      >
                        <div className="px-4 py-2 border-b border-white/5">
                          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.removeItem("token");
                            router.replace("/");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1={21} x2={9} y1={12} y2={12} />
                          </svg>
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-white">Your Projects</h1>
                <p className="text-gray-500 text-sm">{projects.length} projects</p>
              </div>
              <button
                onClick={() => setShowNewProject(true)}
                className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                New Project
              </button>
            </div>

            <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap shrink-0 ${
                  filterStatus === "all" ? "bg-white text-black" : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap shrink-0 ${
                  filterStatus === "active" ? "bg-white text-black" : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("idle")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap shrink-0 ${
                  filterStatus === "idle" ? "bg-white text-black" : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                Idle
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50%] text-gray-500">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-xl bg-white/[0.05] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">No projects found</p>
                <p className="text-gray-500 text-center text-xs max-w-xs mb-5">{searchQuery || filterStatus !== "all" ? "No projects match your search criteria" : "Create your first project to start coding"}</p>
                {!searchQuery && filterStatus === "all" && (
                  <button
                    onClick={() => setShowNewProject(true)}
                    className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Create Project
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpenMenu={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                    isMenuOpen={openMenuId === project.id}
                    onEdit={() => openEditModal(project)}
                    onClone={() => handleCloneProject(project.id)}
                    onDelete={() => handleDeleteProject(project.id)}
                    onExport={() => handleExport(project.id, project.name)}
                    onOpen={() => router.push(`/editor/${project.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredProjects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    onOpenMenu={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                    isMenuOpen={openMenuId === project.id}
                    onEdit={() => openEditModal(project)}
                    onClone={() => handleCloneProject(project.id)}
                    onDelete={() => handleDeleteProject(project.id)}
                    onExport={() => handleExport(project.id, project.name)}
                    onOpen={() => router.push(`/editor/${project.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-base font-medium text-white">Create New Project</h2>
              <p className="text-gray-500 text-xs mt-0.5">Start a new coding project</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Project Name</label>
                <input
                  type="text"
                  placeholder="My Awesome Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Brief description of your project"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Select Language</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.name}
                      onClick={() => setSelectedLanguage(lang.name)}
                      className={`p-3 rounded-lg border transition flex flex-col items-center gap-1.5 ${
                        selectedLanguage === lang.name ? "border-white/30 bg-white/[0.06]" : "border-white/[0.06] hover:border-white/[0.15]"
                      }`}
                    >
                      <div className="w-6 h-6 rounded bg-white/[0.05] flex items-center justify-center">
                        <Image src={lang.icon} width={14} height={14} alt={lang.name} />
                      </div>
                      <span className={`text-[10px] ${selectedLanguage === lang.name ? "text-white/80" : "text-gray-500"}`}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-white/5 flex gap-2">
              <button
                onClick={() => setShowNewProject(false)}
                className="flex-1 px-3 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName || !selectedLanguage}
                className="flex-1 px-3 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-base font-medium text-white">Edit Project</h2>
              <p className="text-gray-500 text-xs mt-0.5">Update project details</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Project Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition"
                />
              </div>
            </div>
            <div className="p-4 border-t border-white/5 flex gap-2">
              <button
                onClick={() => { setShowEditModal(false); setEditingProject(null); }}
                className="flex-1 px-3 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProject}
                disabled={!editName.trim()}
                className="flex-1 px-3 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={dashboardSettings}
        onUpdate={updateSettings}
      />
    </div>
  );
}

function ProjectCard({ project, onOpenMenu, isMenuOpen, onEdit, onClone, onDelete, onExport, onOpen }: {
  project: Project; onOpenMenu: () => void; isMenuOpen: boolean; onEdit: () => void; onClone: () => void;
  onDelete: () => void; onExport: () => void; onOpen: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onOpenMenu();
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div 
      onClick={onOpen}
      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-150 cursor-pointer group relative"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center overflow-hidden">
          <span className="text-lg font-medium text-white/80">{project.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); onOpenMenu(); }} className="p-1.5 rounded hover:bg-white/5 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-gray-500">
              <circle cx={12} cy={12} r={1} /><circle cx={19} cy={12} r={1} /><circle cx={5} cy={12} r={1} />
            </svg>
          </button>
          {isMenuOpen && (
            <div ref={menuRef} className="absolute right-4 top-14 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl py-1 min-w-40 shadow-xl">
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                Edit
              </button>
              <button onClick={(e) => { e.stopPropagation(); onClone(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect width={14} height={14} x={8} y={8} rx={2} /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                Duplicate
              </button>
              <button onClick={(e) => { e.stopPropagation(); onExport(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1={12} x2={12} y1={15} y2={3} /></svg>
                Export ZIP
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="text-white font-medium text-sm truncate">{project.name}</h3>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] shrink-0 ${project.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"}`}>
          {project.status === "active" && (
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
          )}
          {project.status}
        </span>
      </div>
      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{project.description || "No description"}</p>
      <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-2.5 border-t border-white/[0.05]">
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          </svg>
          {project.fileCount} files
        </span>
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          {formatRelativeTime(project.lastEditedAt)}
        </span>
        <span className="ml-auto text-white/40">{project.language}</span>
      </div>
    </div>
  );
}

function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <>
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-black font-semibold text-sm">C</span>
          </div>
          <div>
            <span className="text-white text-sm font-medium block">Code Pilot</span>
            <span className="text-gray-500 text-[10px]">Online IDE</span>
          </div>
        </div>
      </div>
      <div className="p-2 space-y-0.5">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md bg-white/10 text-white text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
            <path d="M14 12h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
            <path d="M2 4v4a2 2 0 0 0 2 2h6" />
            <path d="M14 4v4a2 2 0 0 0 2 2h6" />
          </svg>
          Projects
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10} /><path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
          Explore
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx={9} cy={7} r={4} /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Team
        </button>
      </div>
      <div className="flex-1" />
      <div className="p-2 border-t border-white/5 space-y-0.5">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} />
          </svg>
          Account
        </button>
        <button onClick={onOpenSettings} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect width={18} height={18} x={3} y={3} rx={2} ry={2} /><circle cx={9} cy={9} r={1} /><circle cx={15} cy={9} r={1} /><circle cx={9} cy={15} r={1} /><circle cx={15} cy={15} r={1} />
          </svg>
          Preferences
        </button>
      </div>
    </>
  );
}

function ProjectListItem({ project, onOpenMenu, isMenuOpen, onEdit, onClone, onDelete, onExport, onOpen }: {
  project: Project; onOpenMenu: () => void; isMenuOpen: boolean; onEdit: () => void; onClone: () => void;
  onDelete: () => void; onExport: () => void; onOpen: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onOpenMenu();
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div 
      onClick={onOpen}
      className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-150 cursor-pointer group flex items-center gap-3 relative"
    >
      <div className="w-8 h-8 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
        <span className="text-sm font-medium text-white/80">{project.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm truncate">{project.name}</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] shrink-0 ${project.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"}`}>
            {project.status === "active" && (
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
            )}
            {project.status}
          </span>
        </div>
        <p className="text-gray-500 text-xs truncate">{project.description || "No description"}</p>
      </div>
      <span className="hidden sm:inline text-gray-500 text-xs shrink-0 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        </svg>
        {project.fileCount}
      </span>
      <span className="hidden md:inline text-gray-500 text-xs shrink-0">{formatRelativeTime(project.lastEditedAt)}</span>
      <span className="hidden lg:inline text-xs shrink-0 text-white/40">{project.language}</span>
      <button onClick={(e) => { e.stopPropagation(); onOpenMenu(); }} className="p-1.5 rounded hover:bg-white/5 transition shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-gray-500">
          <circle cx={12} cy={12} r={1} /><circle cx={19} cy={12} r={1} /><circle cx={5} cy={12} r={1} />
        </svg>
      </button>
      {isMenuOpen && (
        <div ref={menuRef} className="absolute right-4 top-full z-50 bg-[#1a1a1a] border border-white/10 rounded-xl py-1 min-w-40 shadow-xl mt-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
            Edit
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClone(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect width={14} height={14} x={8} y={8} rx={2} /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
            Duplicate
          </button>
          <button onClick={(e) => { e.stopPropagation(); onExport(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1={12} x2={12} y1={15} y2={3} /></svg>
            Export ZIP
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}