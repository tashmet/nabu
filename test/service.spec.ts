import {FileSystemService} from '../src/service';
import {expect} from 'chai';
import 'mocha';
import * as mockfs from 'mock-fs';

describe('FileSystemService', () => {
  let fs = new FileSystemService();
  mockfs({
    content: {
      file1: 'file1 contents'
    }
  })

  after(() => {
    mockfs.restore();
  });

  it('should read a file', () => {
    return fs.readFile('file1').then(data => {
      expect(data).to.eql('file1 contents');
    });
  });
});