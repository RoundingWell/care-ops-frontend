import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';
import intl from 'js/i18n';

import Tooltip from 'js/components/tooltip';

import './form.scss';

const ContextTrailView = View.extend({
  className: 'form__context-trail',
  template: hbs`
    <a class="js-back form__context-link">
      {{fas "chevron-left"}}{{ @intl.forms.form.formViews.contextBackBtn }}
    </a>
    {{fas "chevron-right"}}{{ patient.first_name }} {{ patient.last_name }} - {{ name }}
    <div class="form__actions">
      <button class="js-expand-button form__actions--button">{{#if isSidebarVisible}}{{far "expand-alt"}}{{else}}{{far "compress-alt"}}{{/if}}</button>
      <button class="js-print-button form__actions--button">{{far "print"}}</button>
      <button class="js-sidebar-button form__actions--button{{#if isActionShown}} is-selected{{/if}}">{{far "file-alt"}}</button>
    </div>
  `,
  initialize({ patient, state, action }) {
    this.state = state;
    this.patient = patient;
    this.action = action;

    this.listenTo(state, {
      'change:sidebarView': this.render,
      'change:sidebarVisible': this.render,
    });
  },
  ui: {
    sidebarButton: '.js-sidebar-button',
    printButton: '.js-print-button',
    expandButton: '.js-expand-button',
  },
  triggers: {
    'click .js-back': 'click:back',
    'click @ui.sidebarButton': 'click:sidebarButton',
    'click @ui.printButton': 'click:printButton',
    'click @ui.expandButton': 'click:expandButton',
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
    const isSidebarVisible = this.state.get('sidebarVisible');

    return {
      isActionShown: isSidebarVisible && this.state.get('sidebarView') === 'action',
      isSidebarVisible,
      patient: patient.pick('first_name', 'last_name'),
    };
  },
  onRender() {
    this.renderSidebarTooltip();
    this.renderPrintTooltip();
    this.renderExpandTooltip();
  },
  renderSidebarTooltip() {
    const showActionSidebar = this.state.get('sidebarView') === 'patient';
    const message = (showActionSidebar || !this.state.get('sidebarVisible')) ? intl.forms.form.formViews.showActionSidebar : intl.forms.form.formViews.hideActionSidebar;

    new Tooltip({
      message,
      uiView: this,
      ui: this.ui.sidebarButton,
    });
  },
  renderPrintTooltip() {
    new Tooltip({
      message: intl.forms.form.formViews.printAttachment,
      uiView: this,
      ui: this.ui.printButton,
    });
  },
  renderExpandTooltip() {
    const isSidebarVisible = this.state.get('sidebarVisible');
    const message = isSidebarVisible ? intl.forms.form.formViews.increaseWidth : intl.forms.form.formViews.decreaseWidth;

    new Tooltip({
      message,
      uiView: this,
      ui: this.ui.expandButton,
    });
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
    'click:printButton': 'click:printButton',
    'click:expandButton': 'click:expandButton',
  },
  regions: {
    contextTrail: {
      el: '[data-context-trail-region]',
      replaceElement: true,
    },
    sidebar: '[data-sidebar-region]',
  },
  ui: {
    'iframe': '.form__iframe iframe',
  },
  onRender() {
    this.showChildView('contextTrail', new ContextTrailView({
      model: this.model,
      patient: this.getOption('patient'),
      state: this.getOption('state'),
      action: this.getOption('action'),
    }));
  },
  onClickPrintButton() {
    this.ui.iframe[0].contentWindow.print();
  },
});

export {
  LayoutView,
};
