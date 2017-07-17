import {inject, provider, activate, Injector} from '@samizdatjs/tiamat';
import {Collection, LocalDatabase, Serializer, CollectionBase} from '@samizdatjs/tashmetu';
import {FileSystem, FSStorageAdapter} from './interfaces';
import {basename, dirname, join} from 'path';
import {Directory} from './directory';
import {File} from './file';

@provider({
  for: 'tashmetu.FSCollectionManager',
  singleton: true
})
export class FSCollectionManager {
  private collections: {[name: string]: FSStorageAdapter} = {};
  private storing = '';

  public constructor(
    @inject('tiamat.Injector') private injector: Injector,
    @inject('tashmetu.LocalDatabase') private cache: LocalDatabase,
    @inject('tashmetu.FileSystem') private fs: FileSystem
  ) {
    fs.on('file-added', (path: string) => {
      this.update(path);
    });
    fs.on('file-changed', (path: string) => {
      this.update(path);
    });
  }

  @activate('tashmetu.Directory')
  public activateDirectory(obj: CollectionBase): CollectionBase {
    let config = Reflect.getOwnMetadata('tashmetu:directory', obj.constructor);
    let serializer = config.serializer(this.injector);
    let cache = this.cache.createCollection(config.name);

    obj.setCollection(cache);

    this.collections[config.path] = new Directory(
      cache, serializer, this.fs, config);

    return obj;
  }

  @activate('tashmetu.File')
  public activateFile(obj: CollectionBase): CollectionBase {
    let config = Reflect.getOwnMetadata('tashmetu:file', obj.constructor);
    let serializer = config.serializer(this.injector);
    let cache = this.cache.createCollection(config.name);

    obj.setCollection(cache);

    this.collections[config.path] = new File(
      cache, serializer, this.fs, config);

    return obj;
  }

  private getCollection(path: string): FSStorageAdapter {
    if (path.indexOf('/') > 0) {
      return this.collections[basename(dirname(path))];
    } else {
      return this.collections[path];
    }
  }

  private update(path: string): void {
    if (this.storing !== path) {
      let col = this.getCollection(path);
      if (col) {
        col.update(path);
      }
    } else {
      this.storing = '';
    }
  }
}
