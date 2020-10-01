import _ from 'underscore';
import moment from 'moment';
import utcPlugin from 'dayjs/plugin/utc';
import localizedFormatPlugin from 'dayjs/plugin/localizedFormat';
import weekdayPlugin from 'dayjs/plugin/weekday';
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat';
import Handlebars from 'handlebars/runtime';

moment.extend(localizedFormatPlugin);
moment.extend(utcPlugin);
moment.extend(weekdayPlugin);
moment.extend(customParseFormatPlugin);

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
    /* istanbul ignore else */
    if (date.isSame(moment(), 'year')) {
      return date.format(formats.SHORT);
    }
    /* istanbul ignore next */
    return date.format(formats.LONG);
  },
  TIME_OR_DAY(date) {
    if (date.isSame(moment(), 'day')) {
      return date.format(formats.TIME);
    }

    return formats.DATE(date);
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

    date = hash.utc ? moment.utc(date, hash.inputFormat).local() : moment(date, hash.inputFormat);

    date = formatDate(date, format);

    /* istanbul ignore if */
    if (hash.nowrap === false) return date;

    return new Handlebars.SafeString(`<span class="u-text--nowrap">${ date }</span>`);
  },
});

export {
  formatDate,
};

