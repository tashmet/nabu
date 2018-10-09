import {ModelAnnotation} from '@ziggurat/amelatu';
import {Newable} from '@ziggurat/meta';
import {Injector} from '@ziggurat/tiamat';
import {Collection, CollectionConfig, SourceProducer} from '@ziggurat/isimud';
import {Persistence} from '@ziggurat/isimud-persistence';
import {FileConfig, FileSystemConfig} from '../interfaces';
import {File} from '../adapters/file';
import {FSWatcher} from 'chokidar';

export function file(config: FileConfig): SourceProducer {
  return (injector: Injector, ctrlConfig: CollectionConfig, model: Newable<any>): Collection => {
    const persistence = injector.get<Persistence>('isimud.Persistence');
    const fsConfig = injector.get<FileSystemConfig>('isimud.FileSystemConfig');
    const watcher = fsConfig.watch ? injector.get<FSWatcher>('chokidar.FSWatcher') : undefined;
    const modelName = ModelAnnotation.onClass(model)[0].name;
    return persistence.createCollection(`isimud.File:${config.path}`, modelName,
      new File(config.serializer(injector), config.path, watcher)
    );
  };
}
