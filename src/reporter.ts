import {provider} from '@ziqquratu/ziqquratu';
import {FSWatcher} from 'chokidar';
import * as log from 'fancy-log';
import * as chalk from 'chalk';

@provider({
  key: 'nabu.FileSystemReporter',
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
