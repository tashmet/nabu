import {Injector} from '@ziggurat/tiamat';
import {Collection} from '@ziggurat/isimud';
import {Persistence, PersistenceAdapter} from '@ziggurat/isimud-persistence';
import {FileSystem, DirectoryConfig} from '../interfaces';
import {Directory} from '../adapters/directory';

export function directory(config: DirectoryConfig) {
  return (injector: Injector): Collection => {
    const persistence = injector.get<Persistence>('isimud.Persistence');
    const fs = injector.get<FileSystem>('isimud.FileSystem');
    return persistence.createCollection(`isimud.Directory:${config.path}`,
      new Directory(config.serializer(injector), fs, config.path, config.extension)
    );
  };
}
