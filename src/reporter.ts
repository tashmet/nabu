import {provider, inject} from '@ziggurat/tiamat';
import {FSWatcher} from 'chokidar';
import * as chalk from 'chalk';

let log = require('fancy-log');

@provider({
  key: 'isimud.FileSystemReporter'
})
export class FileSystemReporter {
  public constructor(
    @inject('chokidar.FSWatcher') watcher: FSWatcher
  ) {
    watcher
      .on('add',    path => log(chalk.cyan('ADD ') + path))
      .on('change', path => log(chalk.cyan('CHG ') + path))
      .on('unlink', path => log(chalk.cyan('REM ') + path));
  }
}
