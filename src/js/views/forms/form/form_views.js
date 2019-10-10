import hbs from 'handlebars-inline-precompile';

import Radio from 'backbone.radio';
import { View } from 'marionette';

import './form.scss';

const LayoutView = View.extend({
  template: hbs`
      <div class="form__context-trail">
        <a class="js-back form__context-link">
          {{fas "chevron-left"}}{{ @intl.forms.form.formViews.contextBackBtn }}
        </a>
      </div>
      <h1>{{ name }}</h1>
      <iframe src="/formapp/{{ id }}" class="form__frame"></iframe>
  `,
  triggers: {
    'click .js-back': 'click:back',
  },
  onClickBack() {
    Radio.request('history', 'go:back');
  },
});

export {
  LayoutView,
};
