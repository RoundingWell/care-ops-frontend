import { every } from 'underscore';

import buildMatcher from 'js/utils/formatting/build-matcher';
import words from 'js/utils/formatting/words';

export default (text, query) => {
  if (!text) return false;

  return every(words(query), queryWord => {
    const matcher = buildMatcher(queryWord);

    return !!String(text).match(matcher);
  });
};
