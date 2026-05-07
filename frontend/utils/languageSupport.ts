export default function getLanguageFromFileName(fileName:string):string{
    const ext = fileName.split('.').pop();
    switch(ext){
      case "js":
        return "javascript";
      case "ts":
        return "typescript";
      case "py":
        return "python";
      case "java":
        return "java";
      case "cpp":
      case "cc":
      case "cxx":
        return "cpp";
      case "md":
      case "markdown":
        return "markdown";
      default:
        return "";
    }
  }

export function getLanguageExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export const SUPPORTED_LANGUAGES = [
  { name: "JavaScript", value: "JavaScript", ext: "js" },
  { name: "TypeScript", value: "TypeScript", ext: "ts" },
  { name: "Python", value: "Python", ext: "py" },
  { name: "Java", value: "Java", ext: "java" },
  { name: "C++", value: "C++", ext: "cpp" },
  { name: "Markdown", value: "Markdown", ext: "md" },
];

export function getLanguageValue(dashboardName: string): string {
  return dashboardName;
}
