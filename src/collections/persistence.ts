import {Collection, Cursor, ReplaceOneOptions, SortingDirection} from '@ziqquratu/ziqquratu';
import {PersistenceAdapter, ObjectMap} from '../interfaces';
import {EventEmitter} from 'eventemitter3';
import {merge} from 'lodash';

export class PersistenceCursor<T = any> implements Cursor<T> {
  public constructor(
    private cursor: Cursor<T>,
    private populatePromise: Promise<void>
  ) {}

  public sort(key: string, direction: SortingDirection): Cursor<T> {
    return this.cursor.sort(key, direction);
  }

  public skip(count: number): Cursor<T> {
    return this.cursor.skip(count);
  }

  public limit(count: number): Cursor<T> {
    return this.cursor.limit(count);
  }

  public async next(): Promise<T | null> {
    await this.populatePromise;
    return this.cursor.next();
  }
  
  public async hasNext(): Promise<boolean> {
    await this.populatePromise;
    return this.cursor.hasNext();
  }

  public async forEach(iterator: (doc: T) => void): Promise<void> {
    await this.populatePromise;
    return this.cursor.forEach(iterator);
  }

  public async toArray(): Promise<T[]> {
    await this.populatePromise;
    return this.cursor.toArray();
  }

  public async count(applySkipLimit = true): Promise<number> {
    await this.populatePromise;
    return this.cursor.count(applySkipLimit);
  }
}

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
      cache.deleteOne({_id: id});
    });
    this.populatePromise = this.populate();
  }

  public toString(): string {
    return `persistence collection '${this.name}' using ${this.adapter.toString()}`;
  }

  public async insertOne(doc: any): Promise<any> {
    await this.adapter.write([doc]);
    return this.cache.insertOne(doc);
  }
  
  public async insertMany(docs: any[]): Promise<any[]> {
    await this.adapter.write(docs);
    return this.cache.insertMany(docs);
  }
  
  public async replaceOne(selector: object, doc: any, options: ReplaceOneOptions = {}): Promise<any> {
    await this.populatePromise;
    const old = await this.cache.findOne(selector);
    if (old) {
      if (doc._id && doc._id !== old._id) {
        await this.adapter.remove([old._id]);
      }
      await this.adapter.write([doc]);
      await this.cache.replaceOne(selector, doc, options);
    } else if (options.upsert) {
      await this.insertOne(doc);
    }
    return null;
  }

  public find(selector?: object): Cursor<any> {
    return new PersistenceCursor(this.cache.find(selector), this.populatePromise);
  }

  public async findOne(selector: any): Promise<any> {
    await this.populatePromise;
    return this.cache.findOne(selector);
  }

  public async deleteOne(selector: any): Promise<any> {
    const affected = await this.cache.deleteOne(selector);
    if (affected) {
      await this.adapter.remove(affected._id);
    }
    return affected;
  }

  public async deleteMany(selector: any): Promise<any[]> {
    const affected = await this.cache.deleteMany(selector);
    await this.adapter.remove(affected.map(d => d._id));
    return affected;
  }

  public get name(): string {
    return this.cache.name;
  }

  private async load(id: string, doc: Record<string, any>): Promise<any> {
    return this.cache.replaceOne({_id: id}, merge({}, doc, {_id: id}), {upsert: true});
  }

  private async populate(): Promise<void> {
    const data: ObjectMap = await this.adapter.read();
    for (const id of Object.keys(data)) {
      await this.load(id, data[id]);
    }
  }
}
