export interface FileSystem {
  readdir(path: string): string[];
  read(path: string): any;
  write(data: string, path: string): void;

  on(event: 'file-added', fn: (path: string) => void): FileSystem;
  on(event: 'file-changed', fn: (path: string) => void): FileSystem;
  on(event: 'file-removed', fn: (path: string) => void): FileSystem;
  on(event: 'file-stored', fn: (data: string, path: string) => void): FileSystem;
  on(event: 'ready', fn: () => void): FileSystem;
}

export interface FSStorageAdapter {
  update(path: string): void;
}
