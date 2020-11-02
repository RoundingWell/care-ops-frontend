import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import Droplist from 'js/components/droplist';

import PreloadRegion from 'js/regions/preload_region';

const HistoryDroplist = Droplist.extend({
  popWidth: 224,
  viewOptions: {
    className: 'button-filter form__response-droplist',
    template: hbs`{{far "history"}}{{formatDateTime _created_at "AT_TIME"}}{{far "angle-down"}}`,
  },
  picklistOptions: {
    itemTemplate: hbs`{{formatDateTime _created_at "AT_TIME"}}`,
  },
});

const HistoryBarView = View.extend({
  className: 'form__action-bar flex',
  template: hbs`
    <div data-versions-region></div>
    <button class="button--blue form__action-button js-current">{{ @intl.forms.form.formHistoryViews.historyBarView.currentVersionButton }}</button>
  `,
  regions: {
    versions: '[data-versions-region]',
  },
  ui: {
    'currentBtn': '.js-current',
  },
  triggers: {
    'click @ui.currentBtn': 'click:current',
  },
  initialize() {
    const responseDroplist = this.showChildView('versions', new HistoryDroplist({
      collection: this.getOption('formResponses'),
      state: this.getOption('state'),
    }));

    this.listenTo(responseDroplist, {
      'change:selected'(response) {
        this.triggerMethod('select:response', response);
      },
    });
  },
});

const FormView = View.extend({
  className: 'flex-region',
  template: hbs`<iframe src="/formapp/{{ form.id }}/response/{{ id }}"></iframe>`,
  templateContext() {
    return {
      form: this.getOption('form'),
    };
  },
  ui: {
    iframe: 'iframe',
  },
  print() {
    this.ui.iframe[0].contentWindow.print();
  },
});

const LayoutView = View.extend({
  className: 'form__history-region flex-region',
  template: hbs`
    <div data-history-region></div>
    <div class="form__iframe--has-bar" data-iframe-region></div>
  `,
  regions: {
    iframe: {
      el: '[data-iframe-region]',
      regionClass: PreloadRegion,
    },
    history: '[data-history-region]',
  },
  childViewTriggers: {
    'click:current': 'click:current',
    'select:response': 'select:response',
  },
});

export {
  FormView,
  HistoryBarView,
  LayoutView,
};
