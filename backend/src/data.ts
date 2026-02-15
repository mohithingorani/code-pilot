import { Language } from "./types.js";

 const pythonFiles = [
    {
      name: "main.py",
      content: "# Write your code here\nprint('Hello, World!')\n",
    }
  ];


  const javaFiles = [
    {
      name: "Main.java",
      content: "// Write your code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}\n",
    }
  ];
  
  const cppFiles = [
    {
      name: "main.cpp",
      content: "// Write your code here\n#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}\n",
    }
  ];
  const jsFiles = [
    {
      name: "index.js",
      content: "// Write your code here\nconsole.log('Hello, World!');\n",
    }
  ];




  const FilesMap = new Map<string,any>()

  FilesMap.set(Language.PYTHON,pythonFiles);
  FilesMap.set(Language.JAVA,javaFiles);
  FilesMap.set(Language.CPP,cppFiles);
  FilesMap.set(Language.JAVASCRIPT,jsFiles);
  export { FilesMap } ;