import {SerializerProvider} from '@ziggurat/isimud';

export interface FileSystem {
  readDir(path: string): Promise<string[]>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
  remove(path: string): Promise<void>;

  on(event: 'file-added', fn: (path: string) => void): FileSystem;
  on(event: 'file-changed', fn: (path: string) => void): FileSystem;
  on(event: 'file-removed', fn: (path: string) => void): FileSystem;
  on(event: 'file-stored', fn: (data: string, path: string) => void): FileSystem;
  on(event: 'ready', fn: () => void): FileSystem;
}

export interface FileSystemConfig {
  path: string;
}

export interface DirectoryConfig {
  /**
   * Path to directory.
   */
  path: string;

  /**
   * A serializer provider creating a serializer that will parse and serialize
   * documents when reading from and writing to the file system.
   */
  serializer: SerializerProvider;

  /**
   * file extension of files in the directory.
   */
  extension: string;
}

export interface FileConfig {
  /**
   * Path to file.
   */
  path: string;

  /**
   * A serializer provider creating a serializer that will parse and serialize
   * documents when reading from and writing to the file system.
   */
  serializer: SerializerProvider;
}
