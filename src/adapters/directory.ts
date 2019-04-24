import {Serializer} from '@ziggurat/common';
import {PersistenceAdapter, ObjectMap} from '@ziggurat/isimud-persistence';
import {EventEmitter} from 'eventemitter3';
import {basename, dirname, join} from 'path';
import * as fs from 'fs-extra';
import {FSWatcher} from 'chokidar';

export class Directory extends EventEmitter implements PersistenceAdapter {
  public constructor(
    private serializer: Serializer,
    private path: string,
    private extension: string,
    watcher?: FSWatcher
  ) {
    super();
    if (watcher) {
      watcher
        .on('add',    filePath => this.onFileUpdated(filePath))
        .on('change', filePath => this.onFileUpdated(filePath))
        .on('unlink', filePath => this.onFileRemoved(filePath))
        .add(path);
    }
  }

  public async read(): Promise<ObjectMap> {
    let result: ObjectMap = {};
    for (let file of await fs.readdir(this.path)) {
      result[this.getId(file)] = await this.loadFile(join(this.path, file));
    }
    return result;
  }

  public async write(id: string, data: Object): Promise<void> {
    const path = join(this.path, `${id}.${this.extension}`);
    await fs.writeFile(path, await this.serializer.serialize(data));
  }

  public async remove(id: string): Promise<void> {
    return fs.remove(join(this.path, `${id}.${this.extension}`));
  }

  private async loadFile(path: string): Promise<Object> {
    return this.serializer.deserialize(await fs.readFile(path));
  }

  private async onFileUpdated(path: string) {
    if (dirname(path) === this.path) {
      this.emit('document-updated', this.getId(path), await this.loadFile(path));
    }
  }

  private onFileRemoved(path: string) {
    if (dirname(path) === this.path) {
      this.emit('document-removed', this.getId(path));
    }
  }

  private getId(path: string): string {
    return basename(path).split('.')[0];
  }
}
