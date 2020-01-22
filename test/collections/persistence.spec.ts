import {Collection, MemoryCollection} from '@ziqquratu/ziqquratu';
import {ObjectMap, PersistenceAdapter} from '../../src/interfaces';
import {PersistenceCollection} from '../../src/collections/persistence';
import {EventEmitter} from 'eventemitter3';
import {expect} from 'chai';
import 'mocha';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(chaiAsPromised);
chai.use(sinonChai);

class MockPersistenceAdapter extends EventEmitter implements PersistenceAdapter {
  public read(): Promise<ObjectMap> {
    return Promise.resolve({});
  }

  public write(id: string, data: any): Promise<void> {
    return Promise.resolve();
  }

  public remove(id: string): Promise<void> {
    return Promise.resolve();
  }
}

describe('PersistenceCollection', () => {
  const cache = new MemoryCollection('test');
  const adapter = new MockPersistenceAdapter();
  let collection: Collection;

  const read = sinon.stub(adapter, 'read');
  const write = sinon.stub(adapter, 'write');

  before(async () => {
    read.returns(Promise.resolve({
      doc1: {},
      doc2: {}
    }));
    collection = new PersistenceCollection(adapter, cache);
  });

  after(() => {
    read.restore();
    write.restore();
  });

  describe('find', () => {
    it('should find all documents', async () => {
      const docs = await collection.find();

      expect(docs).to.have.lengthOf(2);
      expect(docs[0]).to.have.property('_id', 'doc1');
      expect(docs[1]).to.have.property('_id', 'doc2');
    });

    it('should filter with selector', async () => {
      const docs = await collection.find({'_id': 'doc2'});

      expect(docs).to.have.lengthOf(1);
      expect(docs[0]).to.have.property('_id', 'doc2');
    });
  });

  describe('upsert', () => {
    it('should write to persistence adapter', async () => {
      await collection.upsert({_id: 'doc1'});

      expect(write).to.have.been.calledWith('doc1', {_id: 'doc1'});
    });
  });

  describe('events', () => {
    describe('document-updated in persistence adapter', () => {
      it('should trigger document-upserted in collection', (done) => {
        collection.on('document-upserted', (doc: any) => {
          expect(doc._id).to.eql('doc1');
          done();
        });

        adapter.emit('document-updated', 'doc1', {});
      });
    });

    describe('document-removed in persistence adapter', () => {
      it('should trigger document-removed in collection', (done) => {
        collection.on('document-removed', (doc: any) => {
          expect(doc._id).to.eql('doc1');
          done();
        });

        adapter.emit('document-removed', 'doc1');
      });
    });
  });
});
