import * as showdown from 'showdown';
import {Converter} from '../interfaces';

export function markdown(converter: showdown.Converter): Converter {
  return new MarkdownConverter(converter);
}

class MarkdownConverter {
  public constructor(private converter: showdown.Converter) {}

  public async publish(text: string): Promise<string> {
    return this.converter.makeHtml(text);
  }
}
