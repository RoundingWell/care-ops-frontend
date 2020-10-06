import dayjs from 'dayjs';
import 'js/base/dayjs';

// NOTE: Use test-date if the data does not include the time / timezone

const ts = dayjs.utc();

function testTs() {
  return dayjs(ts).format();
}

function testTsAdd(time, key = 'days') {
  return dayjs(ts).add(time, key).format();
}

function testTsSubtract(time, key = 'days') {
  return dayjs(ts).subtract(time, key).format();
}

export {
  testTs,
  testTsAdd,
  testTsSubtract,
};
