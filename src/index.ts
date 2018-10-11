export {file} from './sources/file';
export {directory} from './sources/directory';
export * from './interfaces';

import {component} from '@ziggurat/tiamat';
import {IsimudPersistence} from '@ziggurat/isimud-persistence';
import {FileSystemReporter} from './reporter';
import * as chokidar from 'chokidar';

@component({
  definitions: {
    'isimud.FSWatcher': chokidar.watch([], {
      ignoreInitial: true,
      persistent: true
    }),
    'isimud.FileSystemConfig': {
      watch: false
    }
  },
  providers: [
    FileSystemReporter
  ],
  dependencies: [
    IsimudPersistence
  ]
})
export class IsimudFS {}
