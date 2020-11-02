import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

const Layout = View.extend({
  className: 'form__update-region flex-region',
  template: hbs`
    {{#if shouldShowResponse}}
      <div class="form__action-bar flex">
        <div class="u-margin--t-8">{{fas "info-circle"}} {{formatHTMLMessage (intlGet "forms.form.formUpdateViews.layoutView.updateLabel") date=(formatDateTime response.attributes._created_at "AT_TIME")}}</div>
        <button class="button--blue form__action-button js-update">{{ @intl.forms.form.formUpdateViews.layoutView.updateButton }}</button>
      </div>
      <div class="form__iframe--has-bar"><iframe src="/formapp/{{ id }}/response/{{ response.id }}"></iframe></div>
    {{else}}
      {{#if response}}
        <iframe src="/formapp/{{ id }}/new/{{ patient.id }}/{{ action.id }}/{{ response.id }}"></iframe>
      {{ else }}
        <iframe src="/formapp/{{ id }}/new/{{ patient.id }}/{{ action.id }}"></iframe>
      {{/if}}
    {{/if}}
  `,
  templateContext() {
    const response = this.getOption('response');
    const state = this.getOption('state');
    const action = this.getOption('action');

    return {
      response: this.getOption('response'),
      patient: action.getPatient(),
      action,
      shouldShowResponse: !!response && !state.get('shouldUpdate'),
    };
  },
  ui: {
    update: '.js-update',
    iframe: 'iframe',
  },
  triggers: {
    'click @ui.update': 'click:update',
  },
  print() {
    this.ui.iframe[0].contentWindow.print();
  },
});

export {
  Layout,
};
