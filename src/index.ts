export {FileSystem} from './interfaces';
export {file, directory} from './manager';
export {FileConfig, DirectoryConfig} from './interfaces';

import {component} from '@samizdatjs/tiamat';
import {FileSystemService} from './service';
import {FileSystemReporter} from './reporter';
import {FSCollectionManager} from './manager';

@component({
  providers: [
    FileSystemService,
    FileSystemReporter,
    FSCollectionManager
  ]
})
export class TashmetuFS {}
