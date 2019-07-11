import _ from 'underscore';
import 'js/utils/formatting';
import duration from 'js/utils/duration';
import Handlebars from 'handlebars/runtime';

import './moment';

Handlebars.registerHelper({
  matchText(text, query, { hash = {} }) {
    if (!query) return text;

    if (!hash.noEscape) text = Handlebars.escapeExpression(text);

    return new Handlebars.SafeString(_.matchText(text, query));
  },
});

Handlebars.registerHelper({
  formatDuration(dur, key, { hash = {} }) {
    if (!dur) return new Handlebars.SafeString(hash.defaultHtml || '');

    return duration(dur, hash.inputKey).get(key);
  },
});
