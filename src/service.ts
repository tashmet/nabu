import {provider, decorate, injectable} from '@ziggurat/tiamat';
import * as fs from 'fs-extra';
import * as chokidar from 'chokidar';
import {relative, join} from 'path';
import {EventEmitter} from 'eventemitter3';
import {FileSystem} from './interfaces';

if (Reflect.hasOwnMetadata('inversify:paramtypes', EventEmitter) === false) {
  decorate(injectable(), EventEmitter);
}

@provider({
  for: 'isimud.FileSystem',
  singleton: true
})
export class FileSystemService extends EventEmitter implements FileSystem {
  private root: string = join(process.cwd(), 'content');

  public constructor() {
    super();
    chokidar.watch(this.root, {
      ignoreInitial: true,
      persistent: true,
    })
      .on('add', (path: string) => {
        this.emit('file-added', relative(this.root, path));
      })
      .on('change', (path: string) => {
        this.emit('file-changed', relative(this.root, path));
      })
      .on('unlink', (path: string) => {
        this.emit('file-removed', relative(this.root, path));
      })
      .on('ready', () => {
        this.emit('ready');
      });
  }

  public readDir(path: string): Promise<string[]> {
    return fs.readdir(join(this.root, path));
  }

  public readFile(path: string): Promise<string> {
    return fs.readFile(join(this.root, path), 'utf8');
  }

  public async writeFile(path: string, data: string): Promise<void> {
    let relPath = join('content', path);
    await fs.writeFile(join(process.cwd(), relPath), data, {encoding: 'utf8'});
    this.emit('file-stored', data, relPath);
  }
}
