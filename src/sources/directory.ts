import {Container} from '@ziggurat/tiamat';
import {Collection, CollectionProducer, MemoryCollection} from '@ziggurat/ziggurat';
import {PersistenceCollection} from '../persistence';
import {DirectoryConfig, FileSystemConfig} from '../interfaces';
import {Directory} from '../adapters/directory';
import {FSWatcher} from 'chokidar';

export function directory(config: DirectoryConfig): CollectionProducer {
  return (container: Container, name: string): Collection => {
    const fsConfig = container.get<FileSystemConfig>('nabu.FileSystemConfig');
    const watcher = fsConfig.watch ? container.get<FSWatcher>('chokidar.FSWatcher') : undefined;

    return new PersistenceCollection(
      new Directory(config.serializer(container), config.path, config.extension, watcher),
      new MemoryCollection(name)
    );
  };
}
