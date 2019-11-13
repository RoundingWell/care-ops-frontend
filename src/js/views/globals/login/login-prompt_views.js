import { View } from 'marionette';

import LoginPromptTemplate from './login-prompt.hbs';

import './login-prompt.css';

const LoginPromptView = View.extend({
  el: 'body',
  triggers: {
    'click .js-login': 'click:login',
  },
  onRender() {
    this.$el.addClass('login-prompt');
  },
  template: LoginPromptTemplate,
  templateContext: {
    url: location.host,
  },
});

export {
  LoginPromptView,
};
