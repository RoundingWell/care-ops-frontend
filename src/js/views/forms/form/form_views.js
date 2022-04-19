import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, Region } from 'marionette';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

const i18n = intl.forms.form.formViews;

import Droplist from 'js/components/droplist';
import Tooltip from 'js/components/tooltip';

import IframeFormBehavior from 'js/behaviors/iframe-form';

import './form.scss';

const ContextTrailView = View.extend({
  className: 'form__context-trail',
  actionTemplate: hbs`<a class="js-back form__context-link">{{fas "chevron-left" }}{{ @intl.forms.form.formViews.contextTrailView.backBtn }}</a>`,
  patientTemplate: hbs`<a class="js-dashboard form__context-link">{{fas "chevron-left" }}{{ @intl.forms.form.formViews.contextTrailView.backDashboard }}</a>`,
  getTemplate() {
    if (!this.action) return this.patientTemplate;

    return this.actionTemplate;
  },
  initialize({ patient, action }) {
    this.patient = patient;
    this.action = action;
  },
  triggers: {
    'click .js-back': 'click:back',
    'click .js-dashboard': 'click:dashboard',
  },
  onClickBack() {
    Radio.request('history', 'go:back');
  },
  onClickDashboard() {
    Radio.trigger('event-router', 'patient:dashboard', this.patient.id);
  },
});

