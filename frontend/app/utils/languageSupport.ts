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
        return "cpp";
      case "md":
        return "markdown";
      default:
        return "";
    }
  }