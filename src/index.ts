import {component} from '@samizdatjs/tiamat';
import {FileSystemReporter} from './reporter';
import {FileSystemService} from './service';
import {FSCollectionManager} from './manager';

export {FileSystem} from './interfaces';
export {file, directory} from './decorators';

@component({
  providers: [
    FileSystemService,
    FileSystemReporter,
    FSCollectionManager
  ]
})
export class TashmetuFS {}
