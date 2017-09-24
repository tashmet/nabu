import {Injector} from '@ziggurat/tiamat';
import {Collection, Document, Serializer, json} from '@ziggurat/isimud';
import {File} from '../../src/adapters/file';
import {FileSystemService} from '../../src/service';
import {MockContentDir} from '../mocks';
import {expect} from 'chai';
import 'mocha';
import * as mockfs from 'mock-fs';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('File', () => {
  let serializer = json()(<Injector>{});

  after(() => {
    mockfs.restore();
  });

  describe('read', () => {
    let fs = new FileSystemService();

    before(() => {
      let content = new MockContentDir(fs)
        .writeFile('collection.json', '{"doc1": {"foo": "bar"}, "doc2": {"foo": "bar"}}');
    });

    it('should read documents from file system', () => {
      let file = new File(serializer, fs, 'collection.json');

      return file.read().then((docs: Document[]) => {
        expect(docs).to.have.lengthOf(2);
        expect(docs).to.have.deep.members([
          {_id: 'doc1', foo: 'bar'},
          {_id: 'doc2', foo: 'bar'}
        ]);
      });
    });

    it('should get an empty list of documents from file that does not exist', () => {
      let file = new File(serializer, fs, 'noSuchFile.json');

      return file.read().then((docs: Document[]) => {
        expect(docs).to.be.empty;
      });
    });
  });

  describe('file added', () => {
    let fs = new FileSystemService();
    let content: MockContentDir;

    before(() => {
      content = new MockContentDir(fs);
    });

    it('should trigger document-updated event', (done) => {
      new File(serializer, fs, 'collection.json')
        .on('document-updated', (doc: Document) => {
          expect(doc).to.eql({_id: 'doc1'});
          done();
        });

      content.writeFile('collection.json', '{"doc1": {}}');
    });
  });

  describe('document changed in file', () => {
    let fs = new FileSystemService();
    let content: MockContentDir;

    before(() => {
      content = new MockContentDir(fs)
        .writeFile('collection.json', '{"doc1": {}, "doc2": {}}');
    });

    it('should trigger document-updated event', (done) => {
      let file = new File(serializer, fs, 'collection.json');
      file.read().then((docs: Document[]) => {
        file.on('document-updated', (doc: Document) => {
          expect(doc).to.eql({_id: 'doc2', foo: 'new content'});
          done();
        });

        content.writeFile('collection.json', '{"doc1": {}, "doc2": {"foo": "new content"}}');
      });
    });
  });

  describe('document removed from file', () => {
    let fs = new FileSystemService();
    let content: MockContentDir;

    before(() => {
      content = new MockContentDir(fs)
        .writeFile('collection.json', '{"doc1": {}, "doc2": {}}');
    });

    it('should trigger document-removed event', (done) => {
      let file = new File(serializer, fs, 'collection.json');
      file.read().then((docs: Document[]) => {
        file.on('document-removed', (id: string) => {
          expect(id).to.eql('doc2');
          done();
        });

        content.writeFile('collection.json', '{"doc1": {}}');
      });
    });
  });
});
