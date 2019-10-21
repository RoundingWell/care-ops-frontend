import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import './form.scss';

const ContextTrailView = View.extend({
  className: 'form__context-trail',
  template: hbs`
    <a class="js-back form__context-link">
      {{fas "chevron-left"}}{{ @intl.forms.form.formViews.contextBackBtn }}
    </a>
    {{fas "chevron-right"}}{{ patient.first_name }} {{ patient.last_name }} - {{ name }}
    <button class="js-sidebar-button form__sidebar-button{{#if isActionShown}} is-selected{{/if}}">{{far "file-alt"}}</button>
  `,
  initialize({ state }) {
    this.state = state;

    this.listenTo(state, 'change:actionSidebar', this.render);
  },
  triggers: {
    'click .js-back': 'click:back',
    'click .js-sidebar-button': 'click:sidebarButton',
  },
  onClickBack() {
    Radio.request('history', 'go:back');
  },
  templateContext() {
    const patient = this.model.getPatient();
    return {
      isActionShown: !!this.state.get('actionSidebar'),
      patient: patient.pick('first_name', 'last_name'),
    };
  },
});

const LayoutView = View.extend({
  className: 'form__frame',
  template: hbs`
    <div class="form__layout">
      <div data-context-trail-region></div>
      <div class="form__iframe"><iframe src="/formapp/{{ id }}"></iframe></div>
    </div>
    <div class="form__sidebar" data-sidebar-region></div>
  `,
  childViewTriggers: {
    'click:sidebarButton': 'click:sidebarButton',
  },
  regions: {
    contextTrail: {
      el: '[data-context-trail-region]',
      replaceElement: true,
    },
    sidebar: '[data-sidebar-region]',
  },
  onRender() {
    this.showChildView('contextTrail', new ContextTrailView({
      model: this.model,
      state: this.getOption('state'),
    }));
  },
});

export {
  LayoutView,
};
