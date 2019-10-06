import * as showdown from 'showdown';
import {Converter} from '../interfaces';

export function markdown(options?: showdown.ConverterOptions): Converter {
  return new MarkdownConverter(options);
}

class MarkdownConverter {
  private converter: showdown.Converter;

  public constructor(options?: showdown.ConverterOptions) {
    this.converter = new showdown.Converter(options);
  }

  public async publish(text: string): Promise<string> {
    return this.converter.makeHtml(text);
  }
}
