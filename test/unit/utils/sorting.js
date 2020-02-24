// NOTE: these unit tests are intentially using Backbone.Collection
// to facilitate the sorting as that integration is a first-class concern

import Backbone from 'backbone';
import moment from 'moment';

import {
  alphaSort,
  intSortBy,
  numSortBy,
  dateSortBy,
  intSort,
  numSort,
  dateSort,
} from 'js/utils/sorting';

const sorts_fx = [
  {
    alpha: 'a',
    num: 1.1,
    int: 1,
    date: moment(),
    order: 1,
  },
  {
    alpha: 'c',
    num: 3.1,
    int: 3,
    date: moment().add(2, 'days'),
    order: 3,
  },
  {
    alpha: 'b',
    num: 2.1,
    int: 2,
    date: moment().add(1, 'days'),
    order: 2,
  },
  {
    order: 0,
  },
];

const SortCollection = Backbone.Collection.extend({
  getOrder() {
    return this.pluck('order').join();
  },
});

function testSort(getComparator) {
  const sortCol = new SortCollection(sorts_fx);

  sortCol.comparator = getComparator('asc');
  sortCol.sort();
  expect(sortCol.getOrder(), 'asc').to.equal('0,1,2,3');

  sortCol.comparator = getComparator('desc');
  sortCol.sort();
  expect(sortCol.getOrder(), 'desc').to.equal('3,2,1,0');
}

context('sorting', function() {
  specify('alphaSort', function() {
    testSort(sortDir => {
      return function(modelA, modelB) {
        const valA = modelA.get('alpha');
        const valB = modelB.get('alpha');
        return alphaSort(sortDir, valA, valB);
      };
    });
  });

  specify('intSort', function() {
    testSort(sortDir => {
      return function(modelA, modelB) {
        const valA = modelA.get('int');
        const valB = modelB.get('int');
        return intSort(sortDir, valA, valB);
      };
    });
  });

  specify('intSortBy', function() {
    testSort(sortDir => {
      return function(model) {
        return intSortBy(sortDir, model.get('int'));
      };
    });
  });

  specify('numSort', function() {
    testSort(sortDir => {
      return function(modelA, modelB) {
        const valA = modelA.get('num');
        const valB = modelB.get('num');
        return numSort(sortDir, valA, valB);
      };
    });
  });

  specify('numSortBy', function() {
    testSort(sortDir => {
      return function(model) {
        return numSortBy(sortDir, model.get('num'));
      };
    });
  });

  specify('dateSort', function() {
    testSort(sortDir => {
      return function(modelA, modelB) {
        const valA = modelA.get('date');
        const valB = modelB.get('date');
        return dateSort(sortDir, valA, valB);
      };
    });
  });

  specify('dateSortBy', function() {
    testSort(sortDir => {
      return function(model) {
        return dateSortBy(sortDir, model.get('date'));
      };
    });
  });
});
