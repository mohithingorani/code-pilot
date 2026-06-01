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

  const activeCount = projects.filter((p) => p.status === "active").length;

  const inputCls =
    "w-full bg-paper/5 border border-paper/15 px-3 py-2 font-mono text-sm text-paper placeholder-paper/30 focus:outline-none focus:border-acid/60 transition";
  const iconBtnCls =
    "p-2 border border-paper/15 bg-paper/5 hover:border-paper/30 hover:text-acid text-paper/60 transition-colors";

  return (
    <div className="min-h-screen text-paper selection:bg-acid selection:text-ink overflow-x-hidden">
      {/* backdrop */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-ink" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ece9e1 1px, transparent 1px), linear-gradient(to bottom, #ece9e1 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] bg-acid/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            />
            <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-[#070707] border-r border-paper/10 flex flex-col">
              <Sidebar onOpenSettings={() => { setShowSettings(true); setSidebarOpen(false); }} />
            </div>
          </div>
        )}

        {/* desktop sidebar */}
        <div className="hidden lg:flex w-60 bg-[#070707] border-r border-paper/10 flex-col">
          <Sidebar onOpenSettings={() => setShowSettings(true)} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* top bar */}
          <div className="bg-ink/80 backdrop-blur-xl border-b border-paper/10 px-3 sm:px-5 py-3">
            {/* mobile row */}
            <div className="sm:hidden flex items-center justify-between gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className={iconBtnCls}
                aria-label="Open sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1={4} y1={6} x2={20} y2={6} />
                  <line x1={4} y1={12} x2={20} y2={12} />
                  <line x1={4} y1={18} x2={20} y2={18} />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <button onClick={() => setShowSettings(true)} className={iconBtnCls}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx={12} cy={12} r={3} />
                  </svg>
                </button>

                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="p-1.5 border border-paper/15 bg-paper/5 hover:border-acid/50 transition-colors">
                    <div className="w-6 h-6 bg-acid flex items-center justify-center">
                      <span className="text-ink text-xs font-bold">{userEmail ? userEmail[0].toUpperCase() : ""}</span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 bg-[#0b0b0b] border border-paper/10 py-2 w-56 shadow-xl z-50"
                      >
                        <div className="px-4 py-2 border-b border-paper/5">
                          <p className="font-mono text-xs text-paper/40 truncate">{userEmail}</p>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.removeItem("token");
                            router.replace("/");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-paper/50 hover:text-acid hover:bg-paper/5 transition flex items-center gap-2"
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
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-paper/40">
                  <circle cx={11} cy={11} r={8} />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputCls} pl-9`}
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-paper/5 border border-paper/15 px-2.5 py-2 font-mono text-xs text-paper focus:outline-none focus:border-acid/60"
              >
                <option value="lastEditedAt">Edited</option>
                <option value="name">Name</option>
                <option value="createdAt">Created</option>
              </select>
            </div>

            {/* desktop row */}
            <div className="hidden sm:flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 max-w-sm">
                <div className="relative flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-paper/40">
                    <circle cx={11} cy={11} r={8} />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-paper/5 border border-paper/15 px-2.5 py-2 font-mono text-xs text-paper focus:outline-none focus:border-acid/60"
                >
                  <option value="lastEditedAt">Last Edited</option>
                  <option value="name">Name</option>
                  <option value="createdAt">Created</option>
                </select>

                <button
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className={iconBtnCls}
                  title={viewMode === "grid" ? "List view" : "Grid view"}
                >
                  {viewMode === "grid" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <line x1={8} y1={6} x2={21} y2={6} />
                      <line x1={8} y1={12} x2={21} y2={12} />
                      <line x1={8} y1={18} x2={21} y2={18} />
                      <line x1={3} y1={6} x2={3.01} y2={6} />
                      <line x1={3} y1={12} x2={3.01} y2={12} />
                      <line x1={3} y1={18} x2={3.01} y2={18} />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x={3} y={3} width={7} height={7} />
                      <rect x={14} y={3} width={7} height={7} />
                      <rect x={14} y={14} width={7} height={7} />
                      <rect x={3} y={14} width={7} height={7} />
                    </svg>
                  )}
                </button>

                <button onClick={() => setShowSettings(true)} className={iconBtnCls}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx={12} cy={12} r={3} />
                  </svg>
                </button>

                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="p-1.5 border border-paper/15 bg-paper/5 hover:border-acid/50 transition-colors">
                    <div className="w-6 h-6 bg-acid flex items-center justify-center">
                      <span className="text-ink text-xs font-bold">{userEmail ? userEmail[0].toUpperCase() : ""}</span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 bg-[#0b0b0b] border border-paper/10 py-2 w-56 shadow-xl z-50"
                      >
                        <div className="px-4 py-2 border-b border-paper/5">
                          <p className="font-mono text-xs text-paper/40 truncate">{userEmail}</p>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.removeItem("token");
                            router.replace("/");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-paper/50 hover:text-acid hover:bg-paper/5 transition flex items-center gap-2"
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

          {/* content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-paper">
                  Projects
                </h1>
                <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
                  {projects.length} total · {activeCount} active
                </p>
              </div>
              <button
                onClick={() => setShowNewProject(true)}
                className="bg-acid text-ink px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-medium transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                New Project
              </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(["all", "active", "idle"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition whitespace-nowrap shrink-0 border ${
                    filterStatus === status
                      ? "bg-acid text-ink border-acid"
                      : "text-paper/45 border-paper/10 hover:text-paper hover:border-paper/25"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-2 border-paper/15 border-t-acid rounded-full animate-spin" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-paper/50">
                <div className="w-16 h-16 border border-paper/15 bg-paper/5 flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-paper/30">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="font-display text-lg font-medium uppercase tracking-tight text-paper/70 mb-1">No projects found</p>
                <p className="font-mono text-xs text-paper/40 text-center max-w-xs mb-6">{searchQuery || filterStatus !== "all" ? "No projects match your search criteria" : "Create your first project to start coding"}</p>
                {!searchQuery && filterStatus === "all" && (
                  <button
                    onClick={() => setShowNewProject(true)}
                    className="bg-acid text-ink px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-medium transition-transform hover:-translate-y-0.5 flex items-center gap-2"
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

      {/* new project modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0b0b] border border-paper/10 rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-paper/10">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-paper">Create New Project</h2>
              <p className="font-mono text-xs text-paper/40 mt-1">Start a new coding project</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-paper/40 mb-1.5 block">Project Name</label>
                <input
                  type="text"
                  placeholder="My Awesome Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-paper/40 mb-1.5 block">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Brief description of your project"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-paper/40 mb-2 block">Select Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.name}
                      onClick={() => setSelectedLanguage(lang.name)}
                      className={`p-3 border transition flex flex-col items-center gap-2 ${
                        selectedLanguage === lang.name ? "border-acid bg-acid/10" : "border-paper/10 hover:border-paper/25"
                      }`}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Image src={lang.icon} width={16} height={16} alt={lang.name} />
                      </div>
                      <span className={`font-mono text-[10px] ${selectedLanguage === lang.name ? "text-acid" : "text-paper/50"}`}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-paper/10 flex gap-2">
              <button
                onClick={() => setShowNewProject(false)}
                className="flex-1 px-3 py-2.5 border border-paper/20 text-paper/80 hover:bg-paper/5 transition font-mono text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName || !selectedLanguage}
                className="flex-1 px-3 py-2.5 bg-acid text-ink font-mono text-xs uppercase tracking-wider font-medium hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* edit modal */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0b0b] border border-paper/10 rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-paper/10">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-paper">Edit Project</h2>
              <p className="font-mono text-xs text-paper/40 mt-1">Update project details</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-paper/40 mb-1.5 block">Project Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-paper/40 mb-1.5 block">Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="p-5 border-t border-paper/10 flex gap-2">
              <button
                onClick={() => { setShowEditModal(false); setEditingProject(null); }}
                className="flex-1 px-3 py-2.5 border border-paper/20 text-paper/80 hover:bg-paper/5 transition font-mono text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProject}
                disabled={!editName.trim()}
                className="flex-1 px-3 py-2.5 bg-acid text-ink font-mono text-xs uppercase tracking-wider font-medium hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
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

function ProjectMenu({ menuRef, onEdit, onClone, onExport, onDelete, className }: {
  menuRef: React.RefObject<HTMLDivElement | null>; onEdit: () => void; onClone: () => void;
  onExport: () => void; onDelete: () => void; className: string;
}) {
  return (
    <div ref={menuRef} className={`z-50 bg-[#111] border border-paper/10 py-1 min-w-40 shadow-xl font-mono text-[13px] ${className}`}>
      <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full px-4 py-2 text-left hover:bg-paper/10 hover:text-acid flex items-center gap-2.5 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
        Edit
      </button>
      <button onClick={(e) => { e.stopPropagation(); onClone(); }} className="w-full px-4 py-2 text-left hover:bg-paper/10 hover:text-acid flex items-center gap-2.5 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect width={14} height={14} x={8} y={8} rx={2} /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
        Duplicate
      </button>
      <button onClick={(e) => { e.stopPropagation(); onExport(); }} className="w-full px-4 py-2 text-left hover:bg-paper/10 hover:text-acid flex items-center gap-2.5 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1={12} x2={12} y1={15} y2={3} /></svg>
        Export ZIP
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full px-4 py-2 text-left hover:bg-red-500/10 text-red-400 flex items-center gap-2.5 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
        Delete
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "idle" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider shrink-0 ${status === "active" ? "bg-acid/15 text-acid" : "bg-paper/5 text-paper/40"}`}>
      {status === "active" && <span className="w-1 h-1 rounded-full bg-acid" />}
      {status}
    </span>
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
      className="bg-paper/[0.02] border border-paper/10 p-4 hover:bg-paper/[0.05] hover:border-acid/30 transition-all duration-200 cursor-pointer group relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-paper/5 border border-paper/15 flex items-center justify-center group-hover:border-acid/40 transition-colors">
          <span className="font-display text-lg font-bold text-paper/80">{project.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); onOpenMenu(); }} className="p-1.5 hover:bg-paper/10 hover:text-acid text-paper/40 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx={12} cy={12} r={1} /><circle cx={19} cy={12} r={1} /><circle cx={5} cy={12} r={1} />
            </svg>
          </button>
          {isMenuOpen && (
            <ProjectMenu menuRef={menuRef} onEdit={onEdit} onClone={onClone} onExport={onExport} onDelete={onDelete} className="absolute right-4 top-14" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="font-display text-sm font-medium text-paper truncate uppercase tracking-tight">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>
      <p className="text-paper/45 text-xs mb-4 line-clamp-2 min-h-[2rem]">{project.description || "No description"}</p>
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-paper/40 pt-3 border-t border-paper/[0.07]">
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          </svg>
          {project.fileCount}
        </span>
        <span>{formatRelativeTime(project.lastEditedAt)}</span>
        <span className="ml-auto text-acid">{project.language}</span>
      </div>
    </div>
  );
}

function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const navItem = "w-full flex items-center gap-2.5 px-3 py-2 font-mono text-[13px] text-paper/45 hover:text-paper hover:bg-paper/5 transition";
  return (
    <>
      <div className="p-4 border-b border-paper/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-acid flex items-center justify-center">
            <span className="text-ink font-display font-bold text-sm">C</span>
          </div>
          <div>
            <span className="font-display text-sm font-bold uppercase tracking-tight text-paper block leading-none">Code<span className="text-acid">/</span>Pilot</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/35">Online IDE</span>
          </div>
        </div>
      </div>
      <div className="p-2 space-y-0.5">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 bg-paper/[0.06] border-l-2 border-acid text-paper font-mono text-[13px]">
          <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
            <path d="M14 12h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
            <path d="M2 4v4a2 2 0 0 0 2 2h6" />
            <path d="M14 4v4a2 2 0 0 0 2 2h6" />
          </svg>
          Projects
        </button>
        <button className={navItem}>
          <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10} /><path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
          Explore
        </button>
        <button className={navItem}>
          <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx={9} cy={7} r={4} /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Team
        </button>
      </div>
      <div className="flex-1" />
      <div className="p-2 border-t border-paper/10 space-y-0.5">
        <button className={navItem}>
          <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} />
          </svg>
          Account
        </button>
        <button onClick={onOpenSettings} className={navItem}>
          <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
      className="bg-paper/[0.02] border border-paper/10 px-3 py-2.5 hover:bg-paper/[0.05] hover:border-acid/30 transition-all duration-200 cursor-pointer group flex items-center gap-3 relative"
    >
      <div className="w-8 h-8 bg-paper/5 border border-paper/15 flex items-center justify-center shrink-0 group-hover:border-acid/40 transition-colors">
        <span className="font-display text-sm font-bold text-paper/80">{project.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm text-paper truncate uppercase tracking-tight">{project.name}</span>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-paper/40 text-xs truncate">{project.description || "No description"}</p>
      </div>
      <span className="hidden sm:flex font-mono text-[10px] uppercase tracking-wider text-paper/40 shrink-0 items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        </svg>
        {project.fileCount}
      </span>
      <span className="hidden md:inline font-mono text-[10px] uppercase tracking-wider text-paper/40 shrink-0">{formatRelativeTime(project.lastEditedAt)}</span>
      <span className="hidden lg:inline font-mono text-[10px] uppercase tracking-wider shrink-0 text-acid">{project.language}</span>
      <button onClick={(e) => { e.stopPropagation(); onOpenMenu(); }} className="p-1.5 hover:bg-paper/10 hover:text-acid text-paper/40 transition-colors shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx={12} cy={12} r={1} /><circle cx={19} cy={12} r={1} /><circle cx={5} cy={12} r={1} />
        </svg>
      </button>
      {isMenuOpen && (
        <ProjectMenu menuRef={menuRef} onEdit={onEdit} onClone={onClone} onExport={onExport} onDelete={onDelete} className="absolute right-4 top-full mt-1" />
      )}
    </div>
  );
}
