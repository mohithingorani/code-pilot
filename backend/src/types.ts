export enum Language {
  PYTHON = "python",
  JAVASCRIPT = "javascript",
  TYPESCRIPT = "typescript",
  JAVA = "java",
  CPP = "cpp",
  MARKDOWN = "markdown",
}

export const LANGUAGE_MAP: Record<string, Language> = {
  python: Language.PYTHON,
  Python: Language.PYTHON,
  javascript: Language.JAVASCRIPT,
  JavaScript: Language.JAVASCRIPT,
  typescript: Language.TYPESCRIPT,
  TypeScript: Language.TYPESCRIPT,
  java: Language.JAVA,
  Java: Language.JAVA,
  cpp: Language.CPP,
  "C++": Language.CPP,
  markdown: Language.MARKDOWN,
  Markdown: Language.MARKDOWN,
};
