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

  public async read(): Promise<Document[]> {
    return Promise.all(map(await this.fs.readDir(this.path), file => {
      return this.loadFile(join(this.path, file));
    }));
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

  private async loadFile(path: string): Promise<Document> {
    let doc = <Document>await this.serializer.deserialize(await this.fs.readFile(path));
    doc._id = this.getId(path);
    return doc;
  }

  private async onFileUpdated(path: string) {
    if (basename(dirname(path)) === this.path) {
      this.emit('document-updated', await this.loadFile(path));
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
