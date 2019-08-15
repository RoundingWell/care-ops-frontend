import _ from 'underscore';
import moment from 'moment';
import Handlebars from 'handlebars/runtime';
import HandlebarsIntl from 'handlebars-intl';
import { setRenderer } from 'marionette';

import localEnUs from './en-US.yml';

const localeKey = 'careOptsFrontend';

const locales = {
  'en-US': localEnUs,
};

let currentLocale;
const intl = {};

function setLocale(locale = 'en-US') {
  currentLocale = locale;

  // Mutate exported locale with en-US as fallback
  _.extend(intl, localEnUs[localeKey], locales[currentLocale][localeKey]);

  moment.locale(currentLocale);

  /* istanbul ignore if: dev use only */
  if (window.PHRASEAPP_CONFIG) {
    _.extend(intl, phraseAppMessages(intl));
  }
}

setLocale();

HandlebarsIntl.registerWith(Handlebars);

setRenderer(renderTemplate);

// Allows for i18n data to be at {{ @intl.some.deep.key }}
function renderTemplate(template, data) {
  return template(data, {
    data: { intl },
  });
}

/* istanbul ignore next: dev use only */
function phraseAppMessages(nestedMessages, prefix = localeKey) {
  return _.reduce(_.keys(nestedMessages), (messages, key) => {
    if (key === 'locales') return messages;

    const value = nestedMessages[key];
    const prefixedKey = `${ prefix }.${ key }`;

    if (_.isString(value)) {
      messages[key] = `[[__phrase_${ prefixedKey }__]]`;

      return messages;
    }

    messages[key] = phraseAppMessages(value, prefixedKey);

    return messages;
  }, {});
}

export {
  renderTemplate,
  setLocale,
};

export default intl;
