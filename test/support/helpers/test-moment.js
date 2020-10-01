import moment from 'moment';

import '../moment';

const ts = moment.utc();
const date = moment();

function testTs() {
  return moment(ts).format();
}

function testTsAdd(time, key = 'days') {
  return moment(ts).add(time, key).format();
}

function testTsSubtract(time, key = 'days') {
  return moment(ts).subtract(time, key).format();
}

function testDate() {
  return moment(date).format('YYYY-MM-DD');
}

function testDateAdd(time, key = 'days') {
  return moment(date).add(time, key).format('YYYY-MM-DD');
}

function testDateSubtract(time, key = 'days') {
  return moment(date).subtract(time, key).format('YYYY-MM-DD');
}

export {
  testTs,
  testTsAdd,
  testTsSubtract,
  testDate,
  testDateAdd,
  testDateSubtract,
};
