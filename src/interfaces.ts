import {Producer} from '@ziggurat/tiamat';
import {Serializer} from '@ziggurat/common';

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
