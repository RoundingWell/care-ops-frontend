import { isEmpty } from 'underscore';

import trim from 'js/utils/formatting/trim';

export default (str, delimiter) => {
  if (isEmpty(str)) {
    return [];
  }

  return trim(str, delimiter).split(delimiter || /\s+/);
};
