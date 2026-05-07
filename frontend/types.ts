export enum FormType {
  SIGNUP = "signup",
  LOGIN = "login",
}

export interface FileNode {
  name: string;
  isFolder: boolean;
  children?: FileNode[];
  content?: string;
}