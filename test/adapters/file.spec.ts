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
  let fs = new FileSystemService();
  let serializer = json()(<Injector>{});

  before(() => {
    let content = new MockContentDir(fs)
      .writeFile('collection.json', '{"doc1": {"foo": "bar"}, "doc2": {"foo": "bar"}}')
  });

  after(() => {
    mockfs.restore();
  });

  describe('read', () => {
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

    it('should fail to read documents from file that does not exist', () => {
      let file = new File(serializer, fs, 'noSuchFile.json');

      return expect(file.read()).to.be.rejected;
    });
  });
});
