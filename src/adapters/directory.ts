import {Collection, Document, Serializer, QueryOptions} from '@ziggurat/isimud';
import {PersistenceAdapter} from '@ziggurat/isimud-persistence';
import {FileSystem, DirectoryConfig} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {basename, dirname, join} from 'path';
import {map} from 'lodash';
import * as Promise from 'bluebird';

export class Directory extends EventEmitter implements PersistenceAdapter {
  public constructor(
    private serializer: Serializer,
    private fs: FileSystem,
    private config: DirectoryConfig
  ) {
    super();
  }

  public read(): Promise<Document[]> {
    return this.fs.readDir(this.config.path)
      .then((files: string[]) => {
        const promises = map(files, file => {
          return this.loadFile(file);
        });
        return Promise.all(promises);
      });
  }

  public write(docs: Document[]): Promise<void> {
    const promises = map(docs, (doc) => {
      return this.serializer.serialize(doc).then(data => {
        const path = join(this.config.path, `${doc._id}.${this.config.extension}`);
        return this.fs.writeFile(path, data);
      });
    });
    return Promise.all(promises).then(() => {
      return Promise.resolve();
    });
  }

  private loadFile(path: string): Promise<Document> {
    return this.fs.readFile(join(this.config.path, path))
      .then(data => {
        return this.serializer.deserialize(data);
      })
      .then(obj => {
        const doc = <Document>obj;
        doc._id = path.split('.')[0];
        return doc;
      });
  }
}
