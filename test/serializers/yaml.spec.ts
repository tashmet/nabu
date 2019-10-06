import {YamlSerializer} from '../../src/serializers/yaml';
import {expect} from 'chai';
import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as dedent from 'dedent';

chai.use(chaiAsPromised);

describe('YamlSerializer', () => {
  describe('deserialize', () => {
    it('should provide a plain object for valid yaml', () => {
      let ys = new YamlSerializer({});
      let yaml = dedent`
        title: foo
        list:
          - item1
          - item2
      `;
      return ys.deserialize(Buffer.from(yaml, 'utf-8')).then(obj => {
        expect(obj).to.eql({title: 'foo', list: ['item1', 'item2']});
      });
    });

    it('should reject promise with error for invalid yaml', () => {
      let ys = new YamlSerializer({});
      let yaml = dedent`
        foo: *unknownAlias
      `;
      return expect(ys.deserialize(Buffer.from(yaml, 'utf-8'))).to.be.rejectedWith(Error);
    });

    it('should handle yaml front matter', () => {
      let ys = new YamlSerializer({frontMatter: true});
      let yaml = dedent`
        ---
        title: foo
        ---
        Content goes here
      `;
      return ys.deserialize(Buffer.from(yaml, 'utf-8')).then(obj => {
        expect(obj).to.eql({title: 'foo', _content: 'Content goes here'});
      });
    });

    it('should store content under custom key', () => {
      let ys = new YamlSerializer({frontMatter: true, contentKey: 'text'});
      let yaml = dedent`
        ---
        title: foo
        ---
        Content goes here
      `;
      return ys.deserialize(Buffer.from(yaml, 'utf-8')).then(obj => {
        expect(obj).to.eql({title: 'foo', text: 'Content goes here'});
      });
    });
  });

  describe('serialize', () => {
    it('should provide yaml data for a plain object', () => {
      let ys = new YamlSerializer({});
      let plain = {title: 'foo', list: ['item1', 'item2']};
      let expected = dedent`
        title: foo
        list:
          - item1
          - item2
      `;
      return ys.serialize(plain).then(output => {
        expect(output.toString('utf-8').trim()).to.eql(expected.trim());
      });
    });

    it('should handle yaml front matter', () => {
      let ys = new YamlSerializer({frontMatter: true});
      let plain = {title: 'foo', _content: 'Content goes here'};
      let expected = dedent`
        ---
        title: foo
        ---
        Content goes here
      `;
      return ys.serialize(plain).then(output => {
        expect(output.toString('utf-8').trim()).to.eql(expected.trim());
      });
    });

    it('should serialize content under custom key', () => {
      let ys = new YamlSerializer({frontMatter: true, contentKey: 'text'});
      let plain = {title: 'foo', text: 'Content goes here'};
      let expected = dedent`
        ---
        title: foo
        ---
        Content goes here
      `;
      return ys.serialize(plain).then(output => {
        expect(output.toString('utf-8').trim()).to.eql(expected.trim());
      });
    });
  });
});
