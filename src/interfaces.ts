import {SerializerProvider} from '@ziggurat/isimud';

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

  /**
   * Monitor directory for changes to its files and update source accordingly.
   *
   * @default false
   */
  watch?: boolean;
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

  /**
   * Monitor file for changes and update source accordingly.
   *
   * @default false
   */
  watch?: boolean;
}
