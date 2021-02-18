import $ from 'jquery';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, Behavior } from 'marionette';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

const i18n = intl.forms.form.formViews;

import Droplist from 'js/components/droplist';
import Tooltip from 'js/components/tooltip';

import './form.scss';

const IframeFormBehavior = Behavior.extend({
  ui: {
    iframe: 'iframe',
  },
  onInitialize() {
    this.channel = Radio.channel(`form${ this.view.model.id }`);
  },
  onAttach() {
    const iframeWindow = this.ui.iframe[0].contentWindow;
    this.channel.reply('send', (message, args) => {
      iframeWindow.postMessage({ message, args }, window.origin);
    }, this);

    $(window).on('message', ({ originalEvent }) => {
      const { data, origin } = originalEvent;
      /* istanbul ignore next: security check */
      if (origin !== window.origin || !data || !data.message) return;

      this.channel.request(data.message, data.args);
    });
  },
  onBeforeDetach() {
    $(window).off('message');
    this.channel.stopReplying('send');
  },
});

const ContextTrailView = View.extend({
  className: 'form__context-trail',
  template: hbs`
    <a class="{{#if hasAction}}js-back{{else}}js-dashboard{{/if}} form__context-link">
      {{fas "chevron-left" ~}}
      {{#if hasAction }}
        {{~ @intl.forms.form.formViews.contextTrailView.backBtn ~}}
      {{else}}
        {{~ @intl.forms.form.formViews.contextTrailView.backDashboard ~}}
      {{/if}}
    </a>
    {{fas "chevron-right"}}{{ patient.first_name }} {{ patient.last_name }} &ndash; {{ form }}
    <div class="form__actions">
      {{#if hasHistory}}<span class="js-history-button form__actions-icon{{#if shouldShowHistory}} is-selected{{/if}}">{{far "history"}}</span>{{/if}}
      <button class="js-expand-button form__actions-icon">{{#if isExpanded}}{{far "compress-alt"}}{{else}}{{far "expand-alt"}}{{/if}}</button>
      <button class="js-print-button form__actions-icon">{{far "print"}}</button>
      {{#if hasAction}}<button class="js-sidebar-button form__actions-icon{{#if isActionShown}} is-selected{{/if}}">{{far "file-alt"}}</button>{{/if}}
    </div>
  `,
  initialize({ patient, action, form, responses }) {
    this.patient = patient;
    this.action = action;
    this.form = form;
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
    'click .js-back': 'click:back',
    'click .js-dashboard': 'click:dashboard',
    'click @ui.sidebarButton': 'click:sidebarButton',
    'click @ui.printButton': 'click:printButton',
    'click @ui.expandButton': 'click:expandButton',
    'click @ui.historyButton': 'click:historyButton',
  },
  onClickBack() {
    Radio.request('history', 'go:back');
  },
  onClickDashboard() {
    Radio.trigger('event-router', 'patient:dashboard', this.patient.id);
  },
  templateContext() {
    return {
      isActionShown: this.isActionShown(),
      patient: this.patient && this.patient.pick('first_name', 'last_name'),
      hasHistory: this.responses && !!this.responses.length,
      hasAction: !!this.action,
      form: this.form.get('name'),
    };
  },
  onRender() {
    this.renderSidebarTooltip();
    this.renderPrintTooltip();
    this.renderExpandTooltip();
    this.renderHistoryTooltip();
  },
  isActionShown() {
    return this.model.get('isActionSidebar') && !this.model.get('isExpanded');
  },
  renderSidebarTooltip() {
    const isActionShown = this.isActionShown();
    const message = isActionShown ? i18n.contextTrailView.hideActionSidebar : i18n.contextTrailView.showActionSidebar;

    new Tooltip({
      message,
      uiView: this,
      ui: this.ui.sidebarButton,
    });
  },
  renderPrintTooltip() {
    new Tooltip({
      message: i18n.contextTrailView.printForm,
      uiView: this,
      ui: this.ui.printButton,
    });
  },
  renderExpandTooltip() {
    const isExpanded = this.model.get('isExpanded');
    const message = isExpanded ? i18n.contextTrailView.decreaseWidth : i18n.contextTrailView.increaseWidth;

    new Tooltip({
      message,
      uiView: this,
      ui: this.ui.expandButton,
    });
  },
  renderHistoryTooltip() {
    const shouldShowHistory = this.model.get('shouldShowHistory');
    const message = shouldShowHistory ? i18n.contextTrailView.currentVersion : i18n.contextTrailView.responseHistory;

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
      <div class="form__iframe">
        <div class="flex-region">
          <div data-form-action-region></div>
          <div data-form-region></div>
        </div>
      </div>
    </div>
    <div class="form__sidebar" data-sidebar-region></div>
  `,
  regions: {
    contextTrail: {
      el: '[data-context-trail-region]',
      replaceElement: true,
    },
    form: {
      el: '[data-form-region]',
      replaceElement: true,
    },
    sidebar: '[data-sidebar-region]',
    formActions: '[data-form-action-region]',
  },
});

const IframeView = View.extend({
  behaviors: [IframeFormBehavior],
  className: 'flex-grow',
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
        <a class="js-back form__context-link">
          {{fas "chevron-left"}}{{ @intl.forms.form.formViews.previewView.backBtn }}
        </a>
        {{fas "chevron-right"}}{{ @intl.forms.form.formViews.previewView.title }} &ndash; {{ name }}
      </div>
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

const UpdateView = View.extend({
  className: 'form__action-bar flex',
  template: hbs`
    <div class="u-margin--t-8">{{fas "info-circle"}} {{formatHTMLMessage (intlGet "forms.form.formViews.updateActionsView.updateLabel") date=(formatDateTime _created_at "AT_TIME")}}</div>
    <button class="button--blue form__action-button js-update">{{ @intl.forms.form.formViews.updateActionsView.updateButton }}</button>
  `,
  triggers: {
    'click .js-update': 'click:update',
  },
  onClickUpdate() {
    this.destroy();
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
  className: 'form__action-bar flex',
  template: hbs`
    <div data-versions-region></div>
    <button class="button--blue form__action-button js-current">{{ @intl.forms.form.formViews.historyBarView.currentVersionButton }}</button>
  `,
  regions: {
    versions: '[data-versions-region]',
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
  ContextTrailView,
  LayoutView,
  IframeView,
  PreviewView,
  UpdateView,
  HistoryView,
};
