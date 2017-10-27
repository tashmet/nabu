import {Injector} from '@ziggurat/tiamat';
import {Collection, Document, Serializer, json} from '@ziggurat/isimud';
import {Directory} from '../../src/adapters/directory';
import {FileSystemService} from '../../src/service';
import {join} from 'path';
import {expect} from 'chai';
import 'mocha';
import * as mockfs from 'mock-fs';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Directory', () => {
  const fs = new FileSystemService({
    path: 'path/to/content'
  });
  const serializer = json()(<Injector>{});
  const readDir = sinon.stub(fs, 'readDir');
  const readFile = sinon.stub(fs, 'readFile');
  const writeFile = sinon.stub(fs, 'writeFile');
  const dir = new Directory(serializer, fs, 'testdir', 'json');

  after(() => {
    readDir.restore();
    readFile.restore();
  });

  describe('read', () => {
    it('should read documents from file system', async () => {
      readDir.withArgs('testdir').returns(Promise.resolve(['doc1.json', 'doc2.json']));
      readFile.withArgs(join('testdir', 'doc1.json')).returns(Promise.resolve('{"foo": "bar"}'));
      readFile.withArgs(join('testdir', 'doc2.json')).returns(Promise.resolve('{"foo": "bar"}'));

      let docs = await dir.read();

      expect(docs).to.eql({
        doc1: {foo: 'bar'},
        doc2: {foo: 'bar'}
      });
    });

    it('should fail to read documents from directory that does not exist', () => {
      readDir.withArgs('testdir').returns(Promise.reject('No such directory'));

      return expect(dir.read()).to.eventually.be.rejected;
    });
  });

  describe('write', () => {
    it('should write a new collection to file', async () => {
      await new Directory(serializer, fs, 'testdir', 'json').write('doc1', {});

      expect(writeFile).to.have.been.calledWith(join('testdir', 'doc1.json'), '{}');
    });
  });

  describe('events', () => {
    before(() => {
      readFile.withArgs(join('testdir', 'doc1.json')).returns(Promise.resolve('{"foo": "bar"}'));
    });

    afterEach(() => {
      dir.removeAllListeners();
    });

    describe('file added in directory', () => {
      it('should trigger document-updated event', (done) => {
        dir.on('document-updated', (id: string, data: Object) => {
          expect(id).to.eql('doc1');
          expect(data).to.eql({foo: 'bar'});
          done();
        });

        fs.emit('file-added', join('testdir', 'doc1.json'));
      });
    });

    describe('file updated in directory', () => {
      it('should trigger document-updated event', (done) => {
        dir.on('document-updated', (id: string, data: Object) => {
          expect(id).to.eql('doc1');
          expect(data).to.eql({foo: 'bar'});
          done();
        });

        fs.emit('file-changed', join('testdir', 'doc1.json'));
      });
    });

    describe('file removed in diretory', () => {
      it('should trigger document-removed event', (done) => {
        dir.on('document-removed', (id: string) => {
          expect(id).to.eql('doc1');
          done();
        });

        fs.emit('file-removed', join('testdir', 'doc1.json'));
      });
    });
  });
});
