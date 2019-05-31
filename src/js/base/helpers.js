import _ from 'underscore';
import 'js/utils/formatting';
import Handlebars from 'handlebars/runtime';

import './moment';

Handlebars.registerHelper({
  matchText(text, query, { hash = {} }) {
    if (!query) return text;

    if (!hash.noEscape) text = Handlebars.escapeExpression(text);

    return new Handlebars.SafeString(_.matchText(text, query));
  },
});
