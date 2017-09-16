import {Document, Serializer} from '@ziggurat/isimud';
import {PersistenceAdapter} from '@ziggurat/isimud-persistence';
import {FileSystem} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {basename, dirname, join} from 'path';
import {map} from 'lodash';
import * as Promise from 'bluebird';

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
  }

  public read(): Promise<Document[]> {
    return this.fs.readDir(this.path)
      .then((files: string[]) => {
        const promises = map(files, file => {
          return this.loadFile(join(this.path, file));
        });
        return Promise.all(promises);
      });
  }

  public write(docs: Document[]): Promise<void> {
    const promises = map(docs, (doc) => {
      return this.serializer.serialize(doc).then(data => {
        const path = join(this.path, `${doc._id}.${this.extension}`);
        return this.fs.writeFile(path, data);
      });
    });
    return Promise.all(promises).then(() => {
      return Promise.resolve();
    });
  }

  private loadFile(path: string): Promise<Document> {
    return this.fs.readFile(path)
      .then(data => {
        return this.serializer.deserialize(data);
      })
      .then(obj => {
        const doc = <Document>obj;
        doc._id = basename(path).split('.')[0];
        return doc;
      });
  }

  private onFileUpdated(filePath: string) {
    if (basename(dirname(filePath)) === this.path) {
      this.loadFile(filePath).then((doc: Document) => {
        this.emit('document-upserted', doc);
      });
    }
  }
}
