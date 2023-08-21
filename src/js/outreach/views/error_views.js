import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import './error.scss';

const ErrorView = View.extend({
  template: hbs`
    <div class="dialog__icon dialog__icon--error">{{fat "octagon-exclamation"}}</div>
    <div class="dialog__error-header">Uh-oh, there was an error.</div>
    <div class="dialog__error-header u-text-link u-margin--t-24 js-try-again">Try again</div>
  `,
  triggers: {
    'click .js-try-again': 'click:tryAgain',
  },
  onClickTryAgain() {
    history.back();
  },
});

const Error404View = View.extend({
  template: hbs`
    <div class="dialog__icon">{{fat "triangle-exclamation"}}</div>
    <div class="dialog__error-header">Oops! The page you requested can’t be found.</div>
    <div class="dialog__error-info">Return to the Outreach message and re-open the link.</div>
  `,
});

export {
  ErrorView,
  Error404View,
};
