export {file} from './sources/file';
export {directory} from './sources/directory';
export * from './interfaces';

import {component, inject, Injector} from '@ziggurat/tiamat';
import {IsimudPersistence} from '@ziggurat/isimud-persistence';
import {FileSystemReporter} from './reporter';
import * as chokidar from 'chokidar';

@component({
  definitions: {
    'chokidar.FSWatcher': chokidar.watch([], {
      ignoreInitial: true,
      persistent: true
    })
  },
  providers: [
    FileSystemReporter
  ],
  dependencies: [
    IsimudPersistence
  ]
})
export class IsimudFS {
  public constructor(
    @inject('tiamat.Injector') injector: Injector
  ) {
    if (!injector.get('isimud.FileSystemConfig')) {
      injector.registerInstance('isimud.FileSystemConfig', {
        watch: false
      });
    }
  }
}
