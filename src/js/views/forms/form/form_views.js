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
  initialize({ patient, state, action }) {
    this.state = state;
    this.patient = patient;
    this.action = action;

    this.listenTo(state, 'change:actionSidebar', this.render);
  },
  triggers: {
    'click .js-back': 'click:back',
    'click .js-sidebar-button': 'click:sidebarButton',
  },
  onClickBack() {
    const flowId = this.action.get('_flow');
    if (flowId) {
      Radio.trigger('event-router', 'flow:action', flowId, this.action.id);
      return;
    }
    
    Radio.trigger('event-router', 'patient:action', this.patient.id, this.action.id);
  },
  templateContext() {
    const patient = this.getOption('patient');
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
      <div class="form__iframe"><iframe src="/formapp/{{ id }}/a/{{ action.id }}"></iframe></div>
    </div>
    <div class="form__sidebar" data-sidebar-region></div>
  `,
  templateContext() {
    return {
      action: this.getOption('action'),
    };
  },
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
      patient: this.getOption('patient'),
      state: this.getOption('state'),
      action: this.getOption('action'),
    }));
  },
});

export {
  LayoutView,
};
