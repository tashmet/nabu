import {Document, Serializer} from '@ziggurat/isimud';
import {PersistenceAdapter} from '@ziggurat/isimud-persistence';
import {FileSystem} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {cloneDeep, difference, each, intersection, isEqual, keys, map} from 'lodash';

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

  public async read(): Promise<Document[]> {
    return this.getDocuments(await this.readFile());
  }

  public write(docs: Document[]): Promise<void> {
    // TODO: Implement
    return Promise.resolve();
  }

  private async readFile(): Promise<object> {
    let dict: any;
    try {
      dict = await this.serializer.deserialize(await this.fs.readFile(this.path));
    } catch (err) {
      dict = {};
    }
    this.content = cloneDeep(dict);
    return dict;
  }

  private getDocuments(dict: any): Document[] {
    return map(dict, (doc: Document, id: string) => {
      doc._id = id;
      return doc;
    });
  }

  private async onFileAdded(path: string) {
    if (path === this.path) {
      for (let doc of await this.read()) {
        this.emit('document-updated', doc);
      }
    }
  }

  private async onFileChanged(path: string) {
    if (path === this.path) {
      const old = this.content;
      await this.readFile();
      for (let doc of this.getDocuments(this.getUpdated(old))) {
        this.emit('document-updated', doc);
      }
      for (let id of this.getRemoved(old)) {
        this.emit('document-removed', id);
      }
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
