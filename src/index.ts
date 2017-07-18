import {component, Injector} from '@samizdatjs/tiamat';
import {Collection} from '@samizdatjs/tashmetu';
import {FileSystemReporter} from './reporter';
import {FileSystemService} from './service';
import {FSCollectionManager} from './manager';
import {FileConfig, DirectoryConfig} from './interfaces';

export {FileSystem} from './interfaces';

@component({
  providers: [
    FileSystemService,
    FileSystemReporter,
    FSCollectionManager
  ]
})
export class TashmetuFS {}

export function directory(config: DirectoryConfig) {
  return (injector: Injector): Collection => {
    return injector.get<FSCollectionManager>('tashmetu.FSCollectionManager')
      .createDirectoryCollection(config);
  };
}

export function file(config: FileConfig) {
  return (injector: Injector): Collection => {
    return injector.get<FSCollectionManager>('tashmetu.FSCollectionManager')
      .createFileCollection(config);
  };
}
