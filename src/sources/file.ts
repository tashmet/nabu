import {Container} from '@ziggurat/tiamat';
import {Collection, CollectionProducer, MemoryCollection} from '@ziggurat/ziggurat';
import {PersistenceCollection} from '../persistence';
import {FileConfig, FileSystemConfig} from '../interfaces';
import {File} from '../adapters/file';
import {FSWatcher} from 'chokidar';

export function file(config: FileConfig): CollectionProducer {
  return (container: Container, name: string): Collection => {
    const fsConfig = container.get<FileSystemConfig>('nabu.FileSystemConfig');
    const watcher = fsConfig.watch ? container.get<FSWatcher>('chokidar.FSWatcher') : undefined;

    return new PersistenceCollection(
      new File(config.serializer(container), config.path, watcher),
      new MemoryCollection(name)
    );
  };
}
