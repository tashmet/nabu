import {Injector} from '@ziggurat/tiamat';
import {Collection, Document, Serializer, json} from '@ziggurat/isimud';
import {ObjectMap} from '@ziggurat/isimud-persistence';
import {File} from '../../src/adapters/file';
import {FileSystemService} from '../../src/service';
import {expect} from 'chai';
import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('File', () => {
  const fs = new FileSystemService({
    path: 'path/to/content'
  });
  const serializer = json()(<Injector>{});
  const readFile = sinon.stub(fs, 'readFile');
  const writeFile = sinon.stub(fs, 'writeFile');
  const file = new File(serializer, fs, 'collection.json');

  after(() => {
    readFile.restore();
  });

  describe('read', () => {
    before(() => {
      readFile.withArgs('collection.json').returns(
        Promise.resolve('{"doc1": {"foo": "bar"}, "doc2": {"foo": "bar"}}'));
    });

    it('should read documents from file system', async () => {
      let docs = await new File(serializer, fs, 'collection.json').read();

      expect(docs).to.eql({
        doc1: {foo: 'bar'},
        doc2: {foo: 'bar'}
      });
    });

    it('should get an empty list of documents from file that does not exist', async () => {
      let docs = await new File(serializer, fs, 'noSuchFile.json').read();

      expect(docs).to.be.empty;
    });
  });

  describe('write', () => {
    it('should write a new collection to file', async () => {
      await new File(serializer, fs, 'collection.json').write('doc1', {});

      expect(writeFile).to.have.been.calledWith('collection.json', '{"doc1":{}}');
    });
  });

  describe('events', () => {
    afterEach(() => {
      file.removeAllListeners();
    });

    describe('file added', () => {
      before(() => {
        readFile.withArgs('collection.json').returns(
          Promise.resolve('{"doc1": {"foo": "bar"}}'));
      });

      it('should trigger document-updated event', (done) => {
        file.on('document-updated', (id: string, data: Object) => {
          expect(id).to.eql('doc1');
          expect(data).to.eql({foo: 'bar'});
          done();
        });

        fs.emit('file-added', 'collection.json');
      });
    });

    describe('file changed', () => {
      before(async () => {
        readFile.withArgs('collection.json').returns(Promise.resolve('{"doc1": {}, "doc2": {}}'));
        await file.read();
      });

      it('should trigger document-updated event when a document has changed', (done) => {
        file.on('document-updated', (id: string, data: Object) => {
          expect(id).to.eql('doc2');
          expect(data).to.eql({foo: 'new content'});
          done();
        });

        readFile.withArgs('collection.json').returns(
          Promise.resolve('{"doc1": {}, "doc2": {"foo": "new content"}}'));
        fs.emit('file-changed', 'collection.json');
      });

      it('should trigger document-removed event when a document has been removed', (done) => {
        file.on('document-removed', (id: string) => {
          expect(id).to.eql('doc2');
          done();
        });

        readFile.withArgs('collection.json').returns(Promise.resolve('{"doc1": {}}'));
        fs.emit('file-changed', 'collection.json');
      });
    });
  });
});
