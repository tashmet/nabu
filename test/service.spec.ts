import {FileSystemService} from '../src/service';
import {expect} from 'chai';
import 'mocha';
import * as mockfs from 'mock-fs';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('FileSystemService', () => {
  let fs = new FileSystemService();

  before(() => {
    mockfs({
      content: {
        file1: 'file1 contents',
        subdir: {
          file2: 'file2 contents',
          file3: 'file3 contents'
        }
      }
    });
  });

  after(() => {
    mockfs.restore();
  });

  describe('readFile', () => {
    it('should read a file', () => {
      return fs.readFile('file1').then(data => {
        expect(data).to.eql('file1 contents');
      });
    });

    it('should read fail to read a file that does not exist', () => {
      return expect(fs.readFile('file2')).to.be.rejected;
    });
  });

  describe('readDir', () => {
    it('should read a directory', () => {
      return fs.readDir('subdir').then(files => {
        expect(files).to.eql(['file2', 'file3']);
      });
    });

    it('should fail to read a directory that does not exist', () => {
      return expect(fs.readDir('noSuchDir')).to.be.rejected;
    });

    it('should fail to read a path that is a file', () => {
      return expect(fs.readDir('file1')).to.be.rejected;
    });
  });

  describe('writeFile', () => {
    it('should write to a file', () => {
      return fs.writeFile('file1', 'new contents').then(() => {
        return fs.readFile('file1').then(data => {
          expect(data).to.eql('new contents');
        });
      });
    });
  });
});