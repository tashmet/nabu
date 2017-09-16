export {file} from './sources/file';
export {directory} from './sources/directory';
export * from './interfaces';

import {component} from '@ziggurat/tiamat';
import {FileSystemService} from './service';
import {FileSystemReporter} from './reporter';

@component({
  providers: [
    FileSystemService,
    FileSystemReporter
  ]
})
export class IsimudFS {}
