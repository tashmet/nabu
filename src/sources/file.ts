import {Injector} from '@ziggurat/tiamat';
import {Collection, SourceProvider} from '@ziggurat/isimud';
import {Persistence, PersistenceAdapter} from '@ziggurat/isimud-persistence';
import {FileSystem, FileConfig} from '../interfaces';
import {File} from '../adapters/file';

export function file(config: FileConfig): SourceProvider {
  return (injector: Injector, model: string): Collection => {
    const persistence = injector.get<Persistence>('isimud.Persistence');
    const fs = injector.get<FileSystem>('isimud.FileSystem');
    return persistence.createCollection(`isimud.File:${config.path}`, model,
      new File(config.serializer(injector), fs, config.path)
    );
  };
}
