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
      })
      .then((dict: any) => {
        this.content = cloneDeep(dict);
        return dict;
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
      const old = this.content;
      this.readFile().then(() => {
        this.getDocuments(this.getUpdated(old)).forEach(doc => {
          this.emit('document-updated', doc);
        });
        this.getRemoved(old).forEach((id: string) => {
          this.emit('document-removed', id);
        });
      });
    }
  }

  private getUpdated(old: any): any {
    let update: any = {};

    intersection(keys(this.content), keys(old)).forEach((id: string) => {
      if (!isEqual(this.content[id], old[id])) {
        update[id] = this.content[id];
      }
    });

    return update;
  }

  private getRemoved(old: any): string[] {
    return difference(keys(old), keys(this.content));
  }
}
