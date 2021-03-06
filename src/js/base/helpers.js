import Handlebars from 'handlebars/runtime';
import dayjs from 'dayjs';

import { formatDate } from './dayjs';
import matchText from 'js/utils/formatting/match-text';

Handlebars.registerHelper({
  matchText(text, query, { hash = {} }) {
    if (!query) return text;

    if (!hash.noEscape) text = Handlebars.escapeExpression(text);

    return new Handlebars.SafeString(matchText(text, query));
  },
});

Handlebars.registerHelper({
  formatDateTime(date, format, { hash = {} }) {
    if (!date) return new Handlebars.SafeString(hash.defaultHtml || '');

    date = hash.utc ? dayjs.utc(date, hash.inputFormat).local() : dayjs(date, hash.inputFormat);

    date = formatDate(date, format);

    /* istanbul ignore if */
    if (hash.nowrap === false) return date;

    return new Handlebars.SafeString(`<span class="u-text--nowrap">${ date }</span>`);
  },
});
