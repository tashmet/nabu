import {Collection, Serializer} from '@ziggurat/isimud';
import {FileSystem, FSStorageAdapter, DirectoryConfig} from './interfaces';
import {basename, dirname, join} from 'path';
import * as Promise from 'bluebird';

export class Directory implements FSStorageAdapter {
  public constructor(
    private collection: Collection,
    private serializer: Serializer,
    private fs: FileSystem,
    private config: DirectoryConfig
  ) {
    fs.readDir(config.path).then((files: string[]) => {
      files.forEach((file: string) => {
        this.update(join(config.path, file));
      });
    });
  }

  public update(path: string): void {
    this.collection.upsert(this.loadPath(path));
  }

  private loadPath(path: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fs.readFile(path)
        .then((data: string) => {
          let doc: any = this.serializer.parse(data);
          doc._id = basename(path).split('.')[0];
          resolve(doc);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
