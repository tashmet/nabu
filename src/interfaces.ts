import {Producer} from '@ziggurat/tiamat';

/**
 * Serializer for reading and writing objects.
 */
export interface Serializer {
  /**
   * Load an object from buffer.
   */
  deserialize(buffer: Buffer): Promise<object>;

  /**
   * Store an object to buffer.
   */
  serialize(data: object): Promise<Buffer>;
}

export interface DirectoryConfig {
  /**
   * Path to directory.
   */
  path: string;

  /**
   * A serializer producer creating a serializer that will parse and serialize
   * documents when reading from and writing to the file system.
   */
  serializer: Producer<Serializer>;

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
  serializer: Producer<Serializer>;
}

export interface FileSystemConfig {
  /**
   * Monitor file system for changes to files and update sources accordingly.
   *
   * @default false
   */
  watch: boolean;
}

export type ObjectMap = {[id: string]: Object};

export interface PersistenceAdapter {
  write(id: string, data: Object): Promise<void>;

  read(): Promise<ObjectMap>;

  remove(id: string): Promise<void>;

  on(event: 'document-updated', fn: (id: string, data: Object) => void): PersistenceAdapter;

  on(event: 'document-removed', fn: (id: string) => void): PersistenceAdapter;
}
