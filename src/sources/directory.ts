import {Injector} from '@ziggurat/tiamat';
import {Collection, SourceProvider} from '@ziggurat/isimud';
import {Persistence, PersistenceAdapter} from '@ziggurat/isimud-persistence';
import {DirectoryConfig} from '../interfaces';
import {Directory} from '../adapters/directory';
import {FSWatcher} from 'chokidar';

export function directory(config: DirectoryConfig): SourceProvider {
  return (injector: Injector, model: string): Collection => {
    const persistence = injector.get<Persistence>('isimud.Persistence');
    const watcher = injector.get<FSWatcher>('isimud.FSWatcher');
    return persistence.createCollection(`isimud.Directory:${config.path}`, model,
      new Directory(config.serializer(injector), config.path, config.extension,
        config.watch ? watcher : undefined)
    );
  };
}
