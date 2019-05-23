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
function _buildMatcher(query) {
  const searchWords = _.map(_.words(_.searchSanitize(query)), RegExp.escape);

  return new RegExp(`\\b${ searchWords.join('|') }`, 'g');
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

  hasText(text, query) {
    if (!text) return false;

    const matcher = _.memoize(_buildMatcher)(query);

    return !!String(text).match(matcher);
  },

  // finds results from a query string within the text passed
  // and wraps it in the pretag posttag.  Defaulting to <strong></strong>
  matchText(text, query, pretag, posttag) {
    if (!text) return;

    pretag = pretag || 'strong';
    posttag = posttag || pretag;

    const matcher = _.memoize(_buildMatcher)(query);

    return text.replace(matcher, `<${ pretag }>$&</${ posttag }>`);
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

  searchSanitize(str) {
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
