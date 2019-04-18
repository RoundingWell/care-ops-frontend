import _ from 'underscore';
import moment from 'moment';
import Handlebars from 'handlebars/runtime';

const formats = {
  // Jan 15
  SHORT: 'MMM D',
  // Jan 15, 2019
  LONG: 'll',
  // 01/15/2019
  SLASHES: 'L',
  // 10:46 PM
  TIME: 'LT',
  // Jan 15, 2019 10:45 PM
  AT_TIME: 'lll',
  DATE(date) {
    if (date.isSame(moment(), 'year')) {
      return date.format(formats.SHORT);
    }

    return date.format(formats.LONG);
  },
  TIME_OR_DAY(date) {
    if (date.isSame(moment(), 'day')) {
      return date.format(formats.TIME);
    }

    return formats.DATE(date);
  },
  DATE_CONTEXT(date) {
    if (date.isBefore(moment.utc().subtract(2, 'day').endOf('day'))) {
      return `${ formats.DATE(date) } - ${ date.startOf('day').fromNow() }`;
    }

    return `${ formats.DATE(date) } - ${ date.fromNow() }`;
  },
};

function formatDate(date, format) {
  const dateFormat = formats[format];

  // Custom moment format ie: 'MMM-YYYY'
  if (!dateFormat) return date.format(format);

  if (_.isFunction(dateFormat)) return dateFormat(date);

  return date.format(dateFormat);
}

Handlebars.registerHelper({
  formatMoment(date, format, { hash = {} }) {
    if (!date) return new Handlebars.SafeString(hash.defaultHtml || '');

    date = moment(date, hash.inputFormat);

    date = formatDate(date, format);

    if (hash.nowrap === false) return date;

    return new Handlebars.SafeString(`<span class="u-text--nowrap">${ date }</span>`);
  },
});

export {
  formatDate,
};

