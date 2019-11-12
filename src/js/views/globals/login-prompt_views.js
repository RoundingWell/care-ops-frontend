import { View } from 'marionette';

import LoginPromptTemplate from './login-prompt.hbs';

import 'assets/css/login-prompt.css';

const LoginPromptView = View.extend({
  el: 'body',
  template: LoginPromptTemplate,
  templateContext() {
    return {
      url: location.host,
    };
  },
});

export {
  LoginPromptView,
};
