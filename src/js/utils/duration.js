import _ from 'underscore';
import moment from 'moment';

function greaterThan(input, key) {
  const compareDuration = duration(input, key);
  return this.asMilliseconds() > compareDuration.asMilliseconds();
}

function lessThan(input, key) {
  const compareDuration = duration(input, key);
  return this.asMilliseconds() < compareDuration.asMilliseconds();
}

function get(key) {
  // by default have get return all data as a JSON object
  if (!key) return this._data;

  // otherwise use the moment.duration get
  return moment.duration(this).get(key);
}

// Returns the duration in the hh:mm:ss format
function formatTime() {
  const time = [this.hours(), this.minutes(), this.seconds()];

  return _.map(time, function(num) {
    if (num < 10) return `0${ num }`;
    return num;
  }).join(':');
}

const duration = function(input, key) {
  // makes duration default seconds instead of milliseconds
  if (_.isNumber(input) && !key) key = 's';

  const dur = moment.duration(input, key);

  _.extend(dur, {
    greaterThan,
    lessThan,
    get,
    formatTime,
  });

  return dur;
};

export default duration;
