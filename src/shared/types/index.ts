export interface Snippet {
  id: string;
  trigger: string;
  content: string;
  variables?: Record<string, any>;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageAsset {
  id: string;
  filename: string;
  blob?: Buffer;
  path?: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

export interface SnippetVariable {
  type: 'formtext' | 'select' | 'toggle' | 'date';
  name: string;
  label?: string;
  defaultValue?: any;
  options?: string[];
}

export interface ExpansionContext {
  snippetId: string;
  variables: Record<string, any>;
  targetApp?: string;
  targetElement?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AppSettings {
  globalShortcut: string;
  autoStart: boolean;
  serverPort: number;
  databaseEncryption: boolean;
  masterPassword?: string;
}