import {Document, Serializer} from '@ziggurat/isimud';
import {PersistenceAdapter} from '@ziggurat/isimud-persistence';
import {FileSystem} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {cloneDeep, difference, each, intersection, isEqual, keys, map, merge, transform} from 'lodash';

type DocumentMap = {[id: string]: any};

export class File extends EventEmitter implements PersistenceAdapter {
  private buffer: DocumentMap = {};

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
    return map(await this.readFile(), (doc: any, id: string) => {
      doc._id = id;
      return doc;
    });
  }

  public write(docs: Document[]): Promise<void> {
    // TODO: Implement
    return Promise.resolve();
  }

  private async readFile(): Promise<DocumentMap> {
    try {
      return this.set(await this.serializer.deserialize(await this.fs.readFile(this.path)));
    } catch (err) {
      return this.set({});
    }
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
      const old = this.buffer;
      await this.readFile();
      for (let doc of this.updated(old)) {
        this.emit('document-updated', doc);
      }
      for (let id of this.removed(old)) {
        this.emit('document-removed', id);
      }
    }
  }

  private updated(other: DocumentMap): Document[] {
    return transform(intersection(keys(this.buffer), keys(other)), (result: Document[], id: string) => {
      if (!isEqual(this.buffer[id], other[id])) {
        result.push(merge({}, {_id: id}, this.buffer[id]));
      }
      return result;
    }, []);
  }

  private removed(other: DocumentMap): string[] {
    return difference(keys(other), keys(this.buffer));
  }

  private set(obj: DocumentMap): DocumentMap {
    this.buffer = cloneDeep(obj);
    return obj;
  }
}
