import _ from 'underscore';

// For use of escaping a string for within a regex
// http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex#6969486
RegExp.escape = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

// Underscore uses {{ }} and {{{ }}}
_.templateSettings = {
  interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
  escape: /\{\{([\s\S]+?)\}\}(?!\})/g,
};

// keyCodes
_.extend(_, {
  BACKSPACE_KEY: 8,
  TAB_KEY: 9,
  ENTER_KEY: 13,
  SHIFT_KEY: 16,
  ESCAPE_KEY: 27,
  LEFT_KEY: 37,
  UP_KEY: 38,
  RIGHT_KEY: 39,
  DOWN_KEY: 40,
  AT_KEY_SHIFT: 50,
});


// takes a search string and builds a search for each word without the match tag
function __buildMatchers(memoKey, query, pretag, posttag) {
  const searchWords = _.words(_.search_sanitize(query));

  return _.map(searchWords, function(word) {
    word = RegExp.escape(word);

    // https://regex101.com/r/zJ1qP6/2
    return new RegExp(`<${ pretag }>|<\/${ posttag }>|(^${ word })|\\s(${ word })`, 'gi');
  });
}

// a memoized version of buildMatchers so that any particular RegExp only needs to be built once
function _buildMatchers(query, pretag, posttag) {
  return __buildMatchers.apply(this, [query + pretag + posttag].concat(_.rest(arguments, 0)));
}

// wraps regex's matched strings in the pretag/postag
function _tagText(text, matchers, pretag, posttag) {
  if (!text) return;

  // Encode existing html
  text = _.escape(text);

  _.each(matchers, matcher => {
    text = text.replace(matcher, `<${ pretag }>$&</${ posttag }>`);
  });

  return text;
}

/**
 * Various Underscore.js mix-ins.
 */
_.mixin({
  // Takes an array and converts each value to the value of the set property
  // _.collectionOf([1,2,3],'id') => [{'id':1}, {'id': 2}, {'id': 3}]
  collectionOf(list, property) {
    return _.map(list, function(item) {
      return _.object([property], [item]);
    });
  },

  dasherize(str) {
    return _.trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
  },

  isInteger(mixedVar) {
    return ((parseFloat(mixedVar) === parseInt(mixedVar, 10)) && !isNaN(mixedVar));
  },

  // finds results from a query string within the text passed
  // and wraps it in the pretag posttag.  Defaulting to <strong></strong>
  matchText(text, query, pretag, posttag) {
    pretag = pretag || 'strong';
    posttag = posttag || pretag;

    const matchers = _.memoize(_buildMatchers)(query, pretag, posttag);

    return _tagText(text, matchers, pretag, posttag);
  },

  px(num) {
    return `${ parseFloat(num) }px`;
  },

  renderNewline(str) {
    return str && str.replace(/(\r\n|\n|\r)/g, '<br>');
  },

  removeNewline(str) {
    return str && str.replace(/(\r\n|\n|\r)/gm, ' ');
  },

  search_sanitize(str) {
    str = String(str);

    // dashes to spaces
    str = str.replace(/\-/g, ' ');

    // all non alphanumeric characters are removed
    str = str.replace(/[^\w\s]/g, '');

    return _.trim(str).toLowerCase();
  },

  slugify(str) {
    return _.trim(_.dasherize(str.replace(/[^\w\s-]/g, '-').toLowerCase()), '-');
  },

  startsWith(str, starts) {
    if (!str || !starts) return;
    str = String(str);
    starts = String(starts);
    return str.lastIndexOf(starts, 0) === 0;
  },

  trim(str = '', characters) {
    str = String(str);
    if (!characters) return str.trim();
    return str.replace(new RegExp(`^${ characters }+|${ characters }+$`, 'g'), '');
  },

  underscored(str) {
    if (!str) return str;

    return _.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
  },

  words(str, delimiter) {
    if (_.isEmpty(str)) {
      return [];
    }

    return _.trim(str, delimiter).split(delimiter || /\s+/);
  },
});
