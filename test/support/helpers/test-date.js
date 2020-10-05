import dayjs from 'dayjs';
import 'js/base/dayjs';

// NOTE: Use test-timestamp if the data does include the time / timezone

const date = dayjs();

function testDate() {
  return dayjs(date).format('YYYY-MM-DD');
}

function testDateAdd(time, key = 'days') {
  return dayjs(date).add(time, key).format('YYYY-MM-DD');
}

function testDateSubtract(time, key = 'days') {
  return dayjs(date).subtract(time, key).format('YYYY-MM-DD');
}

export {
  testDate,
  testDateAdd,
  testDateSubtract,
};
