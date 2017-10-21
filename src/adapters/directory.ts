import {Document, Serializer} from '@ziggurat/isimud';
import {PersistenceAdapter} from '@ziggurat/isimud-persistence';
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
        doc._id = this.getId(path);
        return doc;
      });
  }

  private onFileUpdated(path: string) {
    if (basename(dirname(path)) === this.path) {
      this.loadFile(path).then((doc: Document) => {
        this.emit('document-updated', doc);
      });
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
