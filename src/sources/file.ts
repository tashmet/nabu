import {FSWatcher} from 'chokidar';
import {EventEmitter} from 'eventemitter3';
import {cloneDeep, difference, each, intersection, isEqual, keys, transform} from 'lodash';
import * as fs from 'fs-extra';
import {Container} from '@ziggurat/tiamat';
import {Collection, CollectionProducer, MemoryCollection} from '@ziggurat/ziggurat';
import {PersistenceCollection} from '../collections/persistence';
import {
  FileConfig, FileSystemConfig, PersistenceAdapter, ObjectMap, Serializer
} from '../interfaces';

export function file(config: FileConfig): CollectionProducer {
  return (container: Container, name: string): Collection => {
    const fsConfig = container.resolve<FileSystemConfig>('nabu.FileSystemConfig');
    const watcher = fsConfig.watch ? container.resolve<FSWatcher>('chokidar.FSWatcher') : undefined;

    return new PersistenceCollection(
      new File(config.serializer(container), config.path, watcher),
      new MemoryCollection(name)
    );
  };
}

export class File extends EventEmitter implements PersistenceAdapter {
  private buffer: ObjectMap = {};

  public constructor(
    private serializer: Serializer,
    private path: string,
    watcher?: FSWatcher
  ) {
    super();
    if (watcher) {
      watcher
        .on('add',    filePath => this.onFileAdded(filePath))
        .on('change', filePath => this.onFileChanged(filePath))
        .add(path);
    }
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
