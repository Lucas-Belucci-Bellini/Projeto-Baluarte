export interface VfsFile {
  type: 'file';
  name: string;
  content?: string;
  mtime: number;
}

export interface VfsDirectory {
  type: 'dir';
  name: string;
  mtime: number;
  children: Record<string, VfsNode>;
}

export type VfsNode = VfsFile | VfsDirectory;

export function basename(path: string): string;
export function readFile(path: string, cwd?: string): string;
export function writeFile(path: string, content: string, cwd?: string): VfsFile;
