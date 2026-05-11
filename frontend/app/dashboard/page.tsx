"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import SettingsModal from "@/components/SettingsModal";

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
  const { settings: dashboardSettings, updateSettings } = useDashboardSettings();
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen text-white selection:bg-white/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-black to-black" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/3 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/5 flex flex-col">
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

          <div className="flex-1" />

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
          <div className="h-16 bg-black/20 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
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

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="lastEditedAt">Last Edited</option>
                <option value="name">Name</option>
                <option value="createdAt">Created</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition"
                title={viewMode === "grid" ? "List view" : "Grid view"}
              >
                {viewMode === "grid" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <line x1={8} y1={6} x2={21} y2={6} />
                    <line x1={8} y1={12} x2={21} y2={12} />
                    <line x1={8} y1={18} x2={21} y2={18} />
                    <line x1={3} y1={6} x2={3.01} y2={6} />
                    <line x1={3} y1={12} x2={3.01} y2={12} />
                    <line x1={3} y1={18} x2={3.01} y2={18} />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <rect x={3} y={3} width={7} height={7} />
                    <rect x={14} y={3} width={7} height={7} />
                    <rect x={14} y={14} width={7} height={7} />
                    <rect x={3} y={14} width={7} height={7} />
                  </svg>
                )}
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
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-white mb-1">Your Projects</h1>
                <p className="text-gray-500 text-sm">{projects.length} projects</p>
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
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === "all" ? "bg-white text-black" : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === "active" ? "bg-white text-black" : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("idle")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === "idle" ? "bg-white text-black" : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                Idle
              </button>
            </div>

            {/* Projects */}
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50%] text-gray-500">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-400 mb-1">No projects found</p>
                <p className="text-sm">Create your first project to get started!</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-semibold text-white">Edit Project</h2>
              <p className="text-gray-500 text-sm mt-1">Update project details</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-gray-400 text-sm mb-2.5 block">Project Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2.5 block">Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProject(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProject}
                disabled={!editName.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={dashboardSettings}
        onUpdate={updateSettings}
      />

      {openMenuId && (
        <div ref={menuRef} />
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onOpenMenu,
  isMenuOpen,
  onEdit,
  onClone,
  onDelete,
  onExport,
  onOpen,
}: {
  project: Project;
  onOpenMenu: () => void;
  isMenuOpen: boolean;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onExport: () => void;
  onOpen: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onOpenMenu();
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div
      onClick={onOpen}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition cursor-pointer group relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
          <span className="text-2xl font-bold text-white">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenMenu();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-gray-500">
              <circle cx={12} cy={12} r={1} />
              <circle cx={19} cy={12} r={1} />
              <circle cx={5} cy={12} r={1} />
            </svg>
          </button>
          {isMenuOpen && (
            <div ref={menuRef} className="absolute right-4 top-14 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl py-1 min-w-[160px] shadow-xl">
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
      <h3 className="text-white font-medium text-lg mb-1 group-hover:text-white transition">{project.name}</h3>
      <p className="text-gray-500 text-sm mb-3 line-clamp-1">{project.description || "No description"}</p>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{project.language} · {formatRelativeTime(project.lastEditedAt)}</span>
      </div>
    </div>
  );
}

function ProjectListItem({
  project,
  onOpenMenu,
  isMenuOpen,
  onEdit,
  onClone,
  onDelete,
  onExport,
  onOpen,
}: {
  project: Project;
  onOpenMenu: () => void;
  isMenuOpen: boolean;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onExport: () => void;
  onOpen: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onOpenMenu();
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div
      onClick={onOpen}
      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 hover:border-white/20 transition cursor-pointer group flex items-center gap-4 relative"
    >
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{project.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-white font-medium truncate">{project.name}</span>
        <p className="text-gray-500 text-sm truncate">{project.description || "No description"}</p>
      </div>
      <span className="text-gray-600 text-sm shrink-0">{project.language}</span>
      <span className="text-gray-600 text-sm shrink-0">{formatRelativeTime(project.lastEditedAt)}</span>
      <span className={`px-2 py-1 rounded-full text-xs ${project.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"}`}>
        {project.status}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onOpenMenu(); }}
        className="p-2 rounded-lg hover:bg-white/10 transition shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-gray-500">
          <circle cx={12} cy={12} r={1} />
          <circle cx={19} cy={12} r={1} />
          <circle cx={5} cy={12} r={1} />
        </svg>
      </button>
      {isMenuOpen && (
        <div ref={menuRef} className="absolute right-4 top-full z-50 bg-[#1a1a1a] border border-white/10 rounded-xl py-1 min-w-[160px] shadow-xl mt-1">
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
