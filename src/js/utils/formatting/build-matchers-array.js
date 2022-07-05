import { map } from 'underscore';

import words from 'js/utils/formatting/words';

export default query => {
  const searchWords = words(query);

  return map(searchWords, function(word) {
    word = RegExp.escape(word);

    return new RegExp(`\\b${ word }`, 'i');
  });
};
