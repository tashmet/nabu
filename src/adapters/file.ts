import {Document, Serializer} from '@ziggurat/isimud';
import {PersistenceAdapter, ObjectMap} from '@ziggurat/isimud-persistence';
import {FileSystem} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {cloneDeep, difference, each, intersection, isEqual, keys, map, merge, transform} from 'lodash';

export class File extends EventEmitter implements PersistenceAdapter {
  private buffer: ObjectMap = {};

  public constructor(
    private serializer: Serializer,
    private fs: FileSystem,
    private path: string
  ) {
    super();
    fs.on('file-added',   (filePath: string) => { this.onFileAdded(filePath); });
    fs.on('file-changed', (filePath: string) => { this.onFileChanged(filePath); });
  }

  public async read(): Promise<ObjectMap> {
    return this.readFile();
  }

  public write(id: string, data: Object): Promise<void> {
    // TODO: Implement
    return Promise.resolve();
  }

  private async readFile(): Promise<ObjectMap> {
    try {
      return this.set(<ObjectMap>await this.serializer.deserialize(await this.fs.readFile(this.path)));
    } catch (err) {
      return this.set({});
    }
  }

  private async onFileAdded(path: string) {
    if (path === this.path) {
      each(await this.read(), (doc, id) => {
        this.emit('document-updated', id, doc);
      });
    }
  }

  private async onFileChanged(path: string) {
    if (path === this.path) {
      const old = this.buffer;
      await this.readFile();
      each(this.updated(old), (doc, id) => {
        this.emit('document-updated', id, doc);
      });
      for (let id of this.removed(old)) {
        this.emit('document-removed', id);
      }
    }
  }

  private updated(other: ObjectMap): ObjectMap {
    return transform(intersection(keys(this.buffer), keys(other)), (result: ObjectMap, id: string) => {
      if (!isEqual(this.buffer[id], other[id])) {
        result[id] = this.buffer[id];
      }
      return result;
    }, {});
  }

  private removed(other: ObjectMap): string[] {
    return difference(keys(other), keys(this.buffer));
  }

  private set(obj: ObjectMap): ObjectMap {
    this.buffer = cloneDeep(obj);
    return obj;
  }
}
