import {inject, provider, decorate, injectable} from '@ziggurat/tiamat';
import * as fs from 'fs-extra';
import * as chokidar from 'chokidar';
import {relative, join} from 'path';
import {EventEmitter} from 'eventemitter3';
import {FileSystem, FileSystemConfig} from './interfaces';

if (Reflect.hasOwnMetadata('inversify:paramtypes', EventEmitter) === false) {
  decorate(injectable(), EventEmitter);
}

@provider({
  key: 'isimud.FileSystem'
})
export class FileSystemService extends EventEmitter implements FileSystem {
  public constructor(
    @inject('isimud.FileSystemConfig') private config: FileSystemConfig
  ) {
    super();
    chokidar.watch(this.config.path, {
      ignoreInitial: true,
      persistent: true,
    })
      .on('add', (path: string) => {
        this.emit('file-added', this.relativePath(path));
      })
      .on('change', (path: string) => {
        this.emit('file-changed', this.relativePath(path));
      })
      .on('unlink', (path: string) => {
        this.emit('file-removed', this.relativePath(path));
      })
      .on('ready', () => {
        this.emit('ready');
      });
  }

  public readDir(path: string): Promise<string[]> {
    return fs.readdir(this.absolutePath(path));
  }

  public readFile(path: string): Promise<string> {
    return fs.readFile(this.absolutePath(path), 'utf8');
  }

  public async writeFile(path: string, data: string): Promise<void> {
    await fs.writeFile(this.absolutePath(path), data, {encoding: 'utf8'});
    this.emit('file-stored', data, path);
  }

  public async remove(path: string): Promise<void> {
    return fs.remove(path);
  }

  private relativePath(path: string): string {
    return relative(this.config.path, path);
  }

  private absolutePath(path: string): string {
    return join(this.config.path, path);
  }
}
