import {Serializer} from '@ziggurat/isimud';
import {PersistenceAdapter, ObjectMap} from '@ziggurat/isimud-persistence';
import {EventEmitter} from 'eventemitter3';
import {cloneDeep, difference, each, intersection, isEqual, keys, transform} from 'lodash';
import * as fs from 'fs-extra';
import {FSWatcher} from 'chokidar';

export class File extends EventEmitter implements PersistenceAdapter {
  private buffer: ObjectMap = {};

  public constructor(
    private serializer: Serializer,
    private watcher: FSWatcher,
    private path: string
  ) {
    super();
    watcher
      .on('add',    filePath => this.onFileAdded(filePath))
      .on('change', filePath => this.onFileChanged(filePath))
      .add(path);
  }

  public async read(): Promise<ObjectMap> {
    try {
      const buffer = await fs.readFile(this.path);
      return this.set(<ObjectMap>await this.serializer.deserialize(buffer));
    } catch (err) {
      return this.set({});
    }
  }

  public async write(id: string, data: Object): Promise<void> {
    await this.read();
    this.buffer[id] = data;
    return this.flush();
  }

  public async remove(id: string): Promise<void> {
    await this.read();
    delete this.buffer[id];
    return this.flush();
  }

  private async flush(): Promise<void> {
    return fs.writeFile(this.path, await this.serializer.serialize(this.buffer));
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
      await this.read();
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
