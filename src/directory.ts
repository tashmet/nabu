import {Collection, Serializer} from '@samizdatjs/tashmetu';
import {FileSystem, FSStorageAdapter} from './interfaces';
import {DirectoryConfig} from './decorators';
import {basename, dirname, join} from 'path';

export class Directory implements FSStorageAdapter {
  public constructor(
    private collection: Collection,
    private serializer: Serializer,
    private fs: FileSystem,
    private config: DirectoryConfig
  ) {
    try {
      fs.readdir(config.path).forEach((name: string) => {
        let doc = this.loadPath(join(config.path, name));
        collection.upsert(doc);
      });
    } catch (e) { return; }
  }

  public update(path: string): void {
    this.collection.upsert(this.loadPath(path));
  }

  private loadPath(path: string): any {
    let doc: any = this.serializer.parse(this.fs.read(path));
    doc._id = basename(path).split('.')[0];
    return doc;
  }
}
