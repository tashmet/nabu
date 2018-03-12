import {Document, Serializer} from '@ziggurat/isimud';
import {PersistenceAdapter, ObjectMap} from '@ziggurat/isimud-persistence';
import {FileSystem} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {basename, dirname, join} from 'path';
import {map} from 'lodash';

export class Directory extends EventEmitter implements PersistenceAdapter {
  public constructor(
    private serializer: Serializer,
    private fs: FileSystem,
    private path: string,
    private extension: string
  ) {
    super();
    fs.on('file-added',   (filePath: string) => { this.onFileUpdated(filePath); });
    fs.on('file-changed', (filePath: string) => { this.onFileUpdated(filePath); });
    fs.on('file-removed', (filePath: string) => { this.onFileRemoved(filePath); });
  }

  public async read(): Promise<ObjectMap> {
    let result: ObjectMap = {};
    for (let file of await this.fs.readDir(this.path)) {
      result[this.getId(file)] = await this.loadFile(join(this.path, file));
    }
    return result;
  }

  public async write(id: string, data: Object): Promise<void> {
    const path = join(this.path, `${id}.${this.extension}`);
    await this.fs.writeFile(path, await this.serializer.serialize(data));
  }

  public async remove(id: string): Promise<void> {
    return this.fs.remove(join(this.path, `${id}.${this.extension}`));
  }

  private async loadFile(path: string): Promise<Object> {
    return this.serializer.deserialize(await this.fs.readFile(path));
  }

  private async onFileUpdated(path: string) {
    if (basename(dirname(path)) === this.path) {
      this.emit('document-updated', this.getId(path), await this.loadFile(path));
    }
  }

  private onFileRemoved(path: string) {
    if (basename(dirname(path)) === this.path) {
      this.emit('document-removed', this.getId(path));
    }
  }

  private getId(path: string): string {
    return basename(path).split('.')[0];
  }
}
