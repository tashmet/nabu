import {Collection, QueryOptions} from '@ziggurat/ziggurat';
import {PersistenceAdapter, ObjectMap} from './interfaces';
import {EventEmitter} from 'eventemitter3';

export class PersistenceCollection extends EventEmitter implements Collection {
  private populatePromise: Promise<void>;

  public constructor(
    private adapter: PersistenceAdapter,
    private cache: Collection,
  ) {
    super();
    cache.on('document-upserted', (doc: Document) => {
      this.emit('document-upserted', doc);
    });
    cache.on('document-removed', (doc: Document) => {
      this.emit('document-removed', doc);
    });
    adapter.on('document-updated', (id: string, data: Object) => {
      this.load(id, data);
    });
    adapter.on('document-removed', (id: string) => {
      cache.remove({'@id': id});
    });
    this.populatePromise = this.populate();
  }

  public async upsert(doc: any): Promise<any> {
    await this.adapter.write(doc['@id'], doc);
    return this.cache.upsert(doc);
  }

  public async find(selector?: Object, options?: QueryOptions): Promise<any[]> {
    await this.populatePromise;
    return this.cache.find(selector, options);
  }

  public async findOne(selector: Object): Promise<any> {
    await this.populatePromise;
    return this.cache.findOne(selector);
  }

  public async remove(selector: Object): Promise<any[]> {
    let affected = await this.cache.remove(selector);
    for (let doc of affected) {
      await this.adapter.remove(doc['@id']);
    }
    return affected;
  }

  public async count(selector?: Object): Promise<number> {
    await this.populatePromise;
    return this.cache.count(selector);
  }

  public get name(): string {
    return this.cache.name;
  }

  private async load(id: string, doc: Object): Promise<any> {
    return this.cache.upsert(doc);
  }

  private async populate(): Promise<void> {
    let data: ObjectMap = await this.adapter.read();
    for (let id of Object.keys(data)) {
      await this.load(id, data[id]);
    }
  }
}
