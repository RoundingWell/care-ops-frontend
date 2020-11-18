// Takes an array and converts each value to the value of the set property
// collectionOf([1,2,3],'id') => [{'id':1}, {'id': 2}, {'id': 3}]

import { map, object } from 'underscore';

export default (list, property) => {
  return map(list, function(item) {
    return object([property], [item]);
  });
};
