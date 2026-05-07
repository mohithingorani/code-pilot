"use client";
import Image from "next/image";
import { file_icons } from "./HeadingTabs";
import { FileNode } from "@/types";
import { useState } from "react";

interface FileStructureProps {
  files: { name: string; content: string }[];
  onClick: (index: number) => void;
  selected: number;
  removeFile: (name: string) => void;
  addFolder?: (name: string) => void;
  splitFileIndex?: number | null;
  onSplitFileClick?: (index: number) => void;
}

export default function FileStructure({
  files,
  onClick,
  selected,
  removeFile,
  addFolder,
  splitFileIndex,
  onSplitFileClick,
}: FileStructureProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const buildFileTree = (files: { name: string; content: string }[]): FileNode[] => {
    const root: FileNode[] = [];
    files.forEach((file) => {
      const parts = file.name.split("/");
      let current = root;

      parts.slice(0, -1).forEach((folderName) => {
        let folder = current.find((n) => n.isFolder && n.name === folderName);
        if (!folder) {
          folder = { name: folderName, isFolder: true, children: [] };
          current.push(folder);
        }
        current = folder.children!;
      });

      current.push({ name: parts[parts.length - 1], isFolder: false, content: file.content });
    });

    return root;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const flattenFiles = (nodes: FileNode[], basePath = ""): { name: string; content: string }[] => {
    const result: { name: string; content: string }[] = [];
    nodes.forEach((node) => {
      const fullPath = basePath ? `${basePath}/${node.name}` : node.name;
      if (node.isFolder) {
        result.push(...flattenFiles(node.children || [], fullPath));
      } else {
        result.push({ name: fullPath, content: node.content || "" });
      }
    });
    return result;
  };

  const fileTree = buildFileTree(files);

  const renderNode = (node: FileNode, depth = 0, basePath = "") => {
    const fullPath = basePath ? `${basePath}/${node.name}` : node.name;
    const flatIndex = flattenFiles(fileTree).findIndex((f) => f.name === fullPath);

    if (node.isFolder) {
      const isOpen = expandedFolders.has(fullPath);
      return (
        <div key={fullPath}>
          <div
            onClick={() => toggleFolder(fullPath)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm text-white/85 hover:bg-white/10"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <Image
              src={isOpen ? "/folder_icons/empty.svg" : "/folder_icons/closed.svg"}
              alt="Folder"
              width={20}
              height={20}
              className="shrink-0 opacity-90"
            />
            <span>{node.name}</span>
            <span className="ml-auto text-white/40 text-xs">{isOpen ? "▼" : "▶"}</span>
          </div>
          {isOpen && node.children?.map((child) => renderNode(child, depth + 1, fullPath))}
        </div>
      );
    }

    return (
      <div
        key={fullPath}
        onClick={() => flatIndex >= 0 && onClick(flatIndex)}
        className={`flex group items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm ${
          flatIndex === selected
            ? "bg-white/10 border-l-2 border-sky-400/70 text-white"
            : flatIndex === splitFileIndex
            ? "bg-blue-500/10 border-l-2 border-blue-400/70 text-blue-300"
            : "border-l-2 border-transparent text-white/85 hover:bg-white/10"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <Image
          src={`/file-icons/${file_icons.includes(node.name.split(".").pop()!) ? node.name.split(".").pop()! : "empty"}.svg`}
          alt="File Icon"
          width={20}
          height={20}
          className="shrink-0 opacity-90"
        />
        <span className="whitespace-nowrap flex-1 min-w-0">{node.name}</span>
        {splitFileIndex !== null && splitFileIndex !== undefined && flatIndex === splitFileIndex && (
          <span className="text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded text-blue-300">Split</span>
        )}
        <Image
          onClick={(e) => {
            e.stopPropagation();
            removeFile(fullPath);
          }}
          src={"/remove.svg"}
          width={18}
          height={18}
          alt="remove"
          className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity shrink-0"
        />
      </div>
    );
  };

  return (
    <div className="px-3">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="font-semibold text-white/90 select-none">Workspace</div>
        {addFolder && (
          <button
            onClick={() => {
              const name = prompt("Enter folder name:");
              if (name?.trim()) {
                addFolder(name.trim());
              }
            }}
            className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition"
            title="Create folder"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
          </button>
        )}
      </div>
      <div className="mt-1">{fileTree.map((node) => renderNode(node))}</div>
    </div>
  );
}
