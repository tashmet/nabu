import {ModelAnnotation} from '@ziggurat/amelatu';
import {Newable} from '@ziggurat/meta';
import {Injector} from '@ziggurat/tiamat';
import {Collection, CollectionConfig, SourceProducer} from '@ziggurat/isimud';
import {Persistence} from '@ziggurat/isimud-persistence';
import {DirectoryConfig, FileSystemConfig} from '../interfaces';
import {Directory} from '../adapters/directory';
import {FSWatcher} from 'chokidar';

export function directory(config: DirectoryConfig): SourceProducer {
  return (injector: Injector, ctrlConfig: CollectionConfig, model: Newable<any>): Collection => {
    const persistence = injector.get<Persistence>('isimud.Persistence');
    const fsConfig = injector.get<FileSystemConfig>('isimud.FileSystemConfig');
    const watcher = fsConfig.watch ? injector.get<FSWatcher>('chokidar.FSWatcher') : undefined;
    const modelName = ModelAnnotation.onClass(model)[0].name;
    return persistence.createCollection(`isimud.Directory:${config.path}`, modelName,
      new Directory(config.serializer(injector), config.path, config.extension, watcher)
    );
  };
}
