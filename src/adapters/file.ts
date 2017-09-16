import {Document, Serializer} from '@ziggurat/isimud';
import {PersistenceAdapter} from '@ziggurat/isimud-persistence';
import {FileSystem} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {cloneDeep, difference, each, intersection, isEqual, keys, map} from 'lodash';
import * as Promise from 'bluebird';

export class File extends EventEmitter implements PersistenceAdapter {
  private content: any = {};

  public constructor(
    private serializer: Serializer,
    private fs: FileSystem,
    private path: string
  ) {
    super();
    fs.on('file-added',   (filePath: string) => { this.onFileAdded(filePath); });
    fs.on('file-changed', (filePath: string) => { this.onFileChanged(filePath); });
  }

  public read(): Promise<Document[]> {
    return this.readFile().then((dict: any) => {
      this.content = cloneDeep(dict);
      return this.getDocuments(dict);
    });
  }

  public write(docs: Document[]): Promise<void> {
    // TODO: Implement
    return Promise.resolve();
  }

  private readFile(): Promise<object> {
    return this.fs.readFile(this.path)
      .then((data: string) => {
        return this.serializer.deserialize(data);
      });
  }

  private getDocuments(dict: any): Document[] {
    return map(dict, (doc: Document, id: string) => {
      doc._id = id;
      return doc;
    });
  }

  private onFileAdded(path: string) {
    if (path === this.path) {
      this.read().then((docs: Document[]) => {
        docs.forEach(doc => {
          this.emit('document-updated', doc);
        });
      });
    }
  }

  private onFileChanged(path: string) {
    if (path === this.path) {
      const oldContent = this.content;
      this.read().then((docs: Document[]) => {
        const comp = this.compareDicts(this.content, oldContent);
        this.getDocuments(comp.update).forEach(doc => {
          this.emit('document-updated', doc);
        });
      });
    }
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
}
