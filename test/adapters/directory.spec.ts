import {Injector} from '@ziggurat/tiamat';
import {Collection, Document, Serializer, json} from '@ziggurat/isimud';
import {Directory} from '../../src/adapters/directory';
import {FileSystemService} from '../../src/service';
import {expect} from 'chai';
import {join} from 'path';
import 'mocha';
import * as mockfs from 'mock-fs';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

class MockContentDir {
  private tree: any = {};

  public constructor(private fs: FileSystemService) {
    mockfs({content: this.tree});
  }

  public writeFile(name: string, content: string, subdir?: string): MockContentDir {
    if (subdir) {
      if (!(subdir in this.tree)) {
        this.tree[subdir] = {};
      }
      this.tree[subdir][name] = content;
    } else {
      this.tree[name] = content;
    }
    mockfs({content: this.tree});
    let path = subdir ? join(subdir, name) : name;
    this.fs.emit('file-added', path);
    return this;
  }
}

describe('Directory', () => {
  let serializer = json()(<Injector>{});

  after(() => {
    mockfs.restore();
  });

  describe('read', () => {
    let fs = new FileSystemService();

    before(() => {
      let content = new MockContentDir(fs)
        .writeFile('doc1.json', '{"foo": "bar"}', 'testdir')
        .writeFile('doc2.json', '{"foo": "bar"}', 'testdir');
    });

    it('should read documents from file system', () => {
      let dir = new Directory(serializer, fs, 'testdir', 'json');

      return dir.read().then((docs: Document[]) => {
        expect(docs).to.have.lengthOf(2);
        expect(docs).to.have.deep.members([
          {_id: 'doc1', foo: 'bar'},
          {_id: 'doc2', foo: 'bar'}
        ]);
      });
    });

    it('should fail to read documents from directory that does not exist', () => {
      let dir = new Directory(serializer, fs, 'noSuchDir', 'json');

      return expect(dir.read()).to.be.rejected;
    });
  });

  describe('file-added event from FileSystemService', () => {
    let fs = new FileSystemService();
    let content: MockContentDir;

    before(() => {
      content = new MockContentDir(fs);
    });

    it('should trigger document-upserted event', (done) => {
      new Directory(serializer, fs, 'testdir', 'json')
        .on('document-upserted', (doc: Document) => {
          expect(doc).to.eql({_id: 'doc1'});
          done();
        });

      content.writeFile('doc1.json', '{}', 'testdir');
    });
  });
});
