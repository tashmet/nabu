import {Injector} from '@ziggurat/tiamat';
import {Serializer} from '@ziggurat/isimud';
import * as Promise from 'bluebird';

export interface FileSystem {
  readDir(path: string): Promise<string[]>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;

  on(event: 'file-added', fn: (path: string) => void): FileSystem;
  on(event: 'file-changed', fn: (path: string) => void): FileSystem;
  on(event: 'file-removed', fn: (path: string) => void): FileSystem;
  on(event: 'file-stored', fn: (data: string, path: string) => void): FileSystem;
  on(event: 'ready', fn: () => void): FileSystem;
}

export interface FSStorageAdapter {
  update(path: string): void;
}

export interface FileSystemCollectionConfig {
  /**
   * Path to file/directory.
   */
  path: string;

  /**
   * A serializer provider creating a serializer that will parse and serialize
   * documents when reading from and writing to the file system.
   */
  serializer: (injector: Injector) => Serializer;
}

export interface DirectoryConfig extends FileSystemCollectionConfig {
  /**
   * file extension of files in the directory.
   */
  extension: string;
}

export interface FileConfig extends FileSystemCollectionConfig {}
