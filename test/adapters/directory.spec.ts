import {Injector} from '@ziggurat/tiamat';
import {Collection, Document, Serializer, json} from '@ziggurat/isimud';
import {Directory} from '../../src/adapters/directory';
import {FileSystemService} from '../../src/service';
import {expect} from 'chai';
import 'mocha';
import * as mockfs from 'mock-fs';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);


describe('Directory', () => {
  let fs = new FileSystemService();
  let serializerProvider = json();
  let serializer = serializerProvider(<Injector>{});

  let dir = new Directory(serializer, fs, {
    path: 'testdir',
    extension: 'json',
    serializer: json()
  });

  before(() => {
    mockfs({
      content: {
        testdir: {
          'doc1.json': '{"foo": "bar"}',
          'doc2.json': '{"foo": "bar"}'
        }
      }
    });
  });

  after(() => {
    mockfs.restore();
  });

  describe('read', () => {
    it('should read documents from file system', () => {
      return dir.read().then((docs: Document[]) => {
        expect(docs).to.have.lengthOf(2);
        expect(docs).to.have.deep.members([
          {_id: 'doc1', foo: 'bar'},
          {_id: 'doc2', foo: 'bar'}
        ]);
      });
    });
  });
});
