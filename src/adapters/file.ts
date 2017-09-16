import {Document, Serializer} from '@ziggurat/isimud';
import {PersistenceAdapter} from '@ziggurat/isimud-persistence';
import {FileSystem} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {map} from 'lodash';
import * as Promise from 'bluebird';

export class File extends EventEmitter implements PersistenceAdapter {
  public constructor(
    private serializer: Serializer,
    private fs: FileSystem,
    private path: string
  ) {
    super();
    fs.on('file-added',   (filePath: string) => { this.onFileUpdated(filePath); });
  }

  public read(): Promise<Document[]> {
    return this.readFile().then((dict: any) => {
      return map(dict, (doc: Document, id: string) => {
        doc._id = id;
        return doc;
      });
    });
  }

  public write(docs: Document[]): Promise<void> {
    // TODO: Implement
    return Promise.resolve();
  }

  private readFile(): Promise<object> {
    return this.fs.readFile(this.path)
      .then((data: string) => {
        return this.serializer.deserialize(data);
      });
  }

  private onFileUpdated(path: string) {
    if (path === this.path) {
      this.read().then((docs: Document[]) => {
        docs.forEach(doc => {
          this.emit('document-updated', doc);
        });
      });
    }
  }
}
