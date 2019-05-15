import Radio from 'backbone.radio';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import ErrorTemplate from './error.hbs';

import './error.scss';

const ErrorView = View.extend({
  className: 'error-page',
  template: ErrorTemplate,
  triggers: {
    'click .js-back': 'click:back',
  },
  onClickBack() {
    Radio.request('history', 'go:back');
  },
});

export {
  ErrorView,
};