const FormActionsView = View.extend({
  className: 'form__actions',
  template: hbs`
    {{#if hasHistory}}<button class="js-history-button form__actions-icon{{#if shouldShowHistory}} is-selected{{/if}}">{{far "history"}}</button>{{/if}}
    <button class="js-expand-button form__actions-icon">{{#if isExpanded}}{{far "compress-alt"}}{{else}}{{far "expand-alt"}}{{/if}}</button>
    <button class="js-print-button form__actions-icon">{{far "print"}}</button>
    {{#if hasAction}}<button class="js-sidebar-button form__actions-icon{{#if isActionShown}} is-selected{{/if}}">{{far "file-alt"}}</button>{{/if}}
  `,
  templateContext() {
    return {
      isActionShown: this.isActionShown(),
      hasHistory: this.responses && !!this.responses.length,
      hasAction: !!this.action,
    };
  },
  onRender() {
    this.renderSidebarTooltip();
    this.renderPrintTooltip();
    this.renderExpandTooltip();
    this.renderHistoryTooltip();
  },
  initialize({ action, responses }) {
    this.action = action;
    this.responses = responses;

    this.listenTo(this.responses, 'update', this.render);
  },
  modelEvents: {
    'change:isExpanded': 'render',
    'change:isActionSidebar': 'render',
    'change:shouldShowHistory': 'render',
  },
  ui: {
    sidebarButton: '.js-sidebar-button',
    printButton: '.js-print-button',
    expandButton: '.js-expand-button',
    historyButton: '.js-history-button',
  },
  triggers: {
    'click @ui.sidebarButton': 'click:sidebarButton',
    'click @ui.printButton': 'click:printButton',
    'click @ui.expandButton': 'click:expandButton',
    'click @ui.historyButton': 'click:historyButton',
  },
  isActionShown() {
    return this.model.get('isActionSidebar') && !this.model.get('isExpanded');
  },
  renderSidebarTooltip() {
    const isActionShown = this.isActionShown();
    const message = isActionShown ? i18n.formActionsView.hideActionSidebar : i18n.formActionsView.showActionSidebar;

    new Tooltip({
      message,
      uiView: this,
      ui: this.ui.sidebarButton,
    });
  },
  renderPrintTooltip() {
    new Tooltip({
      message: i18n.formActionsView.printForm,
      uiView: this,
      ui: this.ui.printButton,
    });
  },
  renderExpandTooltip() {
    const isExpanded = this.model.get('isExpanded');
    const message = isExpanded ? i18n.formActionsView.decreaseWidth : i18n.formActionsView.increaseWidth;

    new Tooltip({
      message,
      uiView: this,
      ui: this.ui.expandButton,
    });
  },
  renderHistoryTooltip() {
    const shouldShowHistory = this.model.get('shouldShowHistory');
    const message = shouldShowHistory ? i18n.formActionsView.currentVersion : i18n.formActionsView.responseHistory;

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
      <div class="flex">
        <div class="form__crumbs-title-section flex-grow">
          <div data-context-trail-region></div>
          <div class="form__title"><span class="form__title-icon">{{far "poll-h"}}</span>{{patient.first_name}} {{patient.last_name}} — {{ name }}</div>
        </div>
        <div class="flex-grow">
          <div data-status-region>&nbsp;</div>
          <div class="form__controls">
            <div data-actions-region></div>
            <div><div data-form-action-region></div></div>
          </div>
        </div>
      </div>
      <div data-widgets-header-region></div>
      <div data-form-region></div>
    </div>
    <div class="form__sidebar" data-sidebar-region></div>
  `,
  regionClass: Region.extend({ replaceElement: true }),
  regions: {
    actions: '[data-actions-region]',
    contextTrail: '[data-context-trail-region]',
    form: '[data-form-region]',
    formAction: '[data-form-action-region]',
    sidebar: {
      el: '[data-sidebar-region]',
      replaceElement: false,
    },
    status: '[data-status-region]',
    widgets: '[data-widgets-header-region]',
  },
  templateContext() {
    return {
      patient: this.getOption('patient').pick('first_name', 'last_name'),
    };
  },
  onRender() {
    this.showChildView('contextTrail', new ContextTrailView({
      patient: this.getOption('patient'),
      action: this.getOption('action'),
    }));
  },
});

const IframeView = View.extend({
  behaviors: [IframeFormBehavior],
  className: 'form__iframe',
  template: hbs`<iframe src="/formapp/{{#if responseId}}{{ responseId }}{{/if}}"></iframe>`,
  templateContext() {
    return {
      responseId: this.getOption('responseId'),
    };
  },
});

const PreviewView = View.extend({
  behaviors: [IframeFormBehavior],
  className: 'form__frame',
  template: hbs`
    <div class="form__layout">
      <div class="form__context-trail">
        <a class="js-back form__context-link">{{fas "chevron-left"}}{{ @intl.forms.form.formViews.previewView.backBtn }}</a>
        {{~fas "chevron-right"}}{{ @intl.forms.form.formViews.previewView.title }}
      </div>
      <div class="form__title"><span class="form__title-icon">{{far "poll-h"}}</span>{{ name }}</div>
      <div class="form__iframe">
        <iframe src="/formapp/preview"></iframe>
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

const StatusView = View.extend({
  className: 'u-text-align--right',
  getTemplate() {
    if (!this.model) return hbs`<span class="form__alert-text">{{ @intl.forms.form.formViews.statusView.notSaved }}</span>`;
    if (this.getOption('isEditing')) {
      return hbs`
      <span class="form__alert-text">{{ @intl.forms.form.formViews.statusView.notSaved }}</span>
      <span class="u-margin--l-4 u-margin--r-4">&bull;</span>
      {{formatHTMLMessage (intlGet "forms.form.formViews.statusView.label") date=(formatDateTime _created_at "AT_TIME")}}
      `;
    }
    return hbs`{{formatHTMLMessage (intlGet "forms.form.formViews.statusView.label") date=(formatDateTime _created_at "AT_TIME")}}`;
  },
});

const ReadOnlyView = View.extend({
  tagName: 'button',
  className: 'button--grey',
  attributes: {
    disabled: true,
  },
  template: hbs`{{ @intl.forms.form.formViews.readOnlyView.buttonText }}`,
});

const SaveView = View.extend({
  isDisabled: false,
  tagName: 'button',
  className: 'button--green',
  attributes() {
    return {
      disabled: this.getOption('isDisabled'),
    };
  },
  template: hbs`{{ @intl.forms.form.formViews.saveView.buttonText }}`,
  triggers: {
    'click': 'click',
  },
  onClick() {
    this.$el.prop('disabled', true);
  },
});

const UpdateView = View.extend({
  tagName: 'button',
  className: 'button--green',
  template: hbs`{{ @intl.forms.form.formViews.updateView.buttonText }}`,
  triggers: {
    'click': 'click',
  },
});

const HistoryDroplist = Droplist.extend({
  viewOptions: {
    className: 'button-filter',
    template: hbs`{{far "history"}}{{formatDateTime _created_at "AT_TIME"}}{{far "angle-down"}}`,
  },
  picklistOptions: {
    itemTemplate: hbs`{{formatDateTime _created_at "AT_TIME"}}`,
  },
});

const HistoryView = View.extend({
  template: hbs`
    <div data-versions-region></div>
    <button class="button--blue js-current u-margin--l-8">{{ @intl.forms.form.formViews.historyView.currentVersionButton }}</button>
  `,
  regions: {
    versions: {
      el: '[data-versions-region]',
      replaceElement: true,
    },
  },
  triggers: {
    'click .js-current': 'click:current',
  },
  initialize({ selected, collection }) {
    const responseDroplist = this.showChildView('versions', new HistoryDroplist({
      collection,
      state: { selected },
    }));

    this.listenTo(responseDroplist, {
      'change:selected'(response) {
        this.triggerMethod('change:response', response);
      },
    });
  },
});

export {
  FormActionsView,
  LayoutView,
  IframeView,
  PreviewView,
  StatusView,
  SaveView,
  ReadOnlyView,
  UpdateView,
  HistoryView,
};
