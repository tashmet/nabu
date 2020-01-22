import {Collection, QueryOptions} from '@ziqquratu/ziqquratu';
import {PersistenceAdapter, ObjectMap} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {merge} from 'lodash';

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
    adapter.on('document-updated', (id: string, data: any) => {
      this.load(id, data);
    });
    adapter.on('document-removed', (id: string) => {
      cache.remove({_id: id});
    });
    this.populatePromise = this.populate();
  }

  public async upsert(doc: any): Promise<any> {
    await this.adapter.write(doc._id, doc);
    return this.cache.upsert(doc);
  }

  public async find(selector?: any, options?: QueryOptions): Promise<any[]> {
    await this.populatePromise;
    return this.cache.find(selector, options);
  }

  public async findOne(selector: any): Promise<any> {
    await this.populatePromise;
    return this.cache.findOne(selector);
  }

  public async remove(selector: any): Promise<any[]> {
    const affected = await this.cache.remove(selector);
    for (const doc of affected) {
      await this.adapter.remove(doc._id);
    }
    return affected;
  }

  public async count(selector?: Record<string, any>): Promise<number> {
    await this.populatePromise;
    return this.cache.count(selector);
  }

  public get name(): string {
    return this.cache.name;
  }

  private async load(id: string, doc: Record<string, any>): Promise<any> {
    return this.cache.upsert(merge({}, doc, {_id: id}));
  }

  private async populate(): Promise<void> {
    const data: ObjectMap = await this.adapter.read();
    for (const id of Object.keys(data)) {
      await this.load(id, data[id]);
    }
  }
}
