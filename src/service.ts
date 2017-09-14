import {provider} from '@ziggurat/tiamat';
import fs = require('fs');
import * as chokidar from 'chokidar';
import {relative, join} from 'path';
import {EventEmitter} from 'eventemitter3';
import {FileSystem} from './interfaces';
import * as Promise from 'bluebird';

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
    path = join(process.cwd(), 'content', path);
    return new Promise<string[]>((resolve, reject) => {
      fs.readdir(path, (err, files: string[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  public readFile(path: string): Promise<string> {
    let file = join(process.cwd(), 'content', path);
    return new Promise<string>((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, data: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public writeFile(data: string, path: string): Promise<void> {
    let relPath = join('content', path);
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(join(process.cwd(), relPath), data, {encoding: 'utf8'}, (err) => {
        if (err) {
          reject(err);
        } else {
          this.emit('file-stored', data, relPath);
          resolve();
        }
      });
    });
  }
}
