import _ from 'underscore';

import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import { renderTemplate } from 'js/i18n';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

import PreloadRegion from 'js/regions/preload_region';

import Droplist from 'js/components/droplist';
import Tooltip from 'js/components/tooltip';

import { StateComponent, OwnerComponent, DueComponent } from 'js/views/patients/actions/actions_views';

import './view-list.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.view.viewViews.emptyView }}</h2>
    </td>
  `,
});

const ItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  template: hbs`
    <td class="table-list__cell w-15 view-list__patient-name js-patient">{{ patient.first_name }} {{ patient.last_name }}</td>
    <td class="table-list__cell w-40"><span class="view-list__name-icon">{{far "file-alt"}}</span>{{ name }}</td>
    <td class="table-list__cell w-30">
      <span class="table-list__meta" data-state-region></span><span class="table-list__meta" data-owner-region></span><span class="table-list__meta" data-due-region></span>
    </td>
    <td class="table-list__cell view-list__action-ts w-15">{{formatMoment updated_at "TIME_OR_DAY"}}</td>
  `,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
  },
  templateContext() {
    return {
      patient: this.model.getPatient().attributes,
    };
  },
  triggers: {
    'click': 'click',
    'click .js-patient': 'click:patient',
  },
  onClick() {
    Radio.trigger('event-router', 'patient:action', this.model.get('_patient'), this.model.id);
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.get('_patient'));
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDue();
  },
  showState() {
    const stateComponent = new StateComponent({ model: this.model, isCompact: true });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isDone();
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const isDisabled = this.model.isDone();
    const dueComponent = new DueComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(dueComponent, 'change:due', date => {
      this.model.saveDue(date);
    });

    this.showChildView('due', dueComponent);
  },
});

const LayoutView = View.extend({
  className: 'flex-region',
  template: hbs`
    <div class="list-page__header">
      <div class="list-page__title">{{formatMessage (intlGet "patients.view.viewViews.listTitles") title=viewId role=role}}<span class="list-page__header-icon js-title-info">{{fas "info-circle"}}</span></div>
      <div class="list-page__filters" data-filters-region></div>
      <table class="w-100 js-list-header"><tr>
        <td class="table-list__header w-15">{{ @intl.patients.view.viewViews.layoutView.patientHeader }}</td>
        <td class="table-list__header w-40">{{ @intl.patients.view.viewViews.layoutView.actionHeader }}</td>
        <td class="table-list__header w-30">{{ @intl.patients.view.viewViews.layoutView.attrHeader }}</td>
        <td class="table-list__header w-15">{{ @intl.patients.view.viewViews.layoutView.updatedHeader }}</td>
      </tr></table>
    </div>
    <div class="flex-region list-page__list js-list" data-list-region></div>
  `,
  templateContext() {
    const currentClinician = Radio.request('auth', 'currentUser');

    return {
      role: currentClinician.getRole().get('name'),
      viewId: _.underscored(this.getOption('viewId')),
    };
  },
  regions: {
    filters: '[data-filters-region]',
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
  },
  childViewEvents: {
    'update:listDom': 'fixWidth',
  },
  ui: {
    listHeader: '.js-list-header',
    list: '.js-list',
    tooltip: '.fa-info-circle',
  },
  onRender() {
    const template = hbs`{{formatMessage (intlGet "patients.view.viewViews.listTooltips") title=viewId role=role}}`;
    new Tooltip({
      message: renderTemplate(template, this.templateContext()),
      uiView: this,
      ui: this.ui.tooltip,
      orientation: 'vertical',
    });
  },
  initialize() {
    const userActivityCh = Radio.channel('user-activity');
    this.listenTo(userActivityCh, 'window:resize', this.fixWidth);
  },
  fixWidth() {
    /* istanbul ignore if */
    if (!this.isRendered()) return;

    const headerWidth = this.ui.listHeader.width();
    const listWidth = this.ui.list.contents().width();
    const listPadding = parseInt(this.ui.list.css('paddingRight'), 10);
    const scrollbarWidth = headerWidth - listWidth;

    this.ui.list.css({ paddingRight: `${ listPadding - scrollbarWidth }px` });
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  emptyView: EmptyView,
  onAttach() {
    this.triggerMethod('update:listDom', this);
  },
  /* istanbul ignore next: future proof */
  onRenderChildren() {
    if (!this.isAttached()) return;
    this.triggerMethod('update:listDom', this);
  },
});

const GroupsDropList = Droplist.extend({
  viewOptions: {
    className: 'button-filter',
    template: hbs`{{ name }}{{far "angle-down"}}`,
  },
  picklistOptions: {
    attr: 'name',
  },
});

export {
  LayoutView,
  ListView,
  GroupsDropList,
};
