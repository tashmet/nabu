import {Injector} from '@ziggurat/tiamat';
import {Collection, Document, Serializer, json} from '@ziggurat/isimud';
import {FileSystemConfig} from '../../src/interfaces';
import {Directory} from '../../src/adapters/directory';
import {FileSystemService} from '../../src/service';
import {MockContentDir} from '../mocks';
import {join} from 'path';
import {expect} from 'chai';
import 'mocha';
import * as mockfs from 'mock-fs';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('Directory', () => {
  const config: FileSystemConfig = {
    path: join(process.cwd(), 'content')
  };
  let serializer = json()(<Injector>{});

  after(() => {
    mockfs.restore();
  });

  describe('read', () => {
    let fs = new FileSystemService(config);

    before(() => {
      let content = new MockContentDir(fs, 'testdir')
        .writeFile('doc1.json', '{"foo": "bar"}')
        .writeFile('doc2.json', '{"foo": "bar"}');
    });

    it('should read documents from file system', async () => {
      let docs = await new Directory(serializer, fs, 'testdir', 'json').read();

      expect(docs).to.have.lengthOf(2);
      expect(docs).to.have.deep.members([
        {_id: 'doc1', foo: 'bar'},
        {_id: 'doc2', foo: 'bar'}
      ]);
    });

    it('should fail to read documents from directory that does not exist', () => {
      let dir = new Directory(serializer, fs, 'noSuchDir', 'json');

      return expect(dir.read()).to.be.rejected;
    });
  });

  describe('file added in directory', () => {
    let fs = new FileSystemService(config);
    let content: MockContentDir;

    before(() => {
      content = new MockContentDir(fs, 'testdir');
    });

    it('should trigger document-updated event', (done) => {
      new Directory(serializer, fs, 'testdir', 'json')
        .on('document-updated', (doc: Document) => {
          expect(doc).to.eql({_id: 'doc1'});
          done();
        });

      content.writeFile('doc1.json', '{}');
    });
  });

  describe('file updated in directory', () => {
    let fs = new FileSystemService(config);
    let content: MockContentDir;

    before(() => {
      content = new MockContentDir(fs, 'testdir')
        .writeFile('doc1.json', '{}')
    });

    it('should trigger document-updated event', (done) => {
      new Directory(serializer, fs, 'testdir', 'json')
        .on('document-updated', (doc: Document) => {
          expect(doc).to.eql({_id: 'doc1', foo: 'new content'});
          done();
        });

      content.writeFile('doc1.json', '{"foo": "new content"}');
    });
  });

  describe('file removed in diretory', () => {
    let fs = new FileSystemService(config);
    let content: MockContentDir;

    before(() => {
      content = new MockContentDir(fs, 'testdir')
        .writeFile('doc1.json', '{}')
    });

    it('should trigger document-removed event', (done) => {
      new Directory(serializer, fs, 'testdir', 'json')
        .on('document-removed', (id: string) => {
          expect(id).to.eql('doc1');
          done();
        });

      content.removeFile('doc1.json');
    });
  });
});
