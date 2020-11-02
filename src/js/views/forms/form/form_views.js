import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Tooltip from 'js/components/tooltip';

import './form.scss';

const ContextTrailView = View.extend({
  className: 'form__context-trail',
  template: hbs`
    <a class="js-back form__context-link">
      {{fas "chevron-left"}}{{ @intl.forms.form.formViews.contextBackBtn }}
    </a>
    {{fas "chevron-right"}}{{ patient.first_name }} {{ patient.last_name }} - {{ form.name }}
    <div class="form__actions">
      {{#if showHistory}}<span class="js-history-button form__actions--button{{#if historyResponseId}} is-selected{{/if}}">{{far "history"}}</span>{{/if}}
      <button class="js-expand-button form__actions--button">{{#if isSidebarVisible}}{{far "expand-alt"}}{{else}}{{far "compress-alt"}}{{/if}}</button>
      <button class="js-print-button form__actions--button">{{far "print"}}</button>
      <button class="js-sidebar-button form__actions--button{{#if isActionShown}} is-selected{{/if}}">{{far "file-alt"}}</button>
    </div>
  `,
  initialize({ patient, action, form }) {
    this.patient = patient;
    this.action = action;
    this.form = form;
  },
  modelEvents: {
    'change:sidebar': 'render',
    'change:historyResponseId': 'render',
  },
  ui: {
    sidebarButton: '.js-sidebar-button',
    printButton: '.js-print-button',
    expandButton: '.js-expand-button',
    historyButton: '.js-history-button',
  },
  triggers: {
    'click .js-back': 'click:back',
    'click @ui.sidebarButton': 'click:sidebarButton',
    'click @ui.printButton': 'click:printButton',
    'click @ui.expandButton': 'click:expandButton',
    'click @ui.historyButton': 'click:historyButton',
  },
  onClickBack() {
    Radio.request('history', 'go:back');
  },
  templateContext() {
    const isSidebarVisible = !!this.model.get('sidebar');

    return {
      isActionShown: this.model.get('sidebar') === 'action',
      isSidebarVisible,
      patient: this.patient.pick('first_name', 'last_name'),
      showHistory: !!this.action.getFormResponses().length,
      form: this.getOption('form').pick('name'),
    };
  },
  onRender() {
    this.renderSidebarTooltip();
    this.renderPrintTooltip();
    this.renderExpandTooltip();
    this.renderHistoryTooltip();
  },
  renderSidebarTooltip() {
    const shouldShowActionSidebar = this.model.get('sidebar') !== 'action';
    const message = shouldShowActionSidebar ? intl.forms.form.formViews.showActionSidebar : intl.forms.form.formViews.hideActionSidebar;

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
    const isSidebarVisible = !!this.model.get('sidebar');
    const message = isSidebarVisible ? intl.forms.form.formViews.increaseWidth : intl.forms.form.formViews.decreaseWidth;

    new Tooltip({
      message,
      uiView: this,
      ui: this.ui.expandButton,
    });
  },
  renderHistoryTooltip() {
    let message;

    if (this.model.get('historyResponseId')) {
      message = intl.forms.form.formViews.currentVersion;
    } else {
      message = intl.forms.form.formViews.responseHistory;
    }

    new Tooltip({
      message,
      uiView: this,
      ui: this.ui.historyButton,
    });
  },
});

const LayoutView = View.extend({
  className: 'form__frame',
  template: hbs`
    <div class="form__layout">
      <div data-context-trail-region></div>
      <div class="form__iframe js-iframe">
        <div class="flex-region" data-form-region></div>
      </div>
    </div>
    <div class="form__sidebar" data-sidebar-region></div>
  `,
  childViewTriggers: {
    'click:sidebarButton': 'click:sidebarButton',
    'click:printButton': 'click:printButton',
    'click:expandButton': 'click:expandButton',
    'click:historyButton': 'click:historyButton',
  },
  regions: {
    contextTrail: {
      el: '[data-context-trail-region]',
      replaceElement: true,
    },
    sidebar: '[data-sidebar-region]',
    form: '[data-form-region]',
  },
  ui: {
    iframe: '.js-iframe iframe',
  },
  onRender() {
    this.showChildView('contextTrail', new ContextTrailView({
      model: this.model,
      patient: this.getOption('patient'),
      action: this.getOption('action'),
      form: this.getOption('form'),
    }));
  },
});

const PreviewView = View.extend({
  className: 'form__frame',
  template: hbs`
    <div class="form__layout">
      <div class="form__context-trail">
        <a class="js-back form__context-link">
          {{fas "chevron-left"}}{{ @intl.forms.form.formViews.previewView.backBtn }}
        </a>
        {{fas "chevron-right"}}{{ @intl.forms.form.formViews.previewView.title }} &ndash; {{ name }}
      </div>
      <div class="form__iframe">
        <iframe src="/formapp/{{ id }}/preview"></iframe>
      </div>
    </div>
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
  PreviewView,
};
