import {provider, inject} from '@ziggurat/tiamat';
import {FileSystem} from './interfaces';
import * as chalk from 'chalk';

let log = require('fancy-log');

@provider({
  key: 'isimud.FileSystemReporter'
})
export class FileSystemReporter {
  public constructor(
    @inject('isimud.FileSystem') fileSys: FileSystem
  ) {
    fileSys.on('file-stored', (data: any, path: string) => {
      log(chalk.cyan('STR ') + path);
    });
  }
}
