import _ from 'underscore';
import 'js/utils/formatting';

context('formatting', function() {
  specify('collectionOf', function() {
    const result = _.collectionOf([1, 2, 3], 'id');

    expect(result).to.eql([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  specify('dasherize', function() {
    const result = _.dasherize('foo bar_baz');

    expect(result).to.equal('foo-bar-baz');
  });

  specify('isInteger', function() {
    expect(_.isInteger(1)).to.be.true;

    expect(_.isInteger(1.2)).to.be.false;

    expect(_.isInteger('a')).to.be.false;
  });

  specify('hasAllText', function() {
    expect(_.hasAllText(), 'no str').to.be.false;

    const result = _.hasAllText('This is a Test test', 'test');

    expect(result, 'contains string').to.be.true;

    const result2 = _.hasAllText('This is a Test test', 'nothere');

    expect(result2, 'does not contains string').to.be.false;

    const result3 = _.hasAllText('This is a Test test', 'test nothere');

    expect(result3, 'contains only one word').to.be.false;
  });

  specify('matchText', function() {
    expect(_.matchText(), 'no str').to.be.undefined;

    const result = _.matchText('This is a test', 'test');

    expect(result, 'default tag').to.equal('This is a <strong>test</strong>');

    const result2 = _.matchText('This is a test', 'test', 'p class="test"', 'p');

    expect(result2).to.equal('This is a <p class="test">test</p>');
  });

  specify('px', function() {
    expect(_.px(25.25)).to.equal('25.25px');
  });

  specify('renderNewline', function() {
    expect(_.renderNewline('this\nis some text\n\nwith linebreaks'))
      .to.equal('this<br>is some text<br><br>with linebreaks');

    expect(_.renderNewline('this\r\nis some text\rwith linebreaks'))
      .to.equal('this<br>is some text<br>with linebreaks');
  });

  specify('removeNewline', function() {
    expect(_.removeNewline('this\nis some text\n\nwith linebreaks'))
      .to.equal('this is some text  with linebreaks');
  });

  specify('searchSanitize', function() {
    const result = _.searchSanitize('   Hi@-World-');

    expect(result).to.equal('hi world');
  });

  specify('slugify', function() {
    const result = _.slugify('-Hi-World-');

    expect(result).to.equal('hi-world');
  });

  specify('startsWith', function() {
    expect(_.startsWith(), 'no str').to.be.undefined;

    expect(_.startsWith('test'), 'no starts').to.be.undefined;

    expect(_.startsWith('hello', 'h')).to.be.true;

    expect(_.startsWith('hello', 'e')).to.be.false;
  });

  specify('trim', function() {
    expect(_.trim(), 'no str').to.equal('');

    expect(_.trim(' trim '), 'no character').to.equal('trim');

    expect(_.trim(':: trim::', ':'), 'custom character').to.equal(' trim');
  });

  specify('underscored', function() {
    expect(_.underscored(), 'no str').to.be.undefined;

    const result = _.underscored('foo bar-baz');

    expect(result).to.equal('foo_bar_baz');
  });

  specify('words', function() {
    expect(_.words(), 'no str').to.be.lengthOf(0);

    expect(_.words('test this'), 'no delimiter').to.eql(['test', 'this']);

    expect(_.words('test:this', ':'), 'custom delimiter').to.eql(['test', 'this']);
  });
});
