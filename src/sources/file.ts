import {Injector} from '@ziggurat/tiamat';
import {Collection, SourceProducer} from '@ziggurat/isimud';
import {Persistence} from '@ziggurat/isimud-persistence';
import {FileConfig, FileSystemConfig} from '../interfaces';
import {File} from '../adapters/file';
import {FSWatcher} from 'chokidar';

export function file(config: FileConfig): SourceProducer {
  return (injector: Injector, model: string): Collection => {
    const persistence = injector.get<Persistence>('isimud.Persistence');
    const fsConfig = injector.get<FileSystemConfig>('isimud.FileSystemConfig');
    const watcher = fsConfig.watch ? injector.get<FSWatcher>('chokidar.FSWatcher') : undefined;
    return persistence.createCollection(`isimud.File:${config.path}`, model,
      new File(config.serializer(injector), config.path, watcher)
    );
  };
}
