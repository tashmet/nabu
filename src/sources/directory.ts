import {Injector} from '@ziggurat/tiamat';
import {Collection, SourceProducer} from '@ziggurat/isimud';
import {Persistence} from '@ziggurat/isimud-persistence';
import {DirectoryConfig, FileSystemConfig} from '../interfaces';
import {Directory} from '../adapters/directory';
import {FSWatcher} from 'chokidar';

export function directory(config: DirectoryConfig): SourceProducer {
  return (injector: Injector, model: string): Collection => {
    const persistence = injector.get<Persistence>('isimud.Persistence');
    const fsConfig = injector.get<FileSystemConfig>('isimud.FileSystemConfig');
    const watcher = fsConfig.watch ? injector.get<FSWatcher>('chokidar.FSWatcher') : undefined;
    return persistence.createCollection(`isimud.Directory:${config.path}`, model,
      new Directory(config.serializer(injector), config.path, config.extension, watcher)
    );
  };
}
