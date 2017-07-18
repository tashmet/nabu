import {Collection, Serializer} from '@samizdatjs/tashmetu';
import {FileSystem, FSStorageAdapter, FileConfig} from './interfaces';
import {each, intersection, difference, keys, isEqual, omit, pull, transform} from 'lodash';

export class File implements FSStorageAdapter {
  private upsertQueue: string[] = [];
  private storing = false;

  public constructor(
    private collection: Collection,
    private serializer: Serializer,
    private fs: FileSystem,
    private config: FileConfig
  ) {
    collection.on('document-upserted', (doc: any) => {
      if (this.upsertQueue.indexOf(doc._id) < 0) {
        this.fetchCachedDict((dict: any) => {
          this.storing = true;
          fs.write(serializer.serialize(dict), config.path);
        });
      }
      pull(this.upsertQueue, doc._id);
    });

    this.update(config.path);
  }

  public update(path: string): void {
    if (!this.storing) {
      let dict = this.readFile();

      this.fetchCachedDict((cachedDict: any) => {
        let comp = this.compareDicts(dict, cachedDict);

        each(comp.update, (doc: any, id: string) => {
          doc._id = id;
          this.upsertQueue.push(id);
          this.collection.upsert(doc);
        });

        // TODO: Remove items from comp.remove
      });
    }
    this.storing = false;
  }

  private compareDicts(file: any, cache: any): any {
    let update: any = {};
    let remove: any[] = [];

    intersection(keys(file), keys(cache)).forEach((id: string) => {
      if (!isEqual(file[id], cache[id])) {
        update[id] = file[id];
      }
    });
    difference(keys(file), keys(cache)).forEach((id: string) => {
      if (file[id]) {
        update[id] = file[id];
      } else {
        remove.push(id);
      }
    });
    return {update, remove};
  }

  private fetchCachedDict(fn: (dict: any) => void): void {
    this.collection.find()
      .then((docs: any[]) => {
        let dict = transform(docs, (result: any, obj: any) => {
          result[obj._id] = omit(obj, ['_id', '_collection', '$loki', 'meta']);
        }, {});
        fn(dict);
      });
  }

  private readFile(): Object {
    try {
      return this.serializer.parse(this.fs.read(this.config.path));
    } catch (e) {
      return {};
    }
  }
}
