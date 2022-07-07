import { map } from 'underscore';

import words from 'js/utils/formatting/words';

export default query => {
  const searchWords = map(words(query), RegExp.escape);

  return map(searchWords, function(word) {
    return new RegExp(`\\b${ word }`, 'i');
  });
};
