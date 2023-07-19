import buildMatcher from './build-matcher';
import buildMatchersArray from './build-matchers-array';
import collectionOf from './collection-of';
import hasAllText from './has-all-text';
import matchText from './match-text';
import px from './px';
import removeNewline from './remove-newline';
import searchSanitize from './search-sanitize';
import trim from './trim';
import underscored from './underscored';
import words from './words';

context('formatting', function() {
  specify('buildMatcher', function() {
    const matcher = buildMatcher('test string');

    expect(matcher).to.eql(/\btest|string/gi);
  });

  specify('buildMatchersArray', function() {
    const matchersArray = buildMatchersArray('test string');

    expect(matchersArray).to.eql([/\btest/i, /\bstring/i]);
  });

  specify('collectionOf', function() {
    const result = collectionOf([1, 2, 3], 'id');

    expect(result).to.eql([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  specify('hasAllText', function() {
    expect(hasAllText(), 'no str').to.be.false;

    const result = hasAllText('This is a Test test', 'test');

    expect(result, 'contains string').to.be.true;

    const result2 = hasAllText('This is a Test test', 'nothere');

    expect(result2, 'does not contains string').to.be.false;

    const result3 = hasAllText('This is a Test test', 'test nothere');

    expect(result3, 'contains only one word').to.be.false;
  });

  specify('matchText', function() {
    expect(matchText(), 'no str').to.be.undefined;

    const result = matchText('This is a test', 'test');

    expect(result, 'default tag').to.equal('This is a <strong>test</strong>');

    const result2 = matchText('This is a test', 'test', 'p class="test"', 'p');

    expect(result2).to.equal('This is a <p class="test">test</p>');
  });

  specify('px', function() {
    expect(px(25.25)).to.equal('25.25px');
  });

  specify('removeNewline', function() {
    const str = 'text\rmore\ntext';

    expect(removeNewline(str)).to.eql('text more text');
  });

  specify('searchSanitize', function() {
    const result = searchSanitize('   Hi@-World-');

    expect(result).to.equal('hi world');
  });

  specify('trim', function() {
    expect(trim(), 'no str').to.equal('');

    expect(trim(' trim '), 'no character').to.equal('trim');

    expect(trim(':: trim::', ':'), 'custom character').to.equal(' trim');
  });

  specify('underscored', function() {
    expect(underscored(), 'no str').to.be.undefined;

    const result = underscored('foo bar-baz');

    expect(result).to.equal('foo_bar_baz');
  });

  specify('words', function() {
    expect(words(), 'no str').to.be.lengthOf(0);

    expect(words('test this'), 'no delimiter').to.eql(['test', 'this']);

    expect(words('test:this', ':'), 'custom delimiter').to.eql(['test', 'this']);
  });
});
