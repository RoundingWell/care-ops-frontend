import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import { appConfig } from 'js/config';

import './dialog.scss';

const DialogView = View.extend({
  template: hbs`
    <div><h1 class="site-title">{{ name }}</h1></div>
    <div class="dialog" data-content-region>
      <div class="dialog__icon--success">{{fas "circle-check"}}</div>
      <div>You’ve submitted the form. Nice job.</div>
    </div>
  `,
  templateContext() {
    return {
      name: appConfig.name,
    };
  },
  regions: {
    content: '[data-content-region]',
  },
});

export {
  DialogView,
};
