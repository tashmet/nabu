import {provider} from '@ziggurat/tiamat';
import {FSWatcher} from 'chokidar';
import * as chalk from 'chalk';

let log = require('fancy-log');

@provider({
  key: 'isimud.FileSystemReporter',
  inject: ['chokidar.FSWatcher']
})
export class FileSystemReporter {
  public constructor(watcher: FSWatcher) {
    watcher
      .on('add',    path => log(chalk.cyan('ADD ') + path))
      .on('change', path => log(chalk.cyan('CHG ') + path))
      .on('unlink', path => log(chalk.cyan('REM ') + path));
  }
}
