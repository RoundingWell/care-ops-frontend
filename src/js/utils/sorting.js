import _ from 'underscore';

// negates based on sort direction a sortable value
function sortByDir(sortDirection, sortableVal) {
  return (sortDirection === 'desc') ? (sortableVal * -1) : sortableVal;
}

function alphaSort(sortDir, a, b, nullVal = '') {
  if (!a) a = nullVal;
  if (!b) b = nullVal;
  return sortByDir(sortDir, a.localeCompare(b));
}

function getSortNum(val, defaultVal = -1) {
  return _.isNumber(val) ? val : defaultVal;
}

function numSortBy(sortDir, val, nullVal) {
  const num = getSortNum(val, nullVal);
  return sortByDir(sortDir, num);
}

function numSort(sort, fieldA, fieldB, nullVal) {
  const sortVal = getSortNum(fieldA, nullVal) > getSortNum(fieldB, nullVal) ? 1 : -1;
  return sortByDir(sort, sortVal);
}

function intSortBy(sortDir, val, nullVal) {
  const int = getSortNum(val, nullVal);
  return sortByDir(sortDir, parseInt(int, 10));
}

function intSort(sort, fieldA, fieldB, nullVal) {
  const sortVal = getSortNum(fieldA, nullVal) > getSortNum(fieldB, nullVal) ? 1 : -1;
  return sortByDir(sort, sortVal);
}


export {
  alphaSort,
  intSortBy,
  numSortBy,
  intSort,
  numSort,
};
