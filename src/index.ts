export {json} from './json';
export {yaml, YamlConfig} from './yaml';
export {file} from './sources/file';
export {directory} from './sources/directory';
export * from './interfaces';

import {component} from '@ziggurat/tiamat';
import {FileSystemReporter} from './reporter';
import {FileSystemConfig} from './interfaces';
import * as chokidar from 'chokidar';

@component({
  definitions: {
    'chokidar.FSWatcher': chokidar.watch([], {
      ignoreInitial: true,
      persistent: true
    }),
    'nabu.FileSystemConfig': {watch: false} as FileSystemConfig
  },
  providers: [
    FileSystemReporter
  ],
})
export default class Nabu {}
