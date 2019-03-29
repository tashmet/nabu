import {ModelAnnotation} from '@ziggurat/amelatu';
import {Newable} from '@ziggurat/meta';
import {Container} from '@ziggurat/tiamat';
import {Collection, CollectionConfig, SourceProducer} from '@ziggurat/isimud';
import {Persistence} from '@ziggurat/isimud-persistence';
import {DirectoryConfig, FileSystemConfig} from '../interfaces';
import {Directory} from '../adapters/directory';
import {FSWatcher} from 'chokidar';

export function directory(config: DirectoryConfig): SourceProducer {
  return (container: Container, ctrlConfig: CollectionConfig, model: Newable<any>): Collection => {
    const persistence = container.get<Persistence>('isimud.Persistence');
    const fsConfig = container.get<FileSystemConfig>('isimud.FileSystemConfig');
    const watcher = fsConfig.watch ? container.get<FSWatcher>('chokidar.FSWatcher') : undefined;
    const modelName = ModelAnnotation.onClass(model)[0].name;
    return persistence.createCollection(ctrlConfig, modelName,
      new Directory(config.serializer(container), config.path, config.extension, watcher)
    );
  };
}
