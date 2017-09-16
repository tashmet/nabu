import {FileSystemService} from '../src/service';
import {join} from 'path';
import * as mockfs from 'mock-fs';

export class MockContentDir {
  private tree: any = {};
  private dir: any = this.tree;
  private path = '';

  public constructor(private fs: FileSystemService, subDir?: string) {
    if (subDir) {
      this.tree[subDir] = {};
      this.dir = this.tree[subDir];
      this.path = subDir;
    }
    mockfs({content: this.tree});
  }

  public writeFile(name: string, content: string): MockContentDir {
    let event = (name in this.dir) ? 'file-changed' : 'file-added';
    this.dir[name] = content;
    mockfs({content: this.tree});
    this.fs.emit(event, join(this.path, name));
    return this;
  }

  public removeFile(name: string): MockContentDir {
    delete(this.dir[name]);
    mockfs({content: this.tree});
    this.fs.emit('file-removed', join(this.path, name));
    return this;
  }
}
