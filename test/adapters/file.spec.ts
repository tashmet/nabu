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

  describe('file added', () => {
    before(() => {
      readFile.withArgs('collection.json').returns(
        Promise.resolve('{"doc1": {"foo": "bar"}}'));
    });

    it('should trigger document-updated event', (done) => {
      let file = new File(serializer, fs, 'collection.json')
      file.on('document-updated', (id: string, data: Object) => {
        expect(id).to.eql('doc1');
        expect(data).to.eql({foo: 'bar'});
        file.removeAllListeners();
        done();
      });

      fs.emit('file-added', 'collection.json');
    });
  });

  describe('document changed in file', () => {
    before(() => {
      readFile.withArgs('collection.json').returns(
        Promise.resolve('{"doc1": {}, "doc2": {}}'));
    });

    it('should trigger document-updated event', (done) => {
      let file = new File(serializer, fs, 'collection.json');
      file.read().then((data: ObjectMap) => {
        file.on('document-updated', (id: string, data: Object) => {
          expect(id).to.eql('doc2');
          expect(data).to.eql({foo: 'new content'});
          file.removeAllListeners();
          done();
        });

        readFile.withArgs('collection.json').returns(
          Promise.resolve('{"doc1": {}, "doc2": {"foo": "new content"}}'));
        fs.emit('file-changed', 'collection.json');
      });
    });
  });

  describe('document removed from file', () => {
    before(() => {
      readFile.withArgs('collection.json').returns(
        Promise.resolve('{"doc1": {}, "doc2": {}}'));
    });

    it('should trigger document-removed event', (done) => {
      let file = new File(serializer, fs, 'collection.json');
      file.read().then((data: ObjectMap) => {
        file.on('document-removed', (id: string) => {
          expect(id).to.eql('doc2');
          file.removeAllListeners();
          done();
        });

        readFile.withArgs('collection.json').returns(
          Promise.resolve('{"doc1": {}}'));
        fs.emit('file-changed', 'collection.json');
      });
    });
  });
});
