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
      'change:sidebar': this.render,
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
    Radio.request('history', 'go:back');
  },
  templateContext() {
    const patient = this.getOption('patient');
    const isSidebarVisible = !!this.state.get('sidebar');

    return {
      isActionShown: this.state.get('sidebar') === 'action',
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
    const shouldShowActionSidebar = this.state.get('sidebar') !== 'action';
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
    const isSidebarVisible = !!this.state.get('sidebar');
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
      <div class="form__iframe js-iframe">
        {{#if shouldShowResponse}}
        <div class="form__update-bar flex">
          <div class="u-margin--t-8">{{fas "info-circle"}} {{formatHTMLMessage (intlGet "forms.form.formViews.layoutView.updateLabel") date=(formatMoment response.attributes._created_at "AT_TIME")}}</div>
          <button class="button--blue form__update-button js-update">{{ @intl.forms.form.formViews.layoutView.updateButton }}</button>
        </div>
        <div class="form__iframe--has-bar"><iframe src="/formapp/{{ id }}/response/{{ response.id }}"></iframe></div>
        {{else}}
          {{#if response}}
          <iframe src="/formapp/{{ id }}/new/{{ patient.id }}/{{ action.id }}/{{ response.id }}"></iframe>
          {{ else }}
          <iframe src="/formapp/{{ id }}/new/{{ patient.id }}/{{ action.id }}"></iframe>
          {{/if}}
        {{/if}}
      </div>
    </div>
    <div class="form__sidebar" data-sidebar-region></div>
  `,
  templateContext() {
    const action = this.getOption('action');
    const response = action.getRecentResponse();
    return {
      action,
      response,
      patient: action.getPatient(),
      shouldShowResponse: !!response && !this.shouldUpdate,
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
    iframe: '.js-iframe iframe',
    update: '.js-update',
  },
  triggers: {
    'click @ui.update': 'click:update',
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
  onClickUpdate() {
    this.shouldUpdate = true;
    const sidebar = this.detachChildView('sidebar');
    this.render();
    this.showChildView('sidebar', sidebar);
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
