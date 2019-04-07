import {ModelAnnotation} from '@ziggurat/amelatu';
import {Container} from '@ziggurat/tiamat';
import {Collection, CollectionConfig, Document, SourceProducer} from '@ziggurat/isimud';
import {Persistence} from '@ziggurat/isimud-persistence';
import {FileConfig, FileSystemConfig} from '../interfaces';
import {File} from '../adapters/file';
import {FSWatcher} from 'chokidar';

export function file(config: FileConfig): SourceProducer {
  return (container: Container, ctrlConfig: CollectionConfig): Collection => {
    const persistence = container.get<Persistence>('isimud.Persistence');
    const fsConfig = container.get<FileSystemConfig>('isimud.FileSystemConfig');
    const watcher = fsConfig.watch ? container.get<FSWatcher>('chokidar.FSWatcher') : undefined;
    const modelName = ModelAnnotation.onClass(ctrlConfig.model || Document)[0].name;
    return persistence.createCollection(ctrlConfig, modelName,
      new File(config.serializer(container), config.path, watcher)
    );
  };
}
